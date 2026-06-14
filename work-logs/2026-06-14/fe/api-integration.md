# 피드·검색·알림·프로필 화면을 실제 백엔드 API에 연결

mock 데이터(lib/data.ts) 대신 배포된 백엔드(https://logged-backend.fly.dev) API를 호출하도록 네 화면을 업데이트했습니다.

- `apps/web/src/lib/api.ts`: `put` 메서드 추가
- `apps/web/src/lib/apiTypes.ts` 신규 생성: SocialFeedItem, NotificationDTO, ProfileDTO, RecordDTO, RecordStatsDTO, ReviewDTO, TmdbSearchResult 등 백엔드 응답 타입 정의
- `apps/web/src/pages/FeedPage.tsx` 재작성: GET /v1/feed/social 호출, 로딩/에러/빈피드 상태 처리, review/record 카드 컴포넌트 내장
- `apps/web/src/pages/SearchPage.tsx` 재작성: GET /v1/movies/search?q= 호출, 350ms debounce, TMDB 이미지(w185) 표시
- `apps/web/src/pages/AlertsPage.tsx` 재작성: GET /v1/notifications 호출, type 필드로 탭 필터링
- `apps/web/src/pages/ProfilePage.tsx` 재작성: 병렬 API 호출(me, records/stats, reviews, records, follows, followers), 실제 프로필 정보 및 통계 표시
