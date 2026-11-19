/* Twinter Labs cookie consent.
   Google Analytics loads ONLY after the visitor clicks Accept.
   Choice is saved in localStorage ("tl_consent" = "granted" | "denied").
   API: window.tlConsent.open()  -> show the banner again (footer "Cookie settings" link)
        window.tlConsent.setLang('en'|'zh') -> switch banner language (also follows <html lang>) */
(function () {
  var GA_ID = 'G-KG0RQ0JYED';
  var KEY = 'tl_consent';

  var TEXT = {
    zh: {
      msg: '我們想用 Google Analytics 計算網站造訪人數，這會使用 Cookie。你同意才會開啟。',
      accept: '同意',
      decline: '不同意',
      more: '隱私權政策'
    },
    en: {
      msg: 'We’d like to use Google Analytics cookies to count visits. They only turn on if you agree.',
      accept: 'Accept',
      decline: 'Decline',
      more: 'Privacy policy'
    }
  };

  function getChoice() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function saveChoice(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  function currentLang() {
    var q = new URLSearchParams(location.search).get('lang');
    if (q === 'en') return 'en';
    var l = (document.documentElement.getAttribute('lang') || '').toLowerCase();
    return l.indexOf('en') === 0 ? 'en' : 'zh';
  }

  var gaLoaded = false;
  function loadGA() {
    if (gaLoaded) return;
    gaLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { anonymize_ip: true });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }

  function removeGACookies() {
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (name.indexOf('_ga') === 0) {
        var host = location.hostname.replace(/^www\./, '');
        ['', '; domain=' + location.hostname, '; domain=.' + host].forEach(function (d) {
          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + d;
        });
      }
    });
  }

  var css =
    '#tl-consent{position:fixed;left:12px;right:12px;bottom:max(12px,env(safe-area-inset-bottom));z-index:60;' +
    'max-width:34rem;margin-inline:auto;background:#fff;color:#3E4B47;border:1px solid #E3E5DE;border-radius:16px;' +
    'box-shadow:0 2px 4px rgba(27,43,40,.06),0 18px 40px -18px rgba(27,43,40,.28);padding:16px;' +
    'font:15px/1.55 Inter,"Noto Sans TC",system-ui,sans-serif;transform:translateY(16px);opacity:0;transition:.25s ease}' +
    '#tl-consent.tl-show{transform:none;opacity:1}' +
    '#tl-consent p{margin:0 0 12px}' +
    '#tl-consent a{color:#105F56;font-weight:600;text-decoration:underline;text-underline-offset:.2em;cursor:pointer}' +
    '#tl-consent .tl-c-row{display:grid;grid-template-columns:1fr 1fr;gap:8px}' +
    '#tl-consent button{min-height:44px;border-radius:12px;font:inherit;font-weight:700;cursor:pointer}' +
    '#tl-consent .tl-c-yes{background:#157A6E;color:#fff;border:1px solid #157A6E}' +
    '#tl-consent .tl-c-yes:hover{background:#105F56}' +
    '#tl-consent .tl-c-no{background:#fff;color:#1B2B28;border:1px solid #C2C5BB}' +
    '#tl-consent .tl-c-no:hover{border-color:#9A4E36}' +
    '@media (prefers-reduced-motion:reduce){#tl-consent{transition:none}}';

  var box = null;

  function render() {
    if (!box) return;
    var t = TEXT[currentLang()];
    var hasModal = !!document.getElementById('privacy-modal');
    box.innerHTML =
      '<p>' + t.msg + (hasModal ? ' <a data-tl-more>' + t.more + '</a>' : '') + '</p>' +
      '<div class="tl-c-row">' +
      '<button type="button" class="tl-c-no" data-tl-no>' + t.decline + '</button>' +
      '<button type="button" class="tl-c-yes" data-tl-yes>' + t.accept + '</button>' +
      '</div>';
    box.querySelector('[data-tl-yes]').onclick = function () { saveChoice('granted'); loadGA(); hide(); };
    box.querySelector('[data-tl-no]').onclick = function () { saveChoice('denied'); removeGACookies(); hide(); };
    var more = box.querySelector('[data-tl-more]');
    if (more) more.onclick = function () { document.getElementById('privacy-modal').classList.remove('hidden'); };
  }

  function show() {
    if (!document.getElementById('tl-consent-style')) {
      var st = document.createElement('style');
      st.id = 'tl-consent-style';
      st.textContent = css;
      document.head.appendChild(st);
    }
    if (!box) {
      box = document.createElement('div');
      box.id = 'tl-consent';
      box.setAttribute('role', 'dialog');
      box.setAttribute('aria-live', 'polite');
      document.body.appendChild(box);
    }
    render();
    requestAnimationFrame(function () { box.classList.add('tl-show'); });
  }

  function hide() {
    if (!box) return;
    box.classList.remove('tl-show');
    var b = box;
    setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, 260);
    box = null;
  }

  window.tlConsent = {
    open: show,
    setLang: function () { render(); }
  };

  new MutationObserver(function () { render(); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  function start() {
    var c = getChoice();
    if (c === 'granted') loadGA();
    else if (c !== 'denied') show();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
