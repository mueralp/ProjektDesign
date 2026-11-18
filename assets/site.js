(function () {
  // Hamburger menu
  var btn = document.querySelector('.pd-burger[aria-controls="pd-menu"]');
  var menu = document.getElementById('pd-menu');
  function setMenu(open) {
    if (!btn || !menu) return;
    menu.hidden = !open;
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
    document.body.classList.toggle('pd-menu-open', open);
  }
  if (btn && menu) {
    btn.addEventListener('click', function () { setMenu(menu.hidden); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); btn.focus(); } });
  }

  // Brand carousel: arrows + mouse drag
  var row = document.getElementById('pd-brand-row');
  if (!row) return;
  function step(dir) {
    var card = row.querySelector('.pd-card');
    var w = card ? card.getBoundingClientRect().width + 24 : row.clientWidth * 0.8;
    var max = row.scrollWidth - row.clientWidth;
    var next = row.scrollLeft + dir * w;
    if (next > max + 2) next = 0; else if (next < -2) next = max;
    row.scrollTo({ left: next, behavior: 'smooth' });
  }
  document.querySelectorAll('[data-row]').forEach(function (b) {
    b.addEventListener('click', function () { step(b.getAttribute('data-row') === 'next' ? 1 : -1); });
  });
  var drag = null, justDragged = false;
  row.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse') return;
    drag = { x: e.clientX, left: row.scrollLeft, moved: false };
    row.style.scrollBehavior = 'auto'; row.style.scrollSnapType = 'none';
  });
  row.addEventListener('pointermove', function (e) {
    if (!drag) return;
    var dx = e.clientX - drag.x;
    if (Math.abs(dx) > 4) drag.moved = true;
    row.scrollLeft = drag.left - dx;
  });
  function end() {
    if (!drag) return;
    justDragged = drag.moved; drag = null;
    row.style.scrollBehavior = 'smooth'; row.style.scrollSnapType = 'x proximity';
  }
  row.addEventListener('pointerup', end);
  row.addEventListener('pointerleave', end);
  row.addEventListener('click', function (e) { if (justDragged) { e.preventDefault(); e.stopPropagation(); justDragged = false; } }, true);
  row.addEventListener('dragstart', function (e) { e.preventDefault(); });
})();
