===============================================================================
 LOMTALANITS.HU — FTP FELTOLTES ES ELESITESI CHECKLIST
===============================================================================

 Ez egy one-page landing page. Nincs build folyamat: nem kell npm install,
 nem kell terminalparancs. A fajlokat FTP-vel a domain gyokerebe (public_html
 / www / htdocs) kell feltolteni, es azonnal mukodik.

 Szukseges tarhely: Apache + PHP (a mail() funkcio engedelyezve).

-------------------------------------------------------------------------------
 FAJLSTRUKTURA
-------------------------------------------------------------------------------
 /
 |- index.html              <- a szolgaltatasi tartalom (one-page, horgonyos)
 |- adatkezeles.html        <- Adatkezelesi tajekoztato (kulon oldal)
 |- cookie-tajekoztato.html <- Cookie tajekoztato (kulon oldal)
 |- koszonjuk.html          <- koszono oldal az urlap bekuldese utan
 |- send-form.php           <- az ajanlatkero urlap feldolgozasa
 |- .htaccess               <- HTTPS, domain, cache, biztonsagi headerek
 |- robots.txt
 |- sitemap.xml
 |- favicon.ico
 |- favicon-32x32.png
 |- apple-touch-icon.png
 |- README-FTP.txt          <- ez a fajl (a .htaccess nem engedi publikusan)
 |
 \- assets/
    |- css/style.css
    |- js/main.js
    |- js/consent.js
    \- images/
       |- lomtalanits-logo.webp
       |- hero-lomtalanitas.webp
       |- before-01.webp
       |- after-01.webp
       |- before-02.webp
       |- after-02.webp
       \- og-lomtalanits.png

 FONTOS: a .htaccess rejtett fajl. Az FTP kliensben kapcsold be a rejtett
 fajlok mutatasat, kulonben nem toltod fel.

===============================================================================
 ELESITESI CHECKLIST
