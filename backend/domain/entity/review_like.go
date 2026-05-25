package entity

import "time"

// ReviewLike is the domain entity for review likes
type ReviewLike struct {
	ID        string    `gorm:"primaryKey;column:id"`
	ReviewID  string    `gorm:"index;column:review_id"`
	UserID    string    `gorm:"index;column:user_id"`
	CreatedAt time.Time `gorm:"autoCreateTime;column:created_at"`
}

// TableName specifies the table name for GORM
func (rl *ReviewLike) TableName() string {
	return "review_likes"
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
