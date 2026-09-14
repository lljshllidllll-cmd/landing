# 1986피트니스 중산점 랜딩페이지

원흥점과 가양점 공개 사이트의 브랜드·구성 원칙을 참고해 만든 중산점 전용 정적 랜딩페이지입니다.

## 실행

```powershell
npm.cmd run dev
```

`http://127.0.0.1:4174`에서 확인할 수 있습니다.

## 검증

```powershell
npm.cmd run build
```

## 블로그 최신 글 자동 갱신

공식 RSS에서 최신 게시물 4개를 다시 받아 로컬 데이터와 검증을 함께 갱신합니다.

```powershell
npm.cmd run build:refresh
```

GitHub에 배포하면 `.github/workflows/pages.yml`이 매시간 23분에 RSS를 갱신하고 GitHub Pages를 다시 배포합니다. 저장소의 `Settings → Pages → Build and deployment → Source`는 `GitHub Actions`로 선택해야 합니다.

## 사용한 사진

- 사용자가 제공한 중산점 준공 사진 20장 전체
- 원본 파일은 수정하지 않으며 `public/images/jungsan`에 긴 변 1,920px 웹용 파생본만 생성
- 파생본 재생성: `pwsh -NoProfile -File .\scripts\prepare-images.ps1`

## 외부 연결

- 네이버 플레이스: 중산점 대표 사진과 새 소식
- 공식 블로그: 공식 RSS 최신 게시물 4개의 실제 썸네일과 개별 원문 링크, 매시간 자동 갱신
- 전화 상담: `031-977-3690`

확인되지 않은 가격·후기·트레이너 정보는 표시하지 않습니다.