===============================================================================

 1) TELEFONSZAM CSEREJE
    Keress ra: TELEFONSZAM_HELYE   -> a tel: linkek erteke
    Keress ra: +36 XX XXX XXXX     -> a megjelenitett szoveg
    Erintett fajlok: index.html, koszonjuk.html, adatkezeles.html,
                     cookie-tajekoztato.html
    Pelda:  href="tel:TELEFONSZAM_HELYE"  ->  href="tel:+3611234567"
            +36 XX XXX XXXX               ->  +36 1 123 4567
    A tel: linkben szokoz nelkul, +36-tal kezdve add meg.
    Ellenorizd, hogy MINDEN talalat le legyen cserelve (header, hero,
    kozbensó CTA-k, arak panel, terulet panel, kapcsolat, urlap labjegyzet,
    footer, fix mobil CTA, koszonjuk.html).

 2) E-MAIL CIM CSEREJE
    Keress ra: EMAIL_CIM_HELYE
    Erintett fajlok: index.html, koszonjuk.html, adatkezeles.html,
                     cookie-tajekoztato.html, send-form.php
    A send-form.php-ben: define('LOM_RECIPIENT', 'EMAIL_CIM_HELYE');
    -> ide kell a valodi fogado e-mail cim.
    Allitsd be a felado cimet is: define('LOM_SENDER', 'noreply@lomtalanits.hu');
    A felado cim a SAJAT domainen legyen (SPF/DMARC), kulonben spam lehet.

 3) VALLALKOZASI ADATOK
    Keress ra: VALLALKOZAS_NEVE / SZEKHELY / ADOSZAM
    Erintett: adatkezeles.html (1. pont + footer), index.html (footer),
              koszonjuk.html (footer), cookie-tajekoztato.html (footer)
    Toltsd ki tovabba az adatkezeles.html-ben:
      TARHELYSZOLGALTATO_NEVE_ES_SZEKHELYE
      MEGORZESI_IDO
      DATUM (a tajekoztato utolso modositasa)

 4) LOGO  ->  MAR A VEGLEGES VAN A HELYEN
    assets/images/lomtalanits-logo.webp  (2172 x 724 px, kb. 3:1, ~140 KB)
    Az index.html es koszonjuk.html <img> tagjeiben a width/height ertekek
    ehhez a merethez vannak beallitva (width="2172" height="724") — ez a CLS
    elkeruleset szolgalja. A megjelenitett magassagot a CSS allitja:
      assets/css/style.css -> .brand img   (fejlec:  36-50 px)
                              .footer__brand img (footer: 52 px)

    HA KESOBB MAS LOGOT TOLTESZ FEL:
      - frissitsd a width/height attributumokat mind a 8 helyen
        (index.html, koszonjuk.html, adatkezeles.html es
        cookie-tajekoztato.html — mindegyikben fejlec + footer),
      - ha az aranya jelentosen mas, allitsd at a fenti CSS magassagokat.

    TELJESITMENY (nem kotelezo, de javasolt):
      A logo a fejlecben kb. 150 px szelesen jelenik meg, ezert a 2172 px
      szeles fajl feleslegesen nagy. Egy kb. 600 px szeles, ujratomoritett
      WebP (~15-25 KB) eszreveheto LCP-javulast adhat mobilon. A fajlnev
      es a kepararany maradjon ugyanaz — igy semmit nem kell atirni,
      csak a width/height attributumokat az uj merethez.

 5) HERO KEP
    assets/images/hero-lomtalanitas.webp
    A jelenlegi fajl PLACEHOLDER illusztracio. Cserelj valodi munkafotora
    (teherauto / rakodas / lakaskiurites). Javasolt: 1200 x 800 px, WebP,
    tomoritve (max ~200 KB). Ez az LCP kep: NE kapjon loading="lazy"-t.

 6) VALODI REFERENCIAKEPEK (ELOTTE / UTANA)
    assets/images/before-01.webp, after-01.webp, before-02.webp, after-02.webp
    Mind a negy PLACEHOLDER. Cserelj valodi munkafotora (800 x 600 px).
    Az index.html-ben keresd: "IDE VALODI MUNKAFOTOK KERULJENEK"
    Frissitsd az alt szovegeket is a tenyleges tartalomra.

 6/b) OG (SOCIAL) MEGOSZTASI KEP
    assets/images/og-lomtalanits.png  (1200 x 630 px)
    A jelenlegi fajl PLACEHOLDER. Cserelj olyan kepre, ami a Facebook /
    Messenger / LinkedIn megosztasnal jol mutat (logo + rovid szoveg +
    munkafoto). A hivatkozas az index.html <head> reszeben:
      <meta property="og:image" content="https://lomtalanits.hu/assets/images/og-lomtalanits.png">
    Ha mas fajlnevet vagy meretet hasznalsz, az og:image / og:image:width /
    og:image:height ertekeket is irasd at. PNG vagy JPG legyen (a WebP-t
    nem minden social platform tamogatja OG kepkent).

 7) VALODI VELEMENYEK
    index.html -> "IDE VALODI UGYFELVELEMENYEK KERULJENEK"
    A harom placeholder kartyat valodi, ugyfeltol kapott velemennyel toltsd fel.
    Ha nincs meg valodi velemeny, a teljes #velemenyek szekciot inkabb
    torold ki, mint hogy placeholder szoveg lassek.
    Kitalalt nevet, csillagszamot, ertekelest NE irj be.

 8) GOOGLE ADS CONVERSION ID
    assets/js/consent.js -> LOM_ADS blokk a fajl elejen
    conversionId: 'AW-CONVERSION_ID'  ->  pl. 'AW-123456789'
    FIGYELEM: amig placeholder ertek van itt, a Google tag NEM tolt be
    (igy nincs hibas keres es nincs console error sem).

 9) TELEFON CONVERSION LABEL
    assets/js/consent.js -> phoneLabel: 'PHONE_CONVERSION_LABEL'
    A Google Ads > Konverziok > telefonos konverzio "Cimke" erteke.

