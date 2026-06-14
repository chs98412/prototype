# 소셜 피드 API 구현 — GET /v1/feed/social

팔로우한 유저들의 리뷰와 시청 기록을 통합해서 시간 역순으로 반환하는 소셜 피드 API를 구현했습니다.

- `apps/backend/domain/entity/feed.go`: `SocialFeedItem` 구조체 추가 (kind/review|record, display_name, avatar_url, tmdb_id, content, like_count, rating, spoiler, event_time)
- `apps/backend/domain/repository/feed_repository.go`: `FeedRepository` 인터페이스에 `GetSocialFeed` 메서드 추가
- `apps/backend/infrastructure/repository/feed_repository_impl.go`: `reviews` + `user_records` 테이블을 UNION ALL로 합치고 `user_follows`, `user_profiles` JOIN하는 SQL 쿼리 구현
- `apps/backend/service/social_service.go`: `FeedService` 인터페이스와 `FeedServiceImpl`에 `GetSocialFeed` 추가
- `apps/backend/handler/social_handler.go`: `SocialHandler`에 `GetSocialFeed` HTTP 핸들러 추가 (limit/offset 파라미터 지원)
- `apps/backend/main.go`: `GET /v1/feed/social` 라우트 등록
