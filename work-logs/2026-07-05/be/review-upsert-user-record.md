# 에세이/리뷰 작성 시 user_records 자동 생성 누락 수정

리뷰(`POST /v1/reviews`)를 작성해도 `user_records` 테이블에 기록이 남지 않던 문제를 수정했습니다.

- `apps/backend/service/review_service.go`: `ReviewServiceImpl`에 `recordRepo repository.RecordRepository` 필드 추가, `NewReviewService` 시그니처에 `recordRepo` 파라미터 추가. `CreateReview`에서 새 리뷰 저장 후 goroutine으로 `user_records` upsert 실행 — 이미 레코드가 존재하면 건드리지 않고, 없으면 `status=watched, rating=0`으로 생성
- `apps/backend/main.go`: `NewReviewService` 호출에 `recordRepo` 인자 추가
