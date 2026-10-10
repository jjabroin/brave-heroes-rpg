/* main.js — 부트스트랩 */
(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded', function () {
    try {
      window.Scenes.bind();
      // 첫 오디오 언락 (모바일 자동재생 정책 대응)
      var unlockOnce = function () {
        if (window.GameAudio) window.GameAudio.unlock();
        document.removeEventListener('touchstart', unlockOnce);
        document.removeEventListener('click', unlockOnce);
      };
      document.addEventListener('touchstart', unlockOnce, { passive: true });
      document.addEventListener('click', unlockOnce);
    } catch (e) {
      // 콘솔 에러는 남기되 화면은 깨지지 않게
      if (window.console && console.error) console.error(e);
      var ti = document.getElementById('turn-info');
      if (ti) ti.textContent = '초기화 중 오류가 발생했어요. 새로고침 해주세요.';
    }
  });
})();
