# Design Brief

## Product job

중산동에서 헬스장이나 PT를 찾는 방문자가 실제 중산점 시설을 먼저 확인하고, 운동 시작 방식을 이해한 뒤 전화 상담 또는 방문 준비 행동을 선택하도록 돕는다.

## Direction

검정과 그래파이트를 기반으로 주황을 행동 색상, 금색을 브랜드의 정교한 강조색으로 사용한다. 첫 화면은 중산점의 넓은 머신 전경 위에 대형 한국어 카피와 `JUNGSAN / 24H` 정보를 겹친다. 첫 화면 바로 다음에는 네이버 플레이스와 공식 블로그를 연결한 비대칭 소식 허브를 배치하고, 코칭·공간·방문 정보 뒤 목적별 START FINDER를 본문 최하단의 독립 전환 섹션으로 둔다.

## Brand reading

- Immutable identity: `1986 FITNESS`, 지점명 `JUNGSAN`, 강한 흑백 대비와 큰 숫자.
- Repeatable shapes/materials: 직각 패널, 얇은 금색 선, 주황색 방향 블록, 산업적인 그리드.
- Media provenance: 시설 섹션은 사용자가 제공한 중산점 준공 사진 20장의 웹 최적화 파생본을 사용한다. 네이버 소식 카드만 2026-09-12 검색 결과의 업체 문서 ID `1052772360`에서 확인한 현재 대표 썸네일을 직접 표시한다. 원본 시설 사진은 `C:\Users\82106\Desktop\1986\기타\사진\센터사진\중산\1986피트니스준공사진 (2)\고해상`에 보존하며 수정하지 않는다.
- Existing inconsistencies to remove: 올리브·라임 색상, 추상 사진 슬롯, `사진 연결 예정` 문구.

## Reference synthesis

- Structure: 히어로→공식 소식→코칭→실제 공간→방문 정보→상담 도구 순서.
- Interaction: 가양점의 선택 즉시 상세 내용이 바뀌는 패널.
- Visual tone: 검정/회색 기반의 실제 시설 사진, 주황 CTA, 절제된 금색 디테일.
- Final screen will not copy: 타 지점 사진·주소·트레이너·이벤트·후기·완전한 레이아웃.

## Reference evidence

- 원흥점 공개 사이트: 철학→코칭→공간→방문 흐름과 모바일 빠른 문의 동선.
- 가양점 공개 사이트: 선택형 상세 패널과 대형 사진 위 브랜드 카피 구성.
- 사용자 제공 중산점 원본 20장: 머신 플로어, 유산소, 스트레칭, 라커, 샤워, 라운지와 인테리어 디테일.
- 네이버 플레이스 `1052772360` 사진 탭(2026-09-12 확인): 업체 사진 목록에서 중산점 머신 전경이 노출되며, 사용자 제공 `cmj_0040.jpg`와 동일한 공간·구도를 확인했다.
- 네이버 검색 `중산동 헬스장` 결과(2026-09-12 확인): 업체 문서 ID `1052772360` 카드의 현재 160×160 대표 썸네일은 `추석맞이 3개월 12.9만` 프로모션 이미지이며, 사용자 캡처와 동일함을 확인했다.
- 중산점 공식 블로그와 RSS(2026-09-14 확인): 최신순 상위 4개 글의 제목·발행일·원문 URL·대표 이미지를 확인했다. 블로그 카드에는 이 4개를 2×2 정사각형 썸네일로 표시하고 각 원문으로 직접 연결한다.

## Reference implementation map

