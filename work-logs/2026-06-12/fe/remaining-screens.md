# 나머지 웹 화면 전체 구현 (에세이 상세 ~ 팔로우 목록)

핸드오프 디자인 파일(screens.jsx) 기반으로 미구현 화면 8개를 모두 작성하고 App.tsx에 라우트를 연결했습니다.

## 신규 아이콘
- `components/ui/Icons.tsx` — PlusIcon, CameraIcon, SparkleIcon 추가

## 신규 페이지
- `pages/EssayPage.tsx` — 에세이 상세 (스티키 헤더, 포스터, 본문, 인라인 이미지, 태그, 저자 카드, 댓글)
- `pages/SearchPage.tsx` — 검색 (검색바, 최근 검색, 이번 주 추천 목록, 영화 결과)
- `pages/AlertsPage.tsx` — 알림 (필터 탭, 좋아요/코멘트/팔로우 구분 도트)
- `pages/MoviePage.tsx` — 영화 상세 (배경 이미지, 포스터 오버랩, 시놉시스, 평론 목록, CTA)
- `pages/PostPage.tsx` — 포스트 상세 통합 (rating/log/quote/list 각각의 레이아웃)
- `pages/EditorPage.tsx` — 글쓰기 에디터 (5가지 유형 탭, 대상 영화 선택, 유형별 폼)
- `pages/EditProfilePage.tsx` — 프로필 편집 (아바타, 필드 폼)
- `pages/FollowPage.tsx` — 팔로우 목록 (팔로잉/팔로워 탭, 토글)

## 라우트 등록
- `App.tsx` — /essay/:id, /search, /alerts, /movie/:id, /post/:kind/:id, /editor, /edit-profile, /follow 추가
