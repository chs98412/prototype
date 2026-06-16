package entity

import (
	"time"

	"github.com/chs98412/prototype/backend/domain"
	dto "github.com/chs98412/prototype/backend/domain/dto"
)

// Review is the domain entity for user reviews
type Review struct {
	ID        string    `gorm:"primaryKey;column:id"`
	UserID    string    `gorm:"index;column:user_id"`
	TMDBID    int       `gorm:"index;column:tmdb_id"`
	MediaType string    `gorm:"column:media_type"`
	Kind      string    `gorm:"column:kind"`
	Title     string    `gorm:"column:title"`
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
func NewReview(id, userID string, tmdbID int, mediaType, kind, title, content string, spoiler bool) *Review {
	return &Review{
		ID:        id,
		UserID:    userID,
		TMDBID:    tmdbID,
		MediaType: mediaType,
		Kind:      kind,
		Title:     title,
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
func (r *Review) ToDTO() *dto.ReviewDTO {
	return &dto.ReviewDTO{
		ID:          r.ID,
		UserID:      r.UserID,
		TMDBID:      r.TMDBID,
		MediaType:   r.MediaType,
		Kind:        r.Kind,
		ReviewTitle: r.Title,
		Content:     r.Content,
		Spoiler:     r.Spoiler,
		LikeCount:   r.LikeCount,
		CreatedAt:   r.CreatedAt.Format(time.RFC3339),
		UpdatedAt:   r.UpdatedAt.Format(time.RFC3339),
	}
}
