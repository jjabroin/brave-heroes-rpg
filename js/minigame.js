/* minigame.js — 타이밍 바 미니게임 (터치/마우스/스페이스) */
(function () {
  'use strict';
  var raf = null, running = false, pos = 0, dir = 1, cb = null;
  var SPEED = 1.6; // 초당 왕복 비율

  function needle() { return document.getElementById('timing-needle'); }
  function overlay() { return document.getElementById('timing-overlay'); }

  function loop(ts, last) {
    if (!running) return;
    var now = performance.now();
    var dt = Math.min(0.05, (now - (last || now)) / 1000);
    pos += dir * dt * SPEED;
    if (pos >= 1) { pos = 1; dir = -1; }
    if (pos <= 0) { pos = 0; dir = 1; }
    var n = needle();
    if (n) n.style.left = 'calc(' + (pos * 100).toFixed(2) + '% - 4px)';
    raf = requestAnimationFrame(function () { loop(0, now); });
  }
  function judge() {
    // perfect: 44~56%, good: 34~66%
    if (pos >= 0.44 && pos <= 0.56) return { grade: 'PERFECT', mult: 1.5 };
    if (pos >= 0.34 && pos <= 0.66) return { grade: 'GOOD', mult: 1.2 };
    return { grade: 'MISS', mult: 0.7 };
  }
  function finish() {
    if (!running) return;
    running = false;
    if (raf) cancelAnimationFrame(raf);
    var r = judge();
    overlay().classList.add('hidden');
    document.removeEventListener('keydown', onKey);
    var f = cb; cb = null;
    if (f) f(r);
  }
  function onKey(e) {
    if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); finish(); }
  }
  function show(callback) {
    cb = callback;
    pos = 0; dir = 1; running = true;
    overlay().classList.remove('hidden');
    document.addEventListener('keydown', onKey);
    raf = requestAnimationFrame(function () { loop(0, 0); });
    if (window.GameAudio) window.GameAudio.unlock();
  }
  function bindUI() {
    var btn = document.getElementById('timing-hit');
    var ov = overlay();
    if (btn) {
      btn.addEventListener('click', function (e) { e.stopPropagation(); finish(); });
      btn.addEventListener('touchstart', function (e) { e.preventDefault(); e.stopPropagation(); finish(); }, { passive: false });
    }
    if (ov) {
      ov.addEventListener('click', function () { finish(); });
      ov.addEventListener('touchstart', function (e) { e.preventDefault(); finish(); }, { passive: false });
    }
  }
  window.TimingGame = { show: show, bindUI: bindUI };
})();
