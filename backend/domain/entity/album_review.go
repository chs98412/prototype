package entity

import (
	"time"
	"github.com/chs98412/prototype/backend/domain"
)

// AlbumReview is the domain entity for user music album reviews
type AlbumReview struct {
	ID             string
	UserID         string
	AlbumSpotifyID string
	Content        string
	HasSpoiler     bool
	CreatedAt      time.Time
	UpdatedAt      time.Time
}

// NewAlbumReview creates a new album review entity
func NewAlbumReview(id, userID, albumSpotifyID, content string, hasSpoiler bool) *AlbumReview {
	return &AlbumReview{
		ID:             id,
		UserID:         userID,
		AlbumSpotifyID: albumSpotifyID,
		Content:        content,
		HasSpoiler:     hasSpoiler,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}
}

// Update updates the review content
func (ar *AlbumReview) Update(content string, hasSpoiler bool) error {
	if content == "" {
		return domain.ErrInvalidInput
	}
	ar.Content = content
	ar.HasSpoiler = hasSpoiler
	ar.UpdatedAt = time.Now()
	return nil
}

// ToDTO converts entity to response DTO
func (ar *AlbumReview) ToDTO() *AlbumReviewDTO {
	return &AlbumReviewDTO{
		ID:             ar.ID,
		UserID:         ar.UserID,
		AlbumSpotifyID: ar.AlbumSpotifyID,
		Content:        ar.Content,
		HasSpoiler:     ar.HasSpoiler,
		CreatedAt:      ar.CreatedAt.Format(time.RFC3339),
		UpdatedAt:      ar.UpdatedAt.Format(time.RFC3339),
	}
}

// AlbumReviewDTO is the data transfer object for album review responses
type AlbumReviewDTO struct {
	ID             string `json:"id"`
	UserID         string `json:"user_id"`
	AlbumSpotifyID string `json:"album_spotify_id"`
	Content        string `json:"content"`
	HasSpoiler     bool   `json:"has_spoiler"`
	CreatedAt      string `json:"created_at"`
	UpdatedAt      string `json:"updated_at"`
}
