/* Projekt Design — ortak efektler: metinler satır satır belirir, görseller aşağıdan yukarı kayarak gelir */
(function () {
  var D = document, H = D.documentElement, W = window;
  if (W.__pdFX) return; W.__pdFX = true;
  if (W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var TEXT = 'h1,h2,h3,blockquote,p:not(.pd-lbl)';
  var SKIP = 'header,#pd-menu,.pd-burger';
  var done = [], imgs = [], io = null, active = false;

  function body() { return D.body; }
  function editing() {
    var B = body();
    return H.hasAttribute('data-dc-canvas') || (B && B.hasAttribute('data-dc-editor-on')) || !!D.querySelector('[contenteditable]');
  }

  function split(el) {
    if (el.__rv) return;
    var words = [], keep = [];
    var tw = D.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), n, list = [];
    while ((n = tw.nextNode())) if (n.nodeValue.trim()) list.push(n);
    list.forEach(function (t) {
      var wrap = D.createElement('span'); wrap.className = 'rv-t';
      t.nodeValue.split(/(\s+)/).forEach(function (p) {
        if (!p) return;
        if (/^\s+$/.test(p)) { wrap.appendChild(D.createTextNode(p)); return; }
        var s = D.createElement('span'); s.className = 'rv-w'; s.textContent = p;
        wrap.appendChild(s); words.push(s);
      });
      keep.push({ node: t, text: t.nodeValue, wrap: wrap });
      t.parentNode.insertBefore(wrap, t); t.nodeValue = '';
    });
    el.__rv = { words: words, keep: keep };
    el.classList.add('rv-host'); done.push(el);
  }

  function lines(el) {
    var top = null, li = -1;
    el.__rv.words.forEach(function (w) {
      var y = Math.round(w.getBoundingClientRect().top);
      if (top === null || Math.abs(y - top) > 4) { li++; top = y; }
      w.style.setProperty('--l', li);
    });
  }

  function show(el) {
    if (el.__rv) { lines(el); void el.offsetWidth; }
    el.classList.add('rv-in');
  }

  function restore() {
    done.forEach(function (el) {
      var r = el.__rv; if (!r) return;
      r.keep.forEach(function (k) { if (k.wrap.parentNode) k.wrap.parentNode.removeChild(k.wrap); k.node.nodeValue = k.text; });
      el.classList.remove('rv-host', 'rv-in'); el.__rv = null;
    });
    imgs.forEach(function (el) { el.classList.remove('rv-img', 'rv-in'); el.style.transitionDelay = ''; });
    done = []; imgs = [];
    if (io) { io.disconnect(); io = null; }
    active = false;
  }

  function start() {
    if (active || W.__pdFXoff || editing()) return;
    active = true;
    io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.01 });

    D.querySelectorAll(TEXT).forEach(function (el) {
      if (el.closest(SKIP)) return;
      if (el.parentElement && el.parentElement.closest('.rv-host')) return;
      split(el); io.observe(el);
    });

    // Marka şeridi: kartlar soldan sağa, kısa aralıklarla sırayla gelir
    D.querySelectorAll('.pd-row').forEach(function (row) {
      var cards = row.querySelectorAll('.pd-card');
      cards.forEach(function (c, i) {
        c.classList.add('rv-img'); c.style.transitionDelay = (i * 110) + 'ms'; imgs.push(c);
      });
      var rio = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          cards.forEach(function (c) { c.classList.add('rv-in'); });
          rio.disconnect();
        });
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0.01 });
      rio.observe(row);
    });

    D.querySelectorAll('img').forEach(function (img) {
      if (img.closest(SKIP) || img.closest('footer') || img.closest('.pd-row')) return;
      var box = img.parentElement;
      if (!box || box.tagName === 'SECTION') return; // banner arka planları sabit kalır
      if (box.classList.contains('rv-img')) return;
      box.classList.add('rv-img'); imgs.push(box); io.observe(box);
    });
  }

  function off() { W.__pdFXoff = true; restore(); }

  D.addEventListener('focusin', function (e) { if (e.target && e.target.isContentEditable) off(); }, true);
  D.addEventListener('dblclick', function () { if (W.self !== W.top) off(); }, true);
  new MutationObserver(function () { if (D.querySelector('[contenteditable]')) off(); })
    .observe(H, { subtree: true, attributes: true, attributeFilter: ['contenteditable'] });
  var watch = new MutationObserver(function () { if (editing()) restore(); else start(); });
  watch.observe(H, { attributes: true, attributeFilter: ['data-dc-canvas'] });

  function go() {
    var B = body();
    if (B) watch.observe(B, { attributes: true, attributeFilter: ['data-dc-editor-on'] });
    (D.fonts && D.fonts.ready ? D.fonts.ready : Promise.resolve()).then(function () { setTimeout(start, 120); });
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', go); else go();
})();