| Reference evidence | Extracted principle | Local component | Motion/state | Mobile translation | Status |
|---|---|---|---|---|---|
| 공개 지점 사이트의 방문 전환 | 첫 화면과 하단에서 다음 행동 노출 | `.hero-actions`, `.mobile-dock` | hover/focus 색 전환 | 2분할 고정 독 | Implemented |
| 공개 지점 사이트의 선택 패널 | 선택 즉시 상세 콘텐츠 변화 | `.finder-tabs`, `.space-selector` | 페이드와 ARIA pressed | 3열 2행 썸네일 | Implemented |
| 중산점 실제 사진 | 공간 자체를 핵심 증거로 사용 | `.hero-photo`, `.photo-archive` | 진입 확대, hover 확대 | 3열 축약 썸네일 | Implemented |
| 중산점 공식 채널과 네이버 대표 사진 | 공식 원문 링크와 현재 대표 이미지를 한 카드에서 연결 | `.news-card`, `.news-place-preview` | 카드 hover/focus 시 이미지·화살표 이동 | 카드 세로 배치와 1:1 이미지 유지 | Implemented · live thumbnail and responsive captures verified |
| 공식 블로그 최신 글 4개 | 최신순 콘텐츠를 사진 위에서 바로 훑고 개별 원문으로 이동 | `.blog-post-grid`, `.blog-post`, `public/data/blog-posts.json` | 썸네일 hover/focus 시 이미지 확대·메타 노출 | 2×2 정사각형 유지, 제목은 접근성 이름으로 보존 | Implemented · RSS refresh data, 4 live images, 4 direct links, desktop/mobile captures verified |
| 중산점 공간 20장 | 작은 목록과 큰 감상을 분리 | `.archive-thumb`, `.archive-lightbox` | 클릭 열기, 화살표 탐색, ESC·배경 닫기 | 3열 썸네일과 전면 뷰어 | Implemented · desktop/mobile capture verified |
| 간결한 방문 흐름 | `WHY 1986`과 제작 메모·자료 대기 섹션 없이 핵심 콘텐츠만 연속 배치 | `index.html`, `styles.css`, `README.md` | 기존 인터랙션 유지, 제거된 앵커·선택자 정리 | 히어로 다음에 NEWS가 바로 이어져 세로 길이 감소 | Implemented · desktop/mobile verified |

## Signature composition and component

- Signature composition: 중산점 전경을 비대칭으로 가르는 주황색 `JUNGSAN` 엣지 블록과 금색 세로선, 그 위의 대형 `1986` 워드마크.
- Signature component: 대표 사진과 6개 공간 카테고리를 즉시 바꾸는 `SPACE SELECTOR`. 아래에는 실제 장면 20개를 작은 동일 비율 썸네일로 정리하고, 클릭하면 큰 사진과 캡션을 보여주는 `ARCHIVE LIGHTBOX`를 연결한다.

## Motion storyboard

| Beat | Trigger | Elements | From → to | Duration/ease | Purpose | Reduced motion |
|---|---|---|---|---|---|---|
| 중산점 개방 | 최초 진입 | 사진, 검정 마스크, 카피, 금색 선 | 확대/어두움 → 원본 크기/선명 | 900ms ease-out stagger | 실제 공간과 지점명 조립 | 최종 상태 즉시 |
| 방향 신호 | 최초 진입 | 주황 엣지 블록 | 오른쪽 24px → 제자리 | 700ms ease-out | 중산점 고유 시그니처 | 최종 상태 즉시 |
| 시작점 찾기 | 버튼 선택 | 제목·설명·3단계 | 아래/흐림 → 제자리/선명 | 360ms ease-out | 선택을 방문 계획으로 전환 | 즉시 교체 |
| 공간 선택 | 썸네일 선택 | 대표 사진·캡션·번호 | 교차 페이드/살짝 확대 | 420ms ease-out | 시설 탐색의 맥락 유지 | 즉시 교체 |
| 아카이브 확대 | 20개 썸네일 클릭·이전/다음 | 모달 사진·번호·캡션 | 배경/사진이 함께 확대·선명화 | 280ms ease-out | 작은 목록과 큰 감상을 동시에 제공 | 최종 상태 즉시 |
| 공식 채널 연결 | 소식 카드 hover/focus | 번호·제목·화살표·면 | 화살표 대각 이동, 면색 반전 | 220ms ease-out | 외부 원문 채널임을 명확히 전달 | 색·윤곽만 유지 |
| 소식 미디어 확인 | 소식 카드 hover/focus | 실제 사진·그라데이션·카피 | 사진 1.035배 확대, 오버레이 농도 완화 | 360ms ease-out | 공식 채널로 이동하기 전 실제 센터 인상 제공 | 정지 이미지와 최종 대비 유지 |
| 조작 피드백 | hover/focus | CTA·사진·모바일 메뉴 | 주황 면/금색 선/아이콘 이동 | 160ms | 조작 가능성 표시 | 색·윤곽만 유지 |

## Microinteractions

1. START FINDER 세 탭의 선택 상태와 결과 전환.
2. SPACE SELECTOR 썸네일 선택 시 대표 사진·캡션·카운터 동기화.
3. 20장 아카이브 썸네일 hover 시 사진 확대, 클릭 시 큰 사진 뷰어와 이전·다음·ESC 상태 전환.
4. 모바일 메뉴 열림 상태의 아이콘 회전과 ARIA 동기화.
5. 네이버 플레이스·공식 블로그 소식 카드의 전체 면 링크와 hover/focus 피드백.
6. 소식 카드 hover 시 실제 사진 확대와 검정 오버레이 변화.
7. 블로그 최신 글 4개 썸네일 hover/focus 시 대표 이미지 확대와 날짜·순번 강조.

## Tokens

