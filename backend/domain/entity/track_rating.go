package entity

import "time"

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
func (tr *TrackRating) ToDTO() *TrackRatingDTO {
	return &TrackRatingDTO{
		ID:             tr.ID,
		UserID:         tr.UserID,
		TrackSpotifyID: tr.TrackSpotifyID,
		Rating:         tr.Rating,
		ListenedAt:     tr.ListenedAt.Format(time.RFC3339),
	}
}

// TrackRatingDTO is the data transfer object for track rating responses
type TrackRatingDTO struct {
	ID             string `json:"id"`
	UserID         string `json:"user_id"`
	TrackSpotifyID string `json:"track_spotify_id"`
	Rating         int    `json:"rating"`
	ListenedAt     string `json:"listened_at"`
}