10) FORM CONVERSION LABEL
    assets/js/consent.js -> formLabel: 'FORM_CONVERSION_LABEL'
    A Google Ads > Konverziok > urlap konverzio "Cimke" erteke.

11) SEND-FORM.PHP TESZT
    Toltsd ki es kuldd el az urlapot eles tarhelyen.
    Ellenorizd, hogy megjon a levél a LOM_RECIPIENT cimre.
    Ha nem jon meg: a tarhelyen a mail() tiltott lehet, vagy a felado cim
    nincs a domainen. Ilyenkor kerd a tarhelyszolgaltatot, vagy allits be
    SMTP kuldest (ehhez a send-form.php modositasa szukseges).
    Hibakodok (a ?form= parameterben jelennek meg az urlap felett):
      ?form=adatok     -> kotelezo mezo hianyzik / hibas
      ?form=hiba       -> a mail() kuldes nem sikerult
      ?form=beallitas  -> a LOM_RECIPIENT meg placeholder
      ?form=modszer    -> nem POST keres

12) KOSZONJUK.HTML REDIRECT
    Sikeres kuldes utan a bongeszonek a /koszonjuk.html oldalra kell jutnia.
    Ellenorizd: sikertelen kuldesnel NEM jut oda (igy nincs hamis konverzio).

13) TELEFONLINK TESZT
    Mobilon minden "Hivjon most" gomb inditsa a hivast.
    Desktopon a tel: link a rendszer alkalmazasat nyitja — ez normalis.

14) TELEFONKONVERZIO TESZT
    Google Ads > Konverziok, vagy a Tag Assistant (tagassistant.google.com).
    Minden tel: linket egy kozos, delegalt listener mér (nincs inline onclick).
    KRITIKUS: a meres soha nem blokkolja a hivast. Ha nincs gtag, nincs
    consent, adblocker van vagy halozati hiba tortenik, a hivas akkor is indul.

15) FORM-KONVERZIO TESZT
    A konverzio a koszonjuk.html oldalon jon letre (body data-conversion="form"),
    nem a submit gomb kattintasara. Igy hibas kitoltes, sikertelen levelkuldes
    vagy veletlen gombnyomas nem szamit konverzionak.

16) CONSENT MODE TESZT
    Tag Assistant / bongeszo konzol: dataLayer-ben legyen consent default
    (denied) a tag betoltese ELOTT, majd elfogadas utan consent update.
    Kezelt jelek: ad_storage, ad_user_data, ad_personalization,
    analytics_storage.

17) COOKIE BEALLITASOK
    A footerben es a jogi oldalakon levo "Cookie-beallitasok" gombra
    ujra nyiljon meg a panel (nem kell kezzel localStorage-t torolni).
    A dontes a localStorage "lom_consent_v1" kulcsban tarolodik.
    Visszatero latogatonal a banner ne jelenjen meg ujra.

18) ADATKEZELESI SZOVEG VEGLEGESITESE
    adatkezeles.html (a cookie-specifikus resz: cookie-tajekoztato.html)
    A sablon szoveget a tenyleges mukodeshez kell igazitani (adatkezelo,
    megorzesi ido, adatfeldolgozok, tarhelyszolgaltato).
    A sablon onmagaban NEM garantalja a jogi megfeleloseget.
    Hulladekkezelesi / szallitasi engedelyekrol az oldal szandekosan
    nem allit semmit — csak akkor irj ilyet, ha tenylegesen megvan.

19) HTTPS REDIRECT
    Telepitett SSL tanusitvany utan probald: http://lomtalanits.hu
    -> https://lomtalanits.hu/ -re kell atiranyitania.
    www -> nem-www atiranyitas is mukodjon.
    HSTS-t csak akkor kapcsold be (.htaccess 4. blokk), ha a HTTPS mar
    veglegesen es hibatlanul mukodik.

20) MOBIL TESZT
    Probald 360 px szelessegtol nagy desktopig.
    Ellenorizd: nincs vizszintes scroll, a fix telefon CTA nem takarja
    a tartalmat / az urlap gombjat / a footert, a cookie banner nem utkozik
    a fix CTA-val, a hamburger menu nyilik-zar, a GYIK nyilik-zar.

