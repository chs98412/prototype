# entity 파일에서 DTO를 분리하여 domain/dto 및 handler/dto 패키지로 이동

domain/entity/ 하위 파일들에 혼재되어 있던 DTO 구조체를 `domain/dto/` 패키지로 분리하고, handler의 Request 구조체를 `handler/dto/` 패키지로 이동했습니다.

## 변경 내용

### 신규 생성: `domain/dto/` 패키지 (package dto)
- `domain/dto/review.go` — ReviewDTO
- `domain/dto/record.go` — RecordDTO, RecordStatsDTO
- `domain/dto/profile.go` — ProfileDTO
- `domain/dto/movie.go` — MovieDTO
- `domain/dto/follow.go` — FollowDTO, FollowResponse
- `domain/dto/feed.go` — FeedItemDTO
- `domain/dto/notification.go` — NotificationDTO
- `domain/dto/challenge.go` — ChallengeDTO, ChallengeProgressDTO
- `domain/dto/goal.go` — GoalDTO
- `domain/dto/streak.go` — StreakDTO
- `domain/dto/album_review.go` — AlbumReviewDTO
- `domain/dto/track_rating.go` — TrackRatingDTO
- `domain/dto/review_like.go` — ReviewLikeDTO
- `domain/dto/auth.go` — AuthResponse, LogoutResponse, HealthResponse
- `domain/dto/analytics.go` — HeatmapEntry, GenreRating, TasteMatch, CommonWork

### 신규 생성: `handler/dto/` 패키지 (package handlerdto)
- `handler/dto/request.go` — CreateReviewRequest, UpdateReviewRequest, CreateRecordRequest, UpdateRecordRatingRequest, UpdateProfileRequest, LoginRequest

### 수정: domain/entity/, service/, domain/repository/, infrastructure/repository/, handler/ 파일들
각 파일에서 entity.XxxDTO 참조를 dto.XxxDTO로 변경하고, handler Request 구조체는 handlerdto.XxxRequest로 변경.
