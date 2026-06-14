package entity

import (
	"errors"
	"time"
)

var (
	ErrInvalidRating = errors.New("rating must be between 0 and 10")
)

// RecordStatus represents the status of a watch record
type RecordStatus string

const (
	StatusWatched  RecordStatus = "watched"
	StatusWatching RecordStatus = "watching"
	StatusWant     RecordStatus = "want"
)

// Record is the domain entity for watch history records
type Record struct {
	ID        string       `gorm:"primaryKey;column:id"`
	UserID    string       `gorm:"index;column:user_id"`
	TMDBID    int          `gorm:"index;column:tmdb_id"`
	MediaType string       `gorm:"column:media_type"`
	Status    RecordStatus `gorm:"column:status"`
	Rating    int          `gorm:"column:rating"`
	CreatedAt time.Time    `gorm:"autoCreateTime;column:created_at"`
	UpdatedAt time.Time    `gorm:"autoUpdateTime;column:updated_at"`
}

// TableName specifies the table name for GORM
func (r *Record) TableName() string {
	return "user_records"
}

// NewRecord creates a new record entity
func NewRecord(id, userID string, tmdbID int, mediaType string) *Record {
	return &Record{
		ID:        id,
		UserID:    userID,
		TMDBID:    tmdbID,
		MediaType: mediaType,
		Status:    StatusWant,
		Rating:    0,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
}

// SetWatched marks record as watched with rating
func (r *Record) SetWatched(rating int) error {
	if rating < 0 || rating > 10 {
		return ErrInvalidRating
	}
	r.Status = StatusWatched
	r.Rating = rating
	r.UpdatedAt = time.Now()
	return nil
}

// SetWatching marks record as currently watching
func (r *Record) SetWatching() {
	r.Status = StatusWatching
	r.UpdatedAt = time.Now()
}

// SetWant marks record as want to watch
func (r *Record) SetWant() {
	r.Status = StatusWant
	r.UpdatedAt = time.Now()
}

// UpdateRating updates the rating
func (r *Record) UpdateRating(rating int) error {
	if rating < 0 || rating > 10 {
		return ErrInvalidRating
	}
	r.Rating = rating
	r.UpdatedAt = time.Now()
	return nil
}

// ToDTO converts entity to response DTO (without title/poster_path)
func (r *Record) ToDTO() *RecordDTO {
	return &RecordDTO{
		ID:         r.ID,
		UserID:     r.UserID,
		TMDBID:     r.TMDBID,
		MediaType:  r.MediaType,
		Status:     string(r.Status),
		Rating:     r.Rating,
		CreatedAt:  r.CreatedAt.Format(time.RFC3339),
		UpdatedAt:  r.UpdatedAt.Format(time.RFC3339),
	}
}

// RecordDTO is the data transfer object for responses
type RecordDTO struct {
	ID         string `json:"id"`
	UserID     string `json:"user_id"`
	TMDBID     int    `json:"tmdb_id"`
	MediaType  string `json:"media_type"`
	Status     string `json:"status"`
	Rating     int    `json:"rating"`
	Title      string `json:"title"`
	PosterPath string `json:"poster_path"`
	CreatedAt  string `json:"created_at"`
	UpdatedAt  string `json:"updated_at"`
}

// RecordStatsDTO for statistics
type RecordStatsDTO struct {
	TotalRecords   int     `json:"total_records"`
	MoviesWatched  int     `json:"movies_watched"`
	ShowsWatched   int     `json:"shows_watched"`
	AverageRating  float64 `json:"average_rating"`
	HighestRating  int     `json:"highest_rating"`
	RatedCount     int     `json:"rated_count"`
}
