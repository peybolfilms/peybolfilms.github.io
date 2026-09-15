// Peybolfilms — top scroll-progress line (replaces the native scrollbar).
// Self-contained: injects its own 2px bar, tracks window scroll or, on pages
// whose content lives in a fixed inner scroller, that element instead.
(function () {
  if (window.__pfProgress) return;
  window.__pfProgress = true;

  // paint the site background before any stylesheet lands, so the first frame
  // is never a white flash
  document.documentElement.style.background = '#05070a';

  var css = document.createElement('style');
  css.textContent =
    'html{scrollbar-width:none;-ms-overflow-style:none}' +
    'html::-webkit-scrollbar,body::-webkit-scrollbar{width:0;height:0}' +
    // text blur-in: headings and paragraphs come into focus as they enter the
    // viewport, the way the reference template resolves its type
    '[data-pf-blur="0"]{filter:blur(9px);opacity:.001;' +
    '  transition:filter 900ms cubic-bezier(.16,1,.3,1),opacity 700ms ease}' +
    '[data-pf-blur="1"]{filter:blur(0);opacity:1;' +
    '  transition:filter 900ms cubic-bezier(.16,1,.3,1),opacity 700ms ease}' +
    '@media (prefers-reduced-motion:reduce){[data-pf-blur]{filter:none;opacity:1}}';
  document.head.appendChild(css);

  var track = document.createElement('div');
  track.setAttribute('aria-hidden', 'true');
  track.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:60;height:2px;background:rgba(237,230,216,.10);pointer-events:none';
  var fill = document.createElement('div');
  fill.style.cssText = 'height:100%;width:100%;transform:scaleX(0);transform-origin:0 50%;background:#ede6d8;box-shadow:0 0 12px rgba(237,230,216,.45)';
  track.appendChild(fill);
  var mount = function () { document.body.appendChild(track); };
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);

  var scrollers = [];
  var scan = function () {
    scrollers = [];
    var all = document.querySelectorAll('div,main,section');
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (el === track) continue;
      var oy = getComputedStyle(el).overflowY;
      if ((oy === 'auto' || oy === 'scroll') && el.scrollHeight - el.clientHeight > 40) scrollers.push(el);
    }
  };
  scan();
  setInterval(scan, 1500);

  // ---- text blur-in ------------------------------------------------------
  var seen = 'pfBlurSeen';
  var io = new IntersectionObserver(function (rows) {
    rows.forEach(function (r) {
      if (r.isIntersecting) { r.target.setAttribute('data-pf-blur', '1'); io.unobserve(r.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });

  var arm = function () {
    var els = document.querySelectorAll('h1,h2,h3,p');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.dataset[seen]) continue;
      el.dataset[seen] = '1';
      var r = el.getBoundingClientRect();
      // already on screen at load: let the page's own entrance own it
      if (r.top < window.innerHeight * 0.92 && r.bottom > 0) { el.setAttribute('data-pf-blur', '1'); continue; }
      el.setAttribute('data-pf-blur', '0');
      io.observe(el);
    }
  };
  var startArm = function () { arm(); setInterval(arm, 900); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startArm);
  else startArm();

  var target = 0, shown = 0;
  var read = function () {
    var wm = Math.max(0, (document.documentElement.scrollHeight || 0) - window.innerHeight);
    if (wm > 40) return (window.scrollY || document.documentElement.scrollTop || 0) / wm;
    var best = 0;
    for (var i = 0; i < scrollers.length; i++) {
      var el = scrollers[i];
      if (!el.offsetParent && el.style.position !== 'fixed') continue;
      var m = el.scrollHeight - el.clientHeight;
      if (m > 40) best = Math.max(best, el.scrollTop / m);
    }
    return best;
  };

  (function tick() {
    target = read();
    shown += (target - shown) * 0.12;
    var v = shown < 0 ? 0 : shown > 1 ? 1 : shown;
    fill.style.transform = 'scaleX(' + v.toFixed(4) + ')';
    requestAnimationFrame(tick);
  })();
})();
