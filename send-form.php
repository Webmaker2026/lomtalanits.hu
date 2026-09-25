<?php
/**
 * =============================================================================
 *  lomtalanits.hu — ajánlatkérő űrlap feldolgozása
 * =============================================================================
 *  - kizárólag POST kérést fogad
 *  - ellenőrzi a kötelező mezőket
 *  - validálja az e-mail címet, ha megadták
 *  - tisztítja a bejövő adatokat (vezérlőkarakterek, hosszlimit)
 *  - védekezik mail header injection ellen
 *  - ellenőrzi a honeypot mezőt
 *  - UTF-8 levelet küld
 *  - az ügyfél e-mail címét csak szigorú validáció után használja Reply-To-ként
 *  - hiba esetén nem mutat PHP hibát, stack trace-t vagy szerverinformációt
 *  - SIKERES küldés esetén (és csak akkor) átirányít a /koszonjuk.html oldalra
 * =============================================================================
 */

/* --- semmilyen PHP hiba ne jelenjen meg a látogatónak ---------------------- */
@ini_set('display_errors', '0');
@ini_set('display_startup_errors', '0');
@ini_set('html_errors', '0');
error_reporting(0);

/* =============================================================================
   ÉLESÍTÉS ELŐTT KITÖLTENDŐ BEÁLLÍTÁSOK
   ========================================================================== */

// IDE ÍRD A VALÓDI CÍMZETT E-MAIL CÍMET
define('LOM_RECIPIENT', 'EMAIL_CIM_HELYE');

// A levél feladója. FONTOS: a saját domainen lévő cím legyen (SPF/DMARC miatt),
// különben a tárhely vagy a fogadó szerver eldobhatja a levelet.
define('LOM_SENDER', 'noreply@lomtalanits.hu');
define('LOM_SENDER_NAME', 'lomtalanits.hu ajanlatkero');

/* ========================== BEÁLLÍTÁSOK VÉGE ============================== */

/**
 * Átirányítás és futás vége.
 */
function lom_redirect($location)
{
    if (!headers_sent()) {
        header('Cache-Control: no-store, no-cache, must-revalidate');
        header('Location: ' . $location, true, 303);
    }
    exit;
}

/** Vissza az űrlapra hibakóddal (a main.js jeleníti meg a szöveget). */
function lom_back($code)
{
    lom_redirect('/?form=' . rawurlencode($code) . '#ajanlatkeres');
}

/**
 * Bejövő szöveg tisztítása.
 * A vezérlőkaraktereket bájt szinten távolítjuk el – ez UTF-8 biztos, mert a
 * 0x00–0x1F bájtok soha nem fordulnak elő több bájtos UTF-8 szekvencia belsejében.
 */
function lom_clean($value, $maxLength, $allowNewlines = false)
{
    if (!is_string($value)) {
        return '';
    }

    // érvénytelen UTF-8 eldobása, ha az mbstring elérhető
    if (function_exists('mb_check_encoding') && !mb_check_encoding($value, 'UTF-8')) {
        return '';
    }

    $pattern = $allowNewlines
        ? '/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/'   // \r és \n megmarad
        : '/[\x00-\x1F\x7F]/';                   // egysoros mező: minden vezérlőkarakter ki

    $value = preg_replace($pattern, '', $value);
    if ($value === null) {
        return '';
    }

    if ($allowNewlines) {
        $collapsed = preg_replace("/(\r\n|\r|\n){3,}/", "\n\n", $value);
        if (is_string($collapsed)) {
            $value = $collapsed;
        }
    }

    $value = trim($value);

    if (function_exists('mb_substr')) {
        $value = mb_substr($value, 0, $maxLength, 'UTF-8');
    } else {
        $value = substr($value, 0, $maxLength);
    }

    return $value;
}

/** Hosszúság karakterben (mbstring nélkül is működik). */
function lom_length($value)
{
    return function_exists('mb_strlen') ? mb_strlen($value, 'UTF-8') : strlen($value);
}

/** MIME fejléc kódolás UTF-8 tartalomhoz. */
function lom_encode_header($value)
{
    if (preg_match('/^[\x20-\x7E]*$/', $value) === 1) {
        return $value; // tiszta ASCII: nem kell kódolni
    }
    return '=?UTF-8?B?' . base64_encode($value) . '?=';
}

/**
 * Fejlécbe kerülő érték biztonsági ellenőrzése.
 * Bármilyen sortörés vagy vezérlőkarakter esetén elutasítjuk (header injection).
 */
function lom_header_safe($value)
{
    return is_string($value) && $value !== '' && preg_match('/[\r\n\x00]/', $value) !== 1;
}

/* -----------------------------------------------------------------------------
   1. Csak POST
   -------------------------------------------------------------------------- */
$method = isset($_SERVER['REQUEST_METHOD']) ? strtoupper($_SERVER['REQUEST_METHOD']) : '';
if ($method !== 'POST') {
    lom_back('modszer');
}

/* -----------------------------------------------------------------------------
   2. Honeypot — ha kitöltötték, a levelet NEM küldjük el
   -------------------------------------------------------------------------- */
$honeypot = isset($_POST['website']) ? (string) $_POST['website'] : '';
if (trim($honeypot) !== '') {
    // Bot: csendben a főoldalra irányítunk, levél és konverzió nélkül.
    lom_redirect('/');
}

