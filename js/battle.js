/* battle.js — 턴제 전투 엔진 */
(function () {
  'use strict';
  var state = null;
  var onBattleEnd = null;

  function $(id) { return document.getElementById(id); }
  function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function alive(list) { return list.filter(function (u) { return u.hp > 0; }); }

  function log(msg) {
    var box = $('battle-log');
    if (!box) return;
    var div = document.createElement('div');
    div.textContent = msg;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
  }
  function toast(msg) {
    var t = $('toast');
    if (!t) return;
    t.textContent = msg; t.classList.remove('hidden');
    clearTimeout(t._tm);
    t._tm = setTimeout(function () { t.classList.add('hidden'); }, 1800);
  }

  function startBattle(stageIdx, onEnd) {
    onBattleEnd = onEnd;
    var st = window.GameData.STAGES[stageIdx];
    state = {
      stageIdx: stageIdx, stage: st, turn: 1,
      heroes: window.GameData.HEROES.map(function (h) {
        return { kind: 'hero', base: h, hp: h.maxHp, maxHp: h.maxHp, cooldowns: {}, acted: false };
      }),
      enemies: st.enemies.map(function (eid, i) {
        var e = window.GameData.ENEMIES[eid];
        var hpBonus = stageIdx === 2 && eid === 'slime' ? 20 : 0;
        return { kind: 'enemy', base: e, hp: e.maxHp + hpBonus, maxHp: e.maxHp + hpBonus, uid: eid + '-' + i };
      }),
      heroCursor: 0, selectedSkill: null, busy: false, over: false,
      bossCounter: 0
    };
    $('stage-banner').textContent = '⚔️ ' + st.name + ' — ' + st.tip;
    $('battle-log').innerHTML = '';
    log('📯 ' + st.name + ' 시작! 섀도우 군단이 나타났다!');
    renderAll();
    setTimeout(nextHeroTurn, 600);
  }

  function renderAll() {
    renderSide('party', state.heroes);
    renderSide('enemy', state.enemies);
    renderSkills();
  }
  function renderSide(which, list) {
    var wrap = $(which === 'party' ? 'party-slots' : 'enemy-slots');
    wrap.innerHTML = '';
    list.forEach(function (u, idx) {
      var d = document.createElement('div');
      d.className = 'unit ' + (u.kind === 'enemy' ? 'enemy' : 'hero') + (u.hp <= 0 ? ' dead' : '') + (u.hp > 0 && u.hp <= u.maxHp * 0.3 ? ' low' : '');
      d.dataset.idx = idx; d.dataset.kind = u.kind;
      var pct = Math.max(0, Math.round((u.hp / u.maxHp) * 100));
      var label = u.kind === 'hero' ? u.base.name + ' <small>Lv' + (state.stageIdx + 1) + '</small>' : u.base.name + (u.base.boss ? ' 👑' : '');
      d.innerHTML =
        '<img src="' + u.base.img + '" alt="' + escapeHtml(u.base.name) + '" />' +
        '<div class="uname">' + label + '</div>' +
        '<div class="hpbar"><div class="hpfill" style="width:' + pct + '%"></div></div>' +
        '<div class="hptext">HP ' + Math.max(0, u.hp) + ' / ' + u.maxHp + '</div>';
      if (u.kind === 'enemy' && u.base.boss) d.style.borderColor = '#9b5de5';
      // 타겟 선택 모드
      if (state && state.selectedSkill && !state.busy && u.hp > 0) {
        var sk = state.selectedSkill;
        var can = (sk.target === 'enemy' || sk.target === 'enemies') ? u.kind === 'enemy' : u.kind === 'hero';
        if (can && !(sk.type === 'heal' && u.hp >= u.maxHp)) d.classList.add('targetable');
      }
      // 현재 행동 영웅 하이라이트
      if (state && !state.busy && u.kind === 'hero' && list === state.heroes) {
        var cur = currentHero();
        if (cur && cur === u && u.hp > 0 && !u.acted) d.classList.add('active-turn');
      }
      d.addEventListener('click', function () { onUnitClick(u); });
      d.addEventListener('touchstart', function (e) {
        if (d.classList.contains('targetable')) { e.preventDefault(); onUnitClick(u); }
      }, { passive: false });
      wrap.appendChild(d);
    });
  }
  function escapeHtml(s) { return String(s).replace(/"/g, '&quot;'); }

  function currentHero() {
    while (state.heroCursor < state.heroes.length) {
      var h = state.heroes[state.heroCursor];
      if (h.hp > 0 && !h.acted) return h;
      state.heroCursor++;
    }
    return null;
  }
  function renderSkills() {
    var sb = $('skill-buttons'), ti = $('turn-info');
    sb.innerHTML = '';
    if (state.over || state.busy) { ti.textContent = state.busy ? '🎬 연출 중…' : '—'; return; }
    var hero = currentHero();
    if (!hero) { ti.textContent = '👾 적 턴 진행 중…'; return; }
    // 쿨다운 감소 표시
    ti.innerHTML = '🎮 <b>' + hero.base.name + '</b>(' + hero.base.title + ')의 차례 — 스킬을 고르고 타겟을 터치!';
    hero.base.skills.forEach(function (sk) {
      var cd = hero.cooldowns[sk.id] || 0;
      var b = document.createElement('button');
      b.className = 'skill-btn' + (state.selectedSkill === sk ? ' selected' : '');
      b.disabled = cd > 0;
      b.textContent = sk.name + (cd > 0 ? ' (쿨 ' + cd + ')' : '') + ' — ' + sk.desc;
      b.addEventListener('click', function () {
        if (window.GameAudio) window.GameAudio.SFX.click();
        if (sk.type === 'aoe') {
          // 광역은 즉시 미니게임
          state.selectedSkill = null;
          doTimingAndApply(hero, sk, state.enemies.filter(function (e) { return e.hp > 0; }));
        } else {
          state.selectedSkill = (state.selectedSkill === sk ? null : sk);
          var msg = state.selectedSkill ? '👉 ' + (sk.target === 'enemy' ? '적을' : '아군을') + ' 터치하세요!' : '스킬 선택 취소';
          $('turn-info').innerHTML += '<br />' + msg;
          renderAll();
        }
      });
      sb.appendChild(b);
    });
    // heal 만렙 등 안내
    renderSide('party', state.heroes); renderSide('enemy', state.enemies);
  }

  function onUnitClick(u) {
    if (!state || state.busy || state.over) return;
    var hero = currentHero();
    if (!hero || !state.selectedSkill) {
      if (u.kind === 'enemy' && u.hp > 0) toast('먼저 스킬 버튼을 누르세요!');
      return;
    }
    var sk = state.selectedSkill;
    var valid = (sk.target === 'enemy' && u.kind === 'enemy' && u.hp > 0) ||
                (sk.target === 'ally' && u.kind === 'hero' && u.hp > 0);
    if (!valid) { toast('올바른 타겟을 터치하세요!'); return; }
    if (sk.type === 'heal' && u.hp >= u.maxHp) { toast('이미 HP가 가득 찼어요!'); return; }
    state.selectedSkill = null;
    doTimingAndApply(hero, sk, [u]);
  }

  function doTimingAndApply(hero, sk, targets) {
    state.busy = true; renderSkills();
    $('turn-info').textContent = '🎯 ' + hero.base.name + ' — 타이밍을 노려라!';
    window.TimingGame.show(function (res) {
      var mult = res.mult;
      var label = res.grade;
      if (label === 'PERFECT' && window.GameAudio) window.GameAudio.SFX.crit();
      else if (sk.type === 'heal' && window.GameAudio) window.GameAudio.SFX.heal();
      else if (sk.type === 'aoe' && window.GameAudio) window.GameAudio.SFX.aoe();
      else if (window.GameAudio) window.GameAudio.SFX.hit();
      applySkill(hero, sk, targets, mult, label);
    });
  }

  function popup(unit, text, cls) {
    // 유닛 카드 위에 데미지 숫자
    var selector = unit.kind === 'hero' ? '#party-slots' : '#enemy-slots';
    var wrap = document.querySelector(selector);
    if (!wrap) return;
    var cards = wrap.querySelectorAll('.unit');
    var list = unit.kind === 'hero' ? state.heroes : state.enemies;
    var idx = list.indexOf(unit);
    var card = cards[idx];
    if (!card) return;
    var s = document.createElement('div');
    s.className = 'dmg-popup ' + (cls || '');
    s.textContent = text;
    s.style.left = (20 + Math.random() * 40) + '%';
    s.style.top = '6px';
    card.style.position = 'relative';
    card.appendChild(s);
    setTimeout(function () { if (s.parentNode) s.parentNode.removeChild(s); }, 1000);
    card.classList.remove('shake', 'flash', 'heal-glow');
    void card.offsetWidth;
    if (cls === 'heal') card.classList.add('heal-glow');
    else { card.classList.add('shake'); card.classList.add('flash'); }
  }

  function calcDamage(attackerAtk, power, mult, variance) {
    variance = variance == null ? 0.15 : variance;
    var base = attackerAtk * power * mult;
    var v = 1 + (Math.random() * 2 - 1) * variance;
    return Math.max(1, Math.round(base * v));
  }

  function applySkill(hero, sk, targets, mult, grade) {
    var txt = grade === 'PERFECT' ? '✨ PERFECT!' : grade === 'GOOD' ? '👍 GOOD' : '💦 MISS…';
    log('🎯 ' + hero.base.name + ' ' + sk.name + ' → ' + txt + ' (×' + mult + ')');
    if (sk.type === 'heal') {
      var t = targets[0];
      var amount = Math.round(hero.base.heal * mult * (1 + Math.random() * 0.1));
      t.hp = Math.min(t.maxHp, t.hp + amount);
      popup(t, '+' + amount, 'heal');
      log('💚 ' + t.base.name + ' HP +' + amount + ' 회복!');
    } else if (sk.type === 'aoe') {
      targets.forEach(function (e, i) {
        setTimeout(function () {
          if (e.hp <= 0) return;
          var dmg = calcDamage(hero.base.atk, sk.power, mult);
          e.hp = Math.max(0, e.hp - dmg);
          popup(e, '-' + dmg, grade === 'PERFECT' ? 'crit' : '');
          log('🍃 ' + e.base.name + '에게 ' + dmg + '!');
          renderAll();
        }, i * 220);
      });
    } else {
      var e = targets[0];
      var dmg = calcDamage(hero.base.atk, sk.power, mult);
      if (grade === 'MISS') dmg = Math.max(1, Math.round(dmg * 0.7));
      e.hp = Math.max(0, e.hp - dmg);
      popup(e, grade === 'PERFECT' ? dmg + '!' : '' + dmg, grade === 'PERFECT' ? 'crit' : grade === 'MISS' ? 'miss' : '');
      log('⚔️ ' + e.base.name + '에게 ' + dmg + ' 데미지!');
    }
    // 쿨타임 설정
    if (sk.cooldown) hero.cooldowns[sk.id] = sk.cooldown;
    hero.acted = true;
    state.heroCursor++;
    state.busy = false;
    renderAll();
    setTimeout(function () {
      if (checkEnd()) return;
      var nxt = currentHero();
      if (nxt) { renderAll(); }
      else { enemyPhase(); }
    }, sk.type === 'aoe' ? 900 : 650);
  }

  function enemyPhase() {
    state.busy = true; renderSkills();
    var foes = alive(state.enemies);
    var order = foes.slice();
    state.bossCounter++;
    log('👾 적 턴! (' + state.turn + '라운드)');
    var i = 0;
    function step() {
      if (checkEnd()) return;
      if (i >= order.length) {
        // 라운드 종료
        state.turn++;
        state.heroes.forEach(function (h) {
          h.acted = false;
          Object.keys(h.cooldowns).forEach(function (k) { if (h.cooldowns[k] > 0) h.cooldowns[k]--; });
        });
        state.heroCursor = 0; state.busy = false;
        renderAll();
        setTimeout(nextHeroTurn, 400);
        return;
      }
      var e = order[i++];
      if (e.hp <= 0) { step(); return; }
      // 보스 3턴마다 광역
      if (e.base.boss && state.bossCounter % 3 === 0) {
        var all = alive(state.heroes);
        log('🐉 ' + e.base.name + '의 섀도우 브레스!! (전체 공격)');
        if (window.GameAudio) window.GameAudio.SFX.aoe();
        all.forEach(function (h, j) {
          setTimeout(function () {
            var dmg = calcDamage(e.base.atk, 0.8, 1, 0.2);
            h.hp = Math.max(0, h.hp - dmg);
            popup(h, '-' + dmg, '');
            renderAll();
          }, j * 200);
        });
        setTimeout(function () { renderAll(); if (!checkEnd()) setTimeout(step, 500); }, all.length * 200 + 400);
      } else {
        var targets = alive(state.heroes);
        if (!targets.length) { checkEnd(); return; }
        var t = targets[rand(0, targets.length - 1)];
        var dmg = calcDamage(e.base.atk, 1.0, 1, 0.2);
        setTimeout(function () {
          t.hp = Math.max(0, t.hp - dmg);
          if (window.GameAudio) window.GameAudio.SFX.hit();
          popup(t, '-' + dmg, '');
          log('💥 ' + e.base.name + ' → ' + t.base.name + ' ' + dmg + '!');
          renderAll();
          if (!checkEnd()) setTimeout(step, 550);
        }, 450);
      }
    }
    step();
  }

  function nextHeroTurn() {
    if (checkEnd()) return;
    state.busy = false;
    var h = currentHero();
    if (!h) { enemyPhase(); return; }
    renderAll();
  }

  function checkEnd() {
    if (!state || state.over) return true;
    if (alive(state.enemies).length === 0) { endBattle(true); return true; }
    if (alive(state.heroes).length === 0) { endBattle(false); return true; }
    return false;
  }
  function endBattle(win) {
    state.over = true;
    if (window.GameAudio) { if (win) window.GameAudio.SFX.win(); else window.GameAudio.SFX.lose(); }
    renderAll();
    // 별: 남은 HP + 턴 수
    var stars = 1;
    if (win) {
      var hpRatio = state.heroes.reduce(function (a, h) { return a + h.hp; }, 0) / state.heroes.reduce(function (a, h) { return a + h.maxHp; }, 0);
      if (hpRatio > 0.6 && state.turn <= 8) stars = 3;
      else if (hpRatio > 0.35 && state.turn <= 12) stars = 2;
    }
    setTimeout(function () { if (onBattleEnd) onBattleEnd(win, stars, state.turn); }, 900);
  }

  window.Battle = { startBattle: startBattle };
})();