21) SITEMAP
    https://lomtalanits.hu/sitemap.xml elerheto legyen.
    A fooldal (/), az adatkezeles.html es a cookie-tajekoztato.html
    szerepel benne. A koszonjuk.html NEM (noindex).
    Frissitsd a <lastmod> datumot elesiteskor.
    Kuldd be: Google Search Console > Sitemapek.

22) ROBOTS.TXT
    https://lomtalanits.hu/robots.txt elerheto legyen,
    es a sitemap sora a helyes domaint tartalmazza.

23) CANONICAL
    index.html: <link rel="canonical" href="https://lomtalanits.hu/">
    Ellenorizd, hogy a vegleges domain (www vagy nem-www) egyezik a
    .htaccess-ben beallitott preferalt valtozattal.

24) CORE WEB VITALS ALAPELLENORZES
    PageSpeed Insights (pagespeed.web.dev) mobil + desktop.
    - LCP: a hero kep meretet tartsd alacsonyan (WebP, ~200 KB alatt)
    - CLS: minden <img>-en legyen width/height (mar be van allitva)
    - INP: nincs kulso JS library, csak ~8 KB sajat script
    Ha OG kepet cserelsz, az is legyen tomoritve.

===============================================================================
 AMIT SZANDEKOSAN NEM TARTALMAZ AZ OLDAL
===============================================================================
 Az oldalon nincs kitalalt adat. Nem szerepel:
   - konkret ar vagy "-tol" ar
   - vallalasi / kiszallasi ido (pl. "24 oran belul", "aznap")
   - ugyfelszam, mukodesi evek, referenciaszam
   - Google ertekeles, csillagszam, review count
   - garancia, biztositas, engedely, tanusitvany, partnercég
   - "mindent elszallitunk" tipusu allitas
   - ujrahasznositasi szazalek
 Ha ezekbol valamelyik valodi adat rendelkezesre all, az beirhato — de csak
 akkor, ha tenylegesen igaz es igazolhato.

 A LocalBusiness / Service strukturalt adat (JSON-LD) szandekosan komment-
 ben van az index.html <head> reszeben, mert placeholder adatot nem
 publikalunk. A valodi cegadatok birtokaban aktivald.
 A GYIK strukturalt adat (FAQPage) EL van, es pontosan az oldalon lathato
 kerdesekkel/valaszokkal egyezik — ha a GYIK szoveget modositod, a JSON-LD-t
 is frissitsd.

===============================================================================
 KESOBBI MODOSITASOK ES A BONGESZO CACHE
===============================================================================
 A .htaccess hosszu (1 eves) cache-t ad a CSS es JS fajloknak.
 Ez jo a sebessegnek, de ha ELESITES UTAN modositod a
   assets/css/style.css  vagy  assets/js/main.js  vagy  assets/js/consent.js
 fajlt, a visszatero latogatok meg a regi verziot kaphatjak.

 Megoldas: irj at a hivatkozast MIND A NEGY HTML oldalon (index.html,
 koszonjuk.html, adatkezeles.html, cookie-tajekoztato.html)
 egy verzio-parameterrel, pl.:
   <link rel="stylesheet" href="/assets/css/style.css?v=2">
   <script src="/assets/js/consent.js?v=2"></script>
   <script src="/assets/js/main.js?v=2" defer></script>
 Legkozelebb v=3, es igy tovabb.

 A HTML fajlok NINCSENEK hosszan cache-elve, igy a telefonszam, e-mail cim
 es szovegmodositasok azonnal latszanak.
 A kepek 30 napos cache-t kapnak, igy egy kepcsere is atjut.

===============================================================================
 FAJLENGEDELYEK (ha szukseges)
===============================================================================
 Konyvtarak: 755
 Fajlok:     644
 A send-form.php-nak nem kell irasi jog.

===============================================================================
