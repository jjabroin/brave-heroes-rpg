/* scenes.js — 화면 전환 + 스테이지 선택 + 결과 + 저장 연동 */
(function () {
  'use strict';
  var currentStage = 0;

  function $(id) { return document.getElementById(id); }
  function show(id) {
    document.querySelectorAll('.screen').forEach(function (s) { s.classList.remove('active'); });
    $(id).classList.add('active');
    window.scrollTo(0, 0);
  }
  function save() { return window.GameStorage.load(); }

  function renderStages() {
    var s = save();
    var list = $('stage-list');
    list.innerHTML = '';
    $('stage-progress').textContent = '🏆 클리어: ' + s.cleared.filter(Boolean).length + ' / 3';
    window.GameData.STAGES.forEach(function (st, i) {
      var locked = i > s.unlocked;
      var card = document.createElement('div');
      card.className = 'stage-card' + (locked ? ' locked' : '');
      var enemies = st.enemies.map(function (e) { return window.GameData.ENEMIES[e].name; }).join(', ');
      card.innerHTML =
        '<p class="stage-name">' + (locked ? '🔒 ' : s.cleared[i] ? '⭐ ' : '⚔️ ') + st.name + '</p>' +
        '<p class="stage-enemies">출현: ' + enemies + '</p>' +
        '<p class="stage-enemies">💡 ' + st.tip + '</p>';
      var btn = document.createElement('button');
      btn.className = 'big-btn ' + (locked ? 'secondary' : 'primary');
      btn.textContent = locked ? '이전 스테이지 클리어 필요' : (s.cleared[i] ? '🔄 다시 도전' : '▶ 출격!');
      btn.disabled = locked;
      btn.addEventListener('click', function () {
        if (window.GameAudio) { window.GameAudio.unlock(); window.GameAudio.SFX.click(); }
        startStage(i);
      });
      card.appendChild(btn);
      list.appendChild(card);
    });
  }

  function startStage(i) {
    currentStage = i;
    show('screen-battle');
    window.Battle.startBattle(i, onResult);
  }

  function onResult(win, stars, turns) {
    var s = save();
    s.plays = (s.plays || 0) + 1;
    if (win) {
      s.cleared[currentStage] = true;
      if (currentStage + 1 < 3) s.unlocked = Math.max(s.unlocked, currentStage + 1);
      else s.unlocked = 2;
    }
    window.GameStorage.save(s);
    var modal = $('result-modal'), box = $('result-box');
    $('result-title').textContent = win ? '🎉 승리!' : '💀 패배…';
    $('result-desc').textContent = win
      ? window.GameData.STAGES[currentStage].name + ' 클리어! (' + turns + '턴)'
      : '수호대가 쓰러졌다… 다시 도전해보자! (' + turns + '턴 버팀)';
    $('result-stars').textContent = win ? '⭐'.repeat(stars) + '☆'.repeat(3 - stars) : '다시 힘을 모아보자!';
    box.classList.toggle('win', win);
    $('btn-next').style.display = (win && currentStage + 1 < 3) ? '' : 'none';
    modal.classList.remove('hidden');
    renderStages();
  }

  function bind() {
    $('btn-start').addEventListener('click', function () {
      if (window.GameAudio) { window.GameAudio.unlock(); window.GameAudio.SFX.click(); window.GameAudio.startBgm(); }
      show('screen-stages'); renderStages();
    });
    $('btn-howto').addEventListener('click', function () {
      if (window.GameAudio) window.GameAudio.SFX.click();
      $('howto-box').classList.toggle('hidden');
    });
    $('btn-back-title').addEventListener('click', function () { show('screen-title'); });
    $('btn-home').addEventListener('click', function () { $('result-modal').classList.add('hidden'); show('screen-title'); });
    $('btn-retry').addEventListener('click', function () {
      $('result-modal').classList.add('hidden');
      if (window.GameAudio) window.GameAudio.SFX.click();
      startStage(currentStage);
    });
    $('btn-next').addEventListener('click', function () {
      $('result-modal').classList.add('hidden');
      if (window.GameAudio) window.GameAudio.SFX.click();
      startStage(Math.min(2, currentStage + 1));
    });
    $('btn-to-stages').addEventListener('click', function () {
      $('result-modal').classList.add('hidden');
      show('screen-stages'); renderStages();
    });
    var muteBtn = $('btn-mute');
    function syncMute() { muteBtn.textContent = window.GameAudio.isMuted() ? '🔇' : '🔊'; }
    muteBtn.addEventListener('click', function () {
      window.GameAudio.setMuted(!window.GameAudio.isMuted());
      syncMute();
    });
    syncMute();
    $('btn-reset-save').addEventListener('click', function () {
      if (confirm('진행도를 초기화할까요?')) {
        var m = save().mute;
        window.GameStorage.clear();
        window.GameStorage.save({ unlocked: 0, cleared: [false, false, false], mute: m, plays: 0 });
        renderStages();
        alert('초기화 완료!');
      }
    });
    if (window.TimingGame) window.TimingGame.bindUI();
  }

  window.Scenes = { bind: bind, renderStages: renderStages, show: show };
})();
