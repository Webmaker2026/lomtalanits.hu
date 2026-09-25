/* =============================================================================
   lomtalanits.hu — Google Consent Mode v2 + cookie banner
   -----------------------------------------------------------------------------
   Ez a fájl SZINKRONOSAN fut az <head>-ben, MINDEN mérési script előtt, hogy a
   hozzájárulás alapállapota biztosan a Google tag betöltése előtt beálljon.

   A rendszer akkor sem törik el, ha a Google script nem töltődik be
   (adblocker, hálózati hiba, placeholder azonosító).
   ========================================================================== */
(function () {
  'use strict';

  /* ===========================================================================
     ÉLESÍTÉS ELŐTT KITÖLTENDŐ – GOOGLE ADS AZONOSÍTÓK
     ---------------------------------------------------------------------------
     conversionId : a Google Ads konverziós azonosító,   pl. 'AW-123456789'
     phoneLabel   : a TELEFONHÍVÁS konverzió label-je,   pl. 'AbCdEfGhIj-K'
     formLabel    : az ŰRLAP konverzió label-je,         pl. 'XyZwVuTsRq-L'

     Amíg ezek placeholder értékek, a Google tag NEM töltődik be
     (így nincs hibás kérés és nincs console error sem).
     =========================================================================== */
  var LOM_ADS = {
    conversionId: 'AW-CONVERSION_ID',
    phoneLabel: 'PHONE_CONVERSION_LABEL',
    formLabel: 'FORM_CONVERSION_LABEL'
  };
  /* ======================= AZONOSÍTÓ BLOKK VÉGE ============================ */

  var STORAGE_KEY = 'lom_consent_v1';

  function isPlaceholder(value) {
    return !value ||
      value.indexOf('CONVERSION_ID') > -1 ||
      value.indexOf('CONVERSION_LABEL') > -1;
  }

  LOM_ADS.ready = !isPlaceholder(LOM_ADS.conversionId);
  LOM_ADS.phoneReady = LOM_ADS.ready && !isPlaceholder(LOM_ADS.phoneLabel);
  LOM_ADS.formReady = LOM_ADS.ready && !isPlaceholder(LOM_ADS.formLabel);
  window.LOM_ADS = LOM_ADS;

  /* --------------------------------------------------------------------------
     dataLayer + gtag shim — akkor is létezik, ha a Google script nem jön meg
     -------------------------------------------------------------------------- */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  if (typeof window.gtag !== 'function') { window.gtag = gtag; }

  /* --------------------------------------------------------------------------
     Tárolás — minden hozzáférés védett, privát módban sem dobhat hibát
     -------------------------------------------------------------------------- */
  function readState() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) { return null; }
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') { return null; }
      return {
        analytics: parsed.analytics === true,
        marketing: parsed.marketing === true,
        ts: typeof parsed.ts === 'number' ? parsed.ts : 0
      };
    } catch (err) {
      return null;
    }
  }

  function writeState(state) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        analytics: state.analytics === true,
        marketing: state.marketing === true,
        ts: Date.now()
      }));
    } catch (err) {
      /* a hozzájárulás ilyenkor csak az aktuális oldalbetöltésre érvényes */
    }
  }

  function toSignals(state) {
    var ads = state && state.marketing ? 'granted' : 'denied';
    return {
      ad_storage: ads,
      ad_user_data: ads,
      ad_personalization: ads,
      analytics_storage: state && state.analytics ? 'granted' : 'denied'
    };
  }

  function pushConsent(type, payload) {
    try { window.gtag('consent', type, payload); } catch (err) { /* némán tovább */ }
  }

  /* --------------------------------------------------------------------------
     1. ALAPÁLLAPOT — hozzájárulás előtt minden mérési tárolás tiltva
     -------------------------------------------------------------------------- */
  pushConsent('default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500
  });

  /* 2. Korábbi döntés visszaállítása (visszatérő látogató) */
  var savedState = readState();
  if (savedState) { pushConsent('update', toSignals(savedState)); }

  /* --------------------------------------------------------------------------
     3. Google tag bootstrap — kizárólag valódi konverziós azonosítóval
     -------------------------------------------------------------------------- */
  if (LOM_ADS.ready) {
    try {
      window.gtag('js', new Date());
      window.gtag('config', LOM_ADS.conversionId);

      var tag = document.createElement('script');
      tag.async = true;
      tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(LOM_ADS.conversionId);
      tag.onerror = function () { /* adblocker vagy hálózati hiba: az oldal működik tovább */ };
      (document.head || document.documentElement).appendChild(tag);
    } catch (err) { /* a mérés hibája soha nem állíthatja meg az oldalt */ }
  }

  /* --------------------------------------------------------------------------
     4. Banner + beállítások panel
     -------------------------------------------------------------------------- */
  function initUI() {
    var banner = document.getElementById('cookie-banner');
    var modal = document.getElementById('consent-modal');
    var boxAnalytics = document.getElementById('c-analytics');
    var boxMarketing = document.getElementById('c-marketing');
    var lastFocused = null;

    function showBanner() { if (banner) { banner.hidden = false; } }
    function hideBanner() { if (banner) { banner.hidden = true; } }

    function syncCheckboxes() {
      var state = readState() || { analytics: false, marketing: false };
      if (boxAnalytics) { boxAnalytics.checked = state.analytics; }
      if (boxMarketing) { boxMarketing.checked = state.marketing; }
    }

    function openModal() {
      if (!modal) { return; }
      syncCheckboxes();
      lastFocused = document.activeElement;
      modal.hidden = false;
      document.documentElement.classList.add('is-locked');
      var first = modal.querySelector('input:not([disabled]), button:not(.modal__backdrop)');
      if (first && typeof first.focus === 'function') { first.focus(); }
    }

    function closeModal() {
      if (!modal || modal.hidden) { return; }
      modal.hidden = true;
      if (!document.body.classList.contains('nav-open')) {
        document.documentElement.classList.remove('is-locked');
      }
      if (lastFocused && typeof lastFocused.focus === 'function') { lastFocused.focus(); }
      lastFocused = null;
    }

    function apply(state) {
      writeState(state);
      pushConsent('update', toSignals(state));
      hideBanner();
      closeModal();
    }

    /* egyetlen, delegált listener — nincs duplikált eseménykezelő */
    document.addEventListener('click', function (event) {
      var target = event.target;
      if (!target || typeof target.closest !== 'function') { return; }

      if (target.closest('[data-consent-accept]')) {
        apply({ analytics: true, marketing: true });
        return;
      }
      if (target.closest('[data-consent-reject]')) {
        apply({ analytics: false, marketing: false });
        return;
      }
      if (target.closest('[data-consent-save]')) {
        apply({
          analytics: !!(boxAnalytics && boxAnalytics.checked),
          marketing: !!(boxMarketing && boxMarketing.checked)
        });
        return;
      }
      if (target.closest('[data-consent-open]')) {
        event.preventDefault();
        openModal();
        return;
      }
      if (target.closest('[data-consent-close]')) {
        closeModal();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && modal && !modal.hidden) { closeModal(); }
    });

    /* a banner csak akkor jelenik meg, ha még nincs eltárolt döntés */
    if (!readState()) { showBanner(); }
    syncCheckboxes();

    /* a footer / jogi blokk gombjai számára */
    window.LOM_CONSENT = { open: openModal, close: closeModal, state: readState };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUI);
  } else {
    initUI();
  }
}());
