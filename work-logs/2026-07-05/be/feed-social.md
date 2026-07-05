# 소셜 피드 쿼리 수정 — rating을 user_records에서 JOIN, log 중복 제거

`apps/backend/infrastructure/repository/feed_repository_impl.go`의 `GetSocialFeed` 쿼리를 수정했습니다.

- reviews 파트: `LEFT JOIN user_records rec ON rec.user_id = r.user_id AND rec.tmdb_id = r.tmdb_id`
  추가 → `COALESCE(CAST(rec.rating AS INTEGER), 0) AS rating` 으로 평점 포함
- user_records(log) 파트: `AND NOT EXISTS (SELECT 1 FROM reviews r WHERE r.user_id = rec.user_id AND r.tmdb_id = rec.tmdb_id)`
  조건 추가 → 이미 review가 있는 영화는 log로 중복 노출되지 않음
