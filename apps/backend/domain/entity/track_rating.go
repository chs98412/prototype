package entity

import (
	"time"

	dto "github.com/chs98412/prototype/backend/domain/dto"
)

// TrackRating is the domain entity for user music track ratings
type TrackRating struct {
	ID             string    `gorm:"primaryKey;column:id"`
	UserID         string    `gorm:"index;column:user_id"`
	TrackSpotifyID string    `gorm:"index;column:track_spotify_id"`
	Rating         int       `gorm:"column:rating"`
	ListenedAt     time.Time `gorm:"autoCreateTime;column:listened_at"`
}

// TableName specifies the table name for GORM
func (tr *TrackRating) TableName() string {
	return "track_records"
}

// NewTrackRating creates a new track rating entity
func NewTrackRating(id, userID, trackSpotifyID string, rating int) *TrackRating {
	return &TrackRating{
		ID:             id,
		UserID:         userID,
		TrackSpotifyID: trackSpotifyID,
		Rating:         rating,
		ListenedAt:     time.Now(),
	}
}

// ToDTO converts entity to response DTO
func (tr *TrackRating) ToDTO() *dto.TrackRatingDTO {
	return &dto.TrackRatingDTO{
		ID:             tr.ID,
		UserID:         tr.UserID,
		TrackSpotifyID: tr.TrackSpotifyID,
		Rating:         tr.Rating,
		ListenedAt:     tr.ListenedAt.Format(time.RFC3339),
	}
}
