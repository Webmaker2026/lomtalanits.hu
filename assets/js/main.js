/* =============================================================================
   lomtalanits.hu — UI logika + Google Ads konverziómérés
   -----------------------------------------------------------------------------
   - sticky header állapot
   - hamburger menü (aria-expanded, scroll-lock, ESC, menüpontra bezárás)
   - GYIK accordion (aria-expanded)
   - TELEFONHÍVÁS konverzió: egyetlen delegált listener, a hívást SOHA nem blokkolja
   - ŰRLAP konverzió: kizárólag a koszonjuk.html oldalon (tényleges siker után)
   - ajánlatkérő űrlap kliensoldali validációja érthető hibaüzenetekkel
   - footer évszám
   ========================================================================== */
(function () {
  'use strict';

  var doc = document;

  /* ==========================================================================
     1. Sticky header
     ========================================================================== */
  (function stickyHeader() {
    var header = doc.getElementById('site-header');
    if (!header) { return; }

    var ticking = false;

    function update() {
      ticking = false;
      if (window.pageYOffset > 8) { header.classList.add('is-scrolled'); }
      else { header.classList.remove('is-scrolled'); }
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });

    update();
  }());

  /* ==========================================================================
     2. Mobil menü
     ========================================================================== */
  (function mobileNav() {
    var toggle = doc.getElementById('nav-toggle');
    var panel = doc.getElementById('mobile-nav');
    if (!toggle || !panel) { return; }

    function isOpen() { return toggle.getAttribute('aria-expanded') === 'true'; }

    function open() {
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Menü bezárása');
      panel.hidden = false;
      doc.body.classList.add('nav-open');
      doc.documentElement.classList.add('is-locked');
    }

    function close(returnFocus) {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Menü megnyitása');
      panel.hidden = true;
      doc.body.classList.remove('nav-open');
      var modal = doc.getElementById('consent-modal');
      if (!modal || modal.hidden) { doc.documentElement.classList.remove('is-locked'); }
      if (returnFocus) { toggle.focus(); }
    }

    toggle.addEventListener('click', function () {
      if (isOpen()) { close(false); } else { open(); }
    });

    /* menüpont választásakor bezárás, hogy a horgony görgetése látszódjon */
    panel.addEventListener('click', function (event) {
      var link = event.target.closest ? event.target.closest('a') : null;
      if (link) { close(false); }
    });

    doc.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && isOpen()) { close(true); }
    });

    /* ha desktop nézetre vált a felhasználó, ne maradjon nyitva */
    window.addEventListener('resize', function () {
      if (isOpen() && window.innerWidth >= 1120) { close(false); }
    });
  }());

  /* ==========================================================================
     3. GYIK accordion
     ========================================================================== */
  (function faq() {
    var root = doc.getElementById('faq');
    if (!root) { return; }

    root.addEventListener('click', function (event) {
      var button = event.target.closest ? event.target.closest('.faq__q') : null;
      if (!button) { return; }

      var panelId = button.getAttribute('aria-controls');
      var panel = panelId ? doc.getElementById(panelId) : null;
      if (!panel) { return; }

      var expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', expanded ? 'false' : 'true');

      if (expanded) {
        panel.hidden = true;
        panel.classList.remove('is-open');
      } else {
        panel.hidden = false;
        panel.classList.add('is-open');
      }
    });
  }());

  /* ==========================================================================
     4. Footer évszám
     ========================================================================== */
  (function footerYear() {
    var slot = doc.getElementById('footer-year');
    if (slot) { slot.textContent = String(new Date().getFullYear()); }
  }());

  /* ==========================================================================
     5. TELEFONHÍVÁS KONVERZIÓ
     --------------------------------------------------------------------------
     Egyetlen delegált listener kezeli az oldal ÖSSZES tel: linkjét.
     KRITIKUS: a mérés soha nem akadályozhatja meg a hívást, ezért
     - nincs preventDefault,
     - minden hiba (nincs gtag, nincs consent, adblocker, hálózati hiba)
       csendben elnyelődik.
     ========================================================================== */
  (function phoneConversion() {
    var lastFired = 0;

    function track() {
      var ads = window.LOM_ADS;
      if (!ads || !ads.phoneReady) { return; }          // placeholder azonosító: nincs mérés
      if (typeof window.gtag !== 'function') { return; }

      var now = Date.now();
      if (now - lastFired < 800) { return; }            // dupla kattintás védelem
      lastFired = now;

      window.gtag('event', 'conversion', {
        send_to: ads.conversionId + '/' + ads.phoneLabel
      });
    }

    doc.addEventListener('click', function (event) {
      var link = event.target && event.target.closest
        ? event.target.closest('a[href^="tel:"]')
        : null;
      if (!link) { return; }
      try { track(); } catch (err) { /* a hívás ettől függetlenül elindul */ }
    });
  }());

  /* ==========================================================================
     6. ŰRLAP KONVERZIÓ — csak tényleges siker után (koszonjuk.html)
     ========================================================================== */
  (function formConversion() {
    if (!doc.body || doc.body.getAttribute('data-conversion') !== 'form') { return; }

    try {
      var ads = window.LOM_ADS;
      if (!ads || !ads.formReady) { return; }
      if (typeof window.gtag !== 'function') { return; }

      window.gtag('event', 'conversion', {
        send_to: ads.conversionId + '/' + ads.formLabel
      });
    } catch (err) { /* a köszönőoldal mérés nélkül is működik */ }
  }());

  /* ==========================================================================
     7. Ajánlatkérő űrlap — kliensoldali validáció
     ========================================================================== */
  (function quoteForm() {
    var form = doc.getElementById('quote-form');
    if (!form) { return; }

    var MESSAGES = {
      name: 'Kérjük, adja meg a nevét.',
      tel: 'Kérjük, adja meg a telefonszámát.',
      telFormat: 'Kérjük, ellenőrizze a telefonszámot (legalább 6 számjegy).',
      email: 'Kérjük, ellenőrizze az e-mail címet, vagy hagyja üresen.',
      location: 'Kérjük, adja meg a települést vagy a kerületet.',
      service: 'Kérjük, válassza ki, milyen munkára van szükség.',
      consent: 'Az ajánlatkérés elküldéséhez az adatkezelési hozzájárulás szükséges.'
    };

    var RULES = [
      { id: 'f-name', error: 'e-name', check: function (el) {
        return el.value.trim().length >= 2 ? '' : MESSAGES.name;
      } },
      { id: 'f-tel', error: 'e-tel', check: function (el) {
        var value = el.value.trim();
        if (!value) { return MESSAGES.tel; }
        var digits = value.replace(/\D/g, '');
        return digits.length >= 6 ? '' : MESSAGES.telFormat;
      } },
      { id: 'f-email', error: 'e-email', check: function (el) {
        var value = el.value.trim();
        if (!value) { return ''; }                       // nem kötelező mező
        return /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(value) ? '' : MESSAGES.email;
      } },
      { id: 'f-location', error: 'e-location', check: function (el) {
        return el.value.trim().length >= 2 ? '' : MESSAGES.location;
      } },
      { id: 'f-service', error: 'e-service', check: function (el) {
        return el.value ? '' : MESSAGES.service;
      } },
      { id: 'f-consent', error: 'e-consent', check: function (el) {
        return el.checked ? '' : MESSAGES.consent;
      } }
    ];

    function showError(rule, message) {
      var field = doc.getElementById(rule.id);
      var slot = doc.getElementById(rule.error);
      if (!field) { return; }

      if (message) {
        field.setAttribute('aria-invalid', 'true');
        if (slot) { slot.textContent = message; slot.classList.add('is-visible'); }
      } else {
        field.removeAttribute('aria-invalid');
        if (slot) { slot.textContent = ''; slot.classList.remove('is-visible'); }
      }
    }

    /* élő visszajelzés: a hiba eltűnik, amint a felhasználó javítja */
    RULES.forEach(function (rule) {
      var field = doc.getElementById(rule.id);
      if (!field) { return; }

      var events = (field.type === 'checkbox' || field.tagName === 'SELECT')
        ? ['change']
        : ['blur', 'input'];

      events.forEach(function (name) {
        field.addEventListener(name, function () {
          if (name === 'input' && !field.hasAttribute('aria-invalid')) { return; }
          showError(rule, rule.check(field));
        });
      });
    });

    form.addEventListener('submit', function (event) {
      var firstInvalid = null;

      RULES.forEach(function (rule) {
        var field = doc.getElementById(rule.id);
        if (!field) { return; }
        var message = rule.check(field);
        showError(rule, message);
        if (message && !firstInvalid) { firstInvalid = field; }
      });

      if (firstInvalid) {
        event.preventDefault();
        if (typeof firstInvalid.focus === 'function') { firstInvalid.focus(); }
        return;
      }

      /* kettős beküldés elleni védelem – konverziót itt NEM mérünk */
      var submit = form.querySelector('button[type="submit"]');
      if (submit) {
        submit.disabled = true;
        submit.textContent = 'Küldés folyamatban…';
        window.setTimeout(function () {
          submit.disabled = false;
          submit.textContent = 'Ajánlatkérés elküldése';
        }, 8000);
      }
    });
  }());

  /* ==========================================================================
     8. Szerveroldali hiba visszajelzése (send-form.php átirányítása után)
     ========================================================================== */
  (function formAlert() {
    var box = doc.getElementById('form-alert');
    var text = doc.getElementById('form-alert-text');
    if (!box || !text || !window.location.search) { return; }

    var MESSAGES = {
      adatok: 'A küldés nem sikerült: kérjük, ellenőrizze a kötelező mezőket, és próbálja újra.',
      hiba: 'Az üzenet elküldése technikai okból nem sikerült. Kérjük, hívjon minket telefonon, vagy próbálja újra később.',
      modszer: 'Érvénytelen kérés. Kérjük, töltse ki újra az ajánlatkérő űrlapot.',
      /* csak élesítés előtt fordulhat elő: a send-form.php-ben még nincs valódi címzett */
      beallitas: 'Az űrlap fogadó e-mail címe még nincs beállítva. Kérjük, hívjon minket telefonon.'
    };

    var match = /[?&]form=([a-z]+)/.exec(window.location.search);
    var key = match ? match[1] : '';
    if (!MESSAGES[key]) { return; }

    text.textContent = MESSAGES[key];
    box.classList.add('is-visible');

    /* a paraméter eltávolítása, hogy újratöltésnél ne jelenjen meg újra */
    if (window.history && typeof window.history.replaceState === 'function') {
      window.history.replaceState(null, '', window.location.pathname + '#ajanlatkeres');
    }

    var anchor = doc.getElementById('ajanlatkeres');
    if (anchor && typeof anchor.scrollIntoView === 'function') {
      anchor.scrollIntoView({ block: 'start' });
    }
  }());

}());