/* -----------------------------------------------------------------------------
   3. Bejövő adatok tisztítása
   -------------------------------------------------------------------------- */
$name     = lom_clean(isset($_POST['name']) ? $_POST['name'] : '', 120);
$tel      = lom_clean(isset($_POST['tel']) ? $_POST['tel'] : '', 40);
$email    = lom_clean(isset($_POST['email']) ? $_POST['email'] : '', 160);
$location = lom_clean(isset($_POST['location']) ? $_POST['location'] : '', 120);
$service  = lom_clean(isset($_POST['service']) ? $_POST['service'] : '', 60);
$message  = lom_clean(isset($_POST['message']) ? $_POST['message'] : '', 2000, true);
$consent  = isset($_POST['consent']) ? (string) $_POST['consent'] : '';

/* -----------------------------------------------------------------------------
   4. Kötelező mezők ellenőrzése
   -------------------------------------------------------------------------- */
$allowedServices = array(
    'Lomtalanítás',
    'Teljes lakáskiürítés',
    'Hagyatéki lakás kiürítése',
    'Pincekiürítés',
    'Padláskiürítés',
    'Garázskiürítés',
    'Bútor elszállítás',
    'Egyéb',
);

$errors = 0;

if (lom_length($name) < 2) {
    $errors++;
}

$telDigits = preg_replace('/\D/', '', $tel);
if ($telDigits === null || strlen($telDigits) < 6) {
    $errors++;
}

if (lom_length($location) < 2) {
    $errors++;
}

if (!in_array($service, $allowedServices, true)) {
    $errors++;
}

if ($consent !== '1') {
    $errors++;
}

// az e-mail nem kötelező, de ha megadták, érvényesnek kell lennie
$replyTo = '';
if ($email !== '') {
    $valid = filter_var($email, FILTER_VALIDATE_EMAIL);
    if ($valid === false || !lom_header_safe($email) || lom_length($email) > 160) {
        $errors++;
        $email = '';
    } else {
        $replyTo = $valid;
    }
}

if ($errors > 0) {
    lom_back('adatok');
}

/* -----------------------------------------------------------------------------
   5. A levél összeállítása
   -------------------------------------------------------------------------- */
$recipient = LOM_RECIPIENT;

// Ha a címzett még placeholder vagy érvénytelen, nem próbálunk küldeni.
if (strpos($recipient, 'EMAIL_CIM_HELYE') !== false
    || filter_var($recipient, FILTER_VALIDATE_EMAIL) === false
    || !lom_header_safe($recipient)) {
    lom_back('beallitas');
}

if (!function_exists('mail')) {
    lom_back('hiba');
}

$subjectRaw = 'Új ajánlatkérés – ' . $service . ' – ' . $location;
$subject    = lom_encode_header(lom_clean($subjectRaw, 150));

$lines = array(
    'Új ajánlatkérés érkezett a lomtalanits.hu weboldalról.',
    '',
    '-------------------------------------------',
    'Név:                 ' . $name,
    'Telefonszám:         ' . $tel,
    'E-mail:              ' . ($email !== '' ? $email : '(nem adta meg)'),
    'Település / kerület: ' . $location,
    'Kért munka:          ' . $service,
    '-------------------------------------------',
    '',
    'Rövid leírás:',
    ($message !== '' ? $message : '(nem adott meg leírást)'),
    '',
    '-------------------------------------------',
    'Adatkezelési hozzájárulás: megadva',
    'Beküldés ideje: ' . date('Y-m-d H:i:s'),
    'Forrás: ' . (isset($_SERVER['HTTP_HOST']) && lom_header_safe($_SERVER['HTTP_HOST'])
        ? lom_clean($_SERVER['HTTP_HOST'], 120)
        : 'lomtalanits.hu'),
);

$body = implode("\r\n", $lines);
$body = str_replace(array("\r\n", "\r"), "\n", $body);
$body = str_replace("\n", "\r\n", $body);

/* Fejlécek: kizárólag saját, ellenőrzött értékekből építjük -------------------
   Az ügyfél által megadott e-mail cím csak akkor kerül Reply-To fejlécbe,
   ha átment a FILTER_VALIDATE_EMAIL ellenőrzésen, és nem tartalmaz
   sortörést vagy vezérlőkaraktert. Megjelenítendő nevet nem fűzünk hozzá. */
$headers = array(
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'From: ' . lom_encode_header(LOM_SENDER_NAME) . ' <' . LOM_SENDER . '>',
    'X-Mailer: lomtalanits.hu',
);

if ($replyTo !== '' && lom_header_safe($replyTo)) {
    $headers[] = 'Reply-To: ' . $replyTo;
}

/* -----------------------------------------------------------------------------
   6. Küldés — átirányítás KIZÁRÓLAG sikeres küldés esetén
   -------------------------------------------------------------------------- */
$sent = @mail($recipient, $subject, $body, implode("\r\n", $headers));

if ($sent !== true) {
    // Nem volt sikeres a küldés: nem irányítunk a köszönőoldalra,
    // így hibás küldésből nem jön létre űrlap-konverzió sem.
    lom_back('hiba');
}

lom_redirect('/koszonjuk.html');
