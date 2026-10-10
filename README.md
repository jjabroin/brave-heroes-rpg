# 🛡️ Brave Heroes RPG — 오리지널 턴제 배틀 웹 게임

Angry Birds Epic에서 **영감만** 받은(캐릭터/로고/이름/이미지 무단 사용 없음) 완전 오리지널 턴제 RPG입니다.
새 영웅 파티(루비·마리나·리프) vs 섀도우 군단(슬라임·고블린·골렘·드래곤), 스테이지 3개!

▶ 플레이: `https://jjabroin.github.io/brave-heroes-rpg/`
📦 저장소: `https://github.com/jjabroin/brave-heroes-rpg`

## ✨ 핵심 기능
- [x] 파티 3명, 각자 다른 스킬 (루비 단일 강공 / 마리나 힐 / 리프 광역)
- [x] 턴제 전투: 스킬 선택 → 타이밍 미니게임 (PERFECT ×1.5 / GOOD ×1.2 / MISS ×0.7)
- [x] 적 3종 + 보스 1종, 스테이지 3개 (들판/동굴/성, 보스 3턴마다 광역)
- [x] HP바, 데미지 숫자 팝업, 피격 쉐이크/플래시/힐 글로우 이펙트
- [x] 승리/패배 화면, 재시작/다음 스테이지, 별(⭐) 평가
- [x] localStorage 진행도 저장 (`braveHeroesSaveV1`: unlocked/cleared/mute)
- [x] 가로 모드 최적화, 모바일 터치 + PC 마우스 + 스페이스바 지원
- [x] 효과음/BGM(WebAudio 신스) + 음소거 버튼

## 🗂️ 파일 구조 (빌드 도구 없음, 더블클릭/정적호스팅 실행)
```
index.html
css/style.css
js/storage.js      # localStorage
js/characters.js   # 영웅/적/스테이지 데이터
js/audio.js        # WebAudio 신스 SFX+BGM
js/minigame.js     # 타이밍 바
js/battle.js       # 전투 엔진
js/scenes.js       # 화면 전환/결과
js/main.js         # 부트스트랩
assets/images/*.svg  # 자작 카툰 SVG 7종
assets/audio/README.md
```

## 🎨 에셋 출처·라이선스 (상업적 사용 가능만)
| 에셋 | 출처 | 라이선스 |
|---|---|---|
| 캐릭터/적 SVG 7종 (`hero-*.svg`, `enemy-*.svg`) | 본 프로젝트 저작자 직접 제작 (SVG 코드) | **CC0** — 자유 사용/수정/상업 이용 가능 |
| 폰트 Jua / Baloo 2 | Google Fonts | **OFL 1.1** (상업 이용 가능) |
| 효과음/BGM | `js/audio.js` WebAudio 직접 합성 (외부 파일 없음) | **CC0** 자작 |
| 이모지 아이콘 (🔥💧🍃 등) | OS 기본 이모지 렌더링 | 시스템 폰트 의존, 별도 라이선스 파일 없음 |

- Kenney.nl / OpenGameArt / itch.io 에셋을 직접 복사하지 않았으며, 스타일만 참고한 자작품입니다.
- Angry Birds 관련 상표·캐릭터·이미지·이름을 일절 사용하지 않습니다.
- 외부 이미지/음악 핫링크 없음. Google Fonts + (사용 시)CDN 외 네트워크 의존 없음.

## 🚀 로컬 실행
```bash
# 방법 1: 그냥 열기
open index.html
# 방법 2: 정적 서버 (권장)
python3 -m http.server 8000
# → http://localhost:8000
```

## 🌐 배포 (GitHub Pages, main/root)
```bash
gh repo create brave-heroes-rpg --public --source=. --remote=origin --push
gh api -X POST repos/jjabroin/brave-heroes-rpg/pages -f 'source[branch]=main' -f 'source[path]=/'
```
- Settings → Pages → Deploy from branch → main / (root)

## ✅ 완료 기준 체크
- [x] 모바일/PC 모두 플레이 가능 (터치+클릭+스페이스)
- [x] 콘솔 에러 없음 (외부 에셋 404 없음, AudioContext 사용자 제스처 후 생성)
