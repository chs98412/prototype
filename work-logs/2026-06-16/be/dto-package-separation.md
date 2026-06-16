# 레이어드 아키텍처 개선 — DTO를 별도 패키지로 분리

응답 DTO와 요청 DTO를 각 레이어에 맞는 별도 패키지로 분리했습니다.

- `apps/backend/domain/dto/` 신규 생성 (15개 파일): ReviewDTO, RecordDTO, ProfileDTO, FollowDTO, MovieDTO, FeedItemDTO, AnalyticsDTO(HeatmapEntry, GenreRating, TasteMatch, CommonWork), AlbumReviewDTO, TrackRatingDTO, ReviewLikeDTO, ChallengeDTO, GoalDTO, StreakDTO, NotificationDTO, AuthResponse
- `apps/backend/handler/dto/request.go` 신규 생성: CreateReviewRequest, UpdateReviewRequest, CreateRecordRequest, UpdateRecordRatingRequest 등 요청 DTO
- `apps/backend/domain/entity/` 전체 수정: DTO struct 제거, `ToDTO()` 반환 타입을 `dto.XxxDTO`로 변경
- `apps/backend/service/` 전체 수정: `entity.XxxDTO` → `dto.XxxDTO` import 치환
- `apps/backend/domain/repository/analytics_repository.go` 수정: entity.HeatmapEntry 등 → dto 패키지 참조
- `apps/backend/infrastructure/repository/` 수정: analytics, record 구현체에서 dto 패키지 사용
- `apps/backend/handler/auth_handler.go` 수정: entity.LogoutResponse, entity.HealthResponse → dto 패키지
