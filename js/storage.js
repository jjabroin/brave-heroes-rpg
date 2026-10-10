/* storage.js — localStorage 진행도 저장 */
(function () {
  'use strict';
  var KEY = 'braveHeroesSaveV1';
  var defaults = { unlocked: 0, cleared: [false, false, false], mute: false, plays: 0 };

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return Object.assign({}, defaults);
      var d = JSON.parse(raw);
      return Object.assign({}, defaults, d);
    } catch (e) {
      return Object.assign({}, defaults);
    }
  }
  function save(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
  }
  function clear() {
    try { localStorage.removeItem(KEY); } catch (e) {}
  }
  window.GameStorage = { load: load, save: save, clear: clear, KEY: KEY };
})();
