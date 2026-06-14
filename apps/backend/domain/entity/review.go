package entity

import (
	"time"
	"github.com/chs98412/prototype/backend/domain"
)

// Review is the domain entity for user reviews
type Review struct {
	ID        string    `gorm:"primaryKey;column:id"`
	UserID    string    `gorm:"index;column:user_id"`
	TMDBID    int       `gorm:"index;column:tmdb_id"`
	Content   string    `gorm:"column:content"`
	Spoiler   bool      `gorm:"column:is_spoiler"`
	LikeCount int       `gorm:"column:like_count"`
	CreatedAt time.Time `gorm:"autoCreateTime;column:created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime;column:updated_at"`
}

// TableName specifies the table name for GORM
func (r *Review) TableName() string {
	return "reviews"
}

// NewReview creates a new review entity
func NewReview(id, userID string, tmdbID int, content string, spoiler bool) *Review {
	return &Review{
		ID:        id,
		UserID:    userID,
		TMDBID:    tmdbID,
		Content:   content,
		Spoiler:   spoiler,
		LikeCount: 0,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
}

// UpdateContent updates review content
func (r *Review) UpdateContent(content string, spoiler bool) error {
	if content == "" {
		return domain.ErrInvalidInput
	}
	if len(content) > 500 {
		return domain.ErrInvalidInput
	}
	r.Content = content
	r.Spoiler = spoiler
	r.UpdatedAt = time.Now()
	return nil
}

// IncrementLike increments like count
func (r *Review) IncrementLike() {
	r.LikeCount++
}

// DecrementLike decrements like count
func (r *Review) DecrementLike() {
	if r.LikeCount > 0 {
		r.LikeCount--
	}
}

// ToDTO converts entity to response DTO
func (r *Review) ToDTO() *ReviewDTO {
	return &ReviewDTO{
		ID:        r.ID,
		UserID:    r.UserID,
		TMDBID:    r.TMDBID,
		Content:   r.Content,
		Spoiler:   r.Spoiler,
		LikeCount: r.LikeCount,
		CreatedAt: r.CreatedAt.Format(time.RFC3339),
		UpdatedAt: r.UpdatedAt.Format(time.RFC3339),
	}
}

// ReviewDTO is the data transfer object for responses
type ReviewDTO struct {
	ID        string `json:"id"`
	UserID    string `json:"user_id"`
	TMDBID    int    `json:"tmdb_id"`
	Content   string `json:"content"`
	Spoiler   bool   `json:"spoiler"`
	LikeCount int    `json:"like_count"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}