- Font: 로컬 `Gmarket Sans` 300/500/700.
- Ink: `#090909`; graphite: `#252525`; steel: `#707070`; silver: `#b7b5af`.
- Bone: `#f1eee8`; white: `#fffdf8`.
- Action orange: `#f15a24`; brand gold: `#c6a15b`.
- Spacing: 8 / 12 / 20 / 32 / 56 / 88 / 120.
- Radius: 0 / 3px; 그림자 없이 선과 오버레이로 분리한다.

## Copy ladder

- Tension: 등록보다 어려운 건, 계속 오는 일.
- Promise: 중산에서 운동이 이어지는 이유를 만듭니다.
- Proof: 사용자가 제공한 중산점 실제 공간 중 용도가 겹치지 않는 대표 사진, 위치·전화·운영 표기, 시작점 도구.
- Choice: 운동이 처음 / 혼자 루틴이 막힘 / PT 방향을 찾음.
- Action: 중산점 전화 상담.

## Responsive and motion contract

- Viewports: 320 / 360 / 390 / 430 / desktop.
- Desktop: 히어로 사진 2/3, 카피와 엣지 블록 중첩; 공간 선택기는 대표 사진과 세로 정보 패널.
- Mobile: 히어로는 세로형 사진 크롭, 엣지 블록은 하단 라벨; 공간 선택기는 대표 사진 위 캡션과 3열 썸네일.
- NEWS: 데스크톱은 네이버 플레이스를 크게, 공식 블로그를 보조 폭으로 구성한 비대칭 2열 소식 허브다. 플레이스 카드는 네이버 대표 정사각형 이미지를, 블로그 카드는 실사진 배경 위 공식 RSS 최신 글 4개의 정사각형 썸네일을 2×2로 배치한다. 모바일도 2×2 밀도를 유지하며 두 채널을 세로로 배치한다.
- Blog refresh: `scripts/update-blog-posts.mjs`가 공식 RSS 최신 4개를 검증해 `public/data/blog-posts.json`으로 생성하고, GitHub Actions가 매시간 갱신·빌드·Pages 재배포한다. 브라우저는 배포된 로컬 JSON만 읽고 실패 시 HTML에 저장된 마지막 4개를 유지한다.
- START FINDER: VISIT 다음 본문 최하단에 독립된 어두운 전환 섹션으로 둔다. 데스크톱은 소개와 선택 결과를 좌우로, 모바일은 선택→결과 3단계를 세로 목록으로 전환한다.
- Gallery: 20장을 유지하되 데스크톱 동일 비율 5열×4행, 태블릿 4열, 모바일 3열의 작은 썸네일로 축약한다. 클릭하면 큰 사진 모달이 열리고 이전·다음·ESC·배경 클릭으로 탐색하거나 닫는다.
- Reduced motion: 모든 요소 최종 상태, 자동 이동 없음.
- Acceptance: 320/360/390/430px 수평 넘침 없음, 네이버 플레이스 링크와 블로그 최신 글 4개 개별 링크·썸네일 로드 확인, 독립 Finder의 본문 최하단 위치 확인, 대표 사진 6개 전환, 아카이브 20장 `complete && naturalWidth > 0`, 모달 열기·다음·이전·ESC 닫기와 포커스 복귀, 콘솔 오류 0, 빌드·브리프 검증 통과.

## Behavior that must remain unchanged

- 정적 HTML/CSS/JS와 `npm.cmd run dev/build` 명령.
- 외부 전송 폼 없음.
- 전화 링크와 사용자가 제공한 네이버 플레이스, 중산점 공식 블로그 링크만 실제 외부 행동.

## Anti-template decisions

- Rejected: 스톡 사진 한 장, 같은 크기 카드 3개, 가짜 후기·가격·변화 수치.
- Replacement: 사용자 제공 실제 중산점 사진, 비대칭 오렌지 엣지 히어로, 선택형 시설 뷰어, 20장 동일 비율 썸네일과 확대 뷰어.

## Verification captures

- 데스크톱 1440×900: 히어로 사진·카피·주황 엣지·전화 CTA 가독성.
- 모바일 390×844: 세로 사진 크롭, 의미 단위 제목 줄바꿈, 고정 CTA.
- 320 / 360 / 390 / 430px: `scrollWidth === clientWidth`.
- SPACE SELECTOR: 6개 버튼의 이미지·제목·설명·카운터 전환.
- 이미지: 문서 내 20개 아카이브 사진과 대표 사진의 로드 완료, 확대 뷰어의 이미지·번호·캡션 동기화.
- 콘솔 오류 0, 정적 빌드 및 디자인 브리프 검증 통과.
