/* audio.js — 외부 파일 없이 WebAudio 신스 효과음+BGM (CC0 자작). 음소거 지원 */
(function () {
  'use strict';
  var ctx = null;
  var bgmTimer = null;
  var muted = false;
  try {
    var s = window.GameStorage ? window.GameStorage.load() : { mute: false };
    muted = !!s.mute;
  } catch (e) {}

  function ensureCtx() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, dur, type, vol, when, slideTo) {
    if (muted) return;
    var c = ensureCtx(); if (!c) return;
    try {
      var t = c.currentTime + (when || 0);
      var o = c.createOscillator(), g = c.createGain();
      o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol || 0.22, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(c.destination);
      o.start(t); o.stop(t + dur + 0.05);
    } catch (e) {}
  }
  var SFX = {
    unlock: function () { ensureCtx(); },
    click: function () { tone(660, 0.08, 'square', 0.12); tone(880, 0.08, 'square', 0.1, 0.06); },
    hit: function () { tone(180, 0.18, 'sawtooth', 0.25, 0, 60); tone(90, 0.2, 'square', 0.15, 0.02); },
    crit: function () { tone(220, 0.12, 'sawtooth', 0.28, 0, 90); tone(440, 0.15, 'square', 0.2, 0.08, 880); tone(880, 0.2, 'square', 0.18, 0.16); },
    heal: function () { tone(520, 0.15, 'sine', 0.2); tone(660, 0.15, 'sine', 0.2, 0.1); tone(880, 0.25, 'sine', 0.2, 0.2); },
    aoe: function () { tone(300, 0.3, 'sawtooth', 0.2, 0, 120); tone(150, 0.35, 'triangle', 0.22, 0.05, 70); },
    miss: function () { tone(240, 0.15, 'sine', 0.15, 0, 160); },
    win: function () { var n = [523, 659, 784, 1047]; for (var i = 0; i < n.length; i++) tone(n[i], 0.22, 'triangle', 0.22, i * 0.13); },
    lose: function () { var n = [400, 340, 280, 200]; for (var i = 0; i < n.length; i++) tone(n[i], 0.25, 'sawtooth', 0.15, i * 0.16); }
  };
  // 밝은 8비트풍 BGM 루프 (C–F–G–C 진행)
  var melody = [523, 587, 659, 784, 880, 784, 659, 587, 523, 659, 784, 659, 587, 523, 440, 523];
  var step = 0;
  function startBgm() {
    if (bgmTimer) return;
    bgmTimer = setInterval(function () {
      if (muted) return;
      var f = melody[step % melody.length];
      tone(f, 0.22, 'triangle', 0.07);
      if (step % 4 === 0) tone(f / 2, 0.3, 'sine', 0.06);
      step++;
    }, 260);
  }
  function stopBgm() { if (bgmTimer) { clearInterval(bgmTimer); bgmTimer = null; } }
  function isMuted() { return muted; }
  function setMuted(m) {
    muted = !!m;
    try {
      var s = window.GameStorage.load(); s.mute = muted; window.GameStorage.save(s);
    } catch (e) {}
    if (muted) stopBgm(); else { ensureCtx(); startBgm(); }
    var b = document.getElementById('btn-mute');
    if (b) b.textContent = muted ? '🔇' : '🔊';
  }
  window.GameAudio = { SFX: SFX, startBgm: startBgm, stopBgm: stopBgm, isMuted: isMuted, setMuted: setMuted, unlock: function () { ensureCtx(); } };
})();
