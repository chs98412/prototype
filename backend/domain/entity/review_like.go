package entity

import "time"

// ReviewLike is the domain entity for review likes
type ReviewLike struct {
	ID        string
	ReviewID  string
	UserID    string
	CreatedAt time.Time
}

// NewReviewLike creates a new review like entity
func NewReviewLike(id, reviewID, userID string) *ReviewLike {
	return &ReviewLike{
		ID:        id,
		ReviewID:  reviewID,
		UserID:    userID,
		CreatedAt: time.Now(),
	}
}

// ToDTO converts entity to response DTO
func (rl *ReviewLike) ToDTO() *ReviewLikeDTO {
	return &ReviewLikeDTO{
		ID:        rl.ID,
		ReviewID:  rl.ReviewID,
		UserID:    rl.UserID,
		CreatedAt: rl.CreatedAt.Format(time.RFC3339),
	}
}

// ReviewLikeDTO is the data transfer object for review like responses
type ReviewLikeDTO struct {
	ID        string `json:"id"`
	ReviewID  string `json:"review_id"`
	UserID    string `json:"user_id"`
	CreatedAt string `json:"created_at"`
}
