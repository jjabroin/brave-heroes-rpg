/* characters.js — 100% 오리지널 캐릭터·스테이지 데이터 (Angry Birds 무관) */
(function () {
  'use strict';
  // 아군 3인방: 루미아 수호대
  var HEROES = [
    {
      id: 'ember', name: '루비', title: '불꽃 여우 전사',
      img: 'assets/images/hero-ember.svg', color: '#ff6b35',
      maxHp: 135, atk: 24, heal: 0,
      desc: '단일 강공 특화',
      skills: [
        { id: 'flame-slash', name: '🔥 플레임 슬래시', type: 'attack', power: 1.0, target: 'enemy', desc: '불꽃 베기' },
        { id: 'inferno', name: '☄️ 인페르노 버스트', type: 'attack', power: 1.7, target: 'enemy', cooldown: 3, desc: '3턴 쿨타임 강공' }
      ]
    },
    {
      id: 'marina', name: '마리나', title: '물방울 치유사',
      img: 'assets/images/hero-marina.svg', color: '#3ec1ff',
      maxHp: 112, atk: 15, heal: 46,
      desc: '힐 + 보조공격',
      skills: [
        { id: 'aqua-heal', name: '💧 아쿠아 힐', type: 'heal', power: 1.0, target: 'ally', desc: '아군 1명 회복' },
        { id: 'bubble-shot', name: '🫧 버블 샷', type: 'attack', power: 0.85, target: 'enemy', desc: '가벼운 물방울 공격' }
      ]
    },
    {
      id: 'leaf', name: '리프', title: '바람 부엉이 궁수',
      img: 'assets/images/hero-leaf.svg', color: '#37c871',
      maxHp: 102, atk: 19, heal: 0,
      desc: '광역 특화',
      skills: [
        { id: 'wind-arrow', name: '🏹 윈드 애로우', type: 'attack', power: 1.0, target: 'enemy', desc: '정확한 단일샷' },
        { id: 'leaf-storm', name: '🍃 리프 스톰', type: 'aoe', power: 0.72, target: 'enemies', cooldown: 2, desc: '적 전체 공격' }
      ]
    }
  ];

  // 적 3종 + 보스 1종: 섀도우 군단 (오리지널)
  var ENEMIES = {
    slime: { id: 'slime', name: '머드 슬라임', img: 'assets/images/enemy-slime.svg', maxHp: 66, atk: 11, desc: '초보용 끈적 몬스터' },
    goblin: { id: 'goblin', name: '쏜 고블린', img: 'assets/images/enemy-goblin.svg', maxHp: 88, atk: 14, desc: '가시 방망이' },
    golem: { id: 'golem', name: '스톤 골렘', img: 'assets/images/enemy-golem.svg', maxHp: 132, atk: 17, desc: '단단한 돌덩이' },
    dragon: { id: 'dragon', name: '섀도우 드래곤', img: 'assets/images/enemy-dragon.svg', maxHp: 285, atk: 21, boss: true, desc: '3턴마다 섀도우 브레스(전체공격)!' }
  };

  var STAGES = [
    { id: 0, name: '스테이지 1 · 초록 들판', bg: 'meadow', enemies: ['slime', 'slime'], tip: '리프의 광역은 2마리부터 효율적!' },
    { id: 1, name: '스테이지 2 · 어둑 동굴', bg: 'cave', enemies: ['goblin', 'goblin', 'slime'], tip: '마리나 힐을 아껴두세요. 고블린 공격이 아파요.' },
    { id: 2, name: '스테이지 3 · 그림자 성', bg: 'castle', enemies: ['golem', 'golem', 'dragon'], tip: '보스는 3턴마다 전체공격! 엠버 버스트를 보스에게!' }
  ];

  window.GameData = { HEROES: HEROES, ENEMIES: ENEMIES, STAGES: STAGES };
})();
