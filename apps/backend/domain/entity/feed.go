package entity

import (
	"time"

	dto "github.com/chs98412/prototype/backend/domain/dto"
)

// SocialFeedItem represents a mixed social feed item (review or record)
type SocialFeedItem struct {
	Kind        string    `json:"kind"` // "review" | "record"
	ID          string    `json:"id"`
	UserID      string    `json:"user_id"`
	DisplayName string    `json:"display_name"`
	AvatarURL   string    `json:"avatar_url"`
	TmdbID      int       `json:"tmdb_id"`
	Title       string    `json:"title"`
	PosterPath  string    `json:"poster_path"`
	Content     *string   `json:"content,omitempty"`
	LikeCount   int       `json:"like_count"`
	Rating      *int      `json:"rating,omitempty"`
	Spoiler     *bool     `json:"spoiler,omitempty"`
	EventTime   time.Time `json:"event_time"`
}

// FeedItem represents a friend's activity in the feed (legacy)
type FeedItem struct {
	ID         string
	UserID     string
	TMDBID     string
	MediaType  string
	Title      string
	PosterPath string
	Rating     int
	WatchedAt  time.Time
}

// ToDTO converts entity to DTO
func (f *FeedItem) ToDTO() *dto.FeedItemDTO {
	return &dto.FeedItemDTO{
		ID:         f.ID,
		UserID:     f.UserID,
		TMDBID:     f.TMDBID,
		MediaType:  f.MediaType,
		Title:      f.Title,
		PosterPath: f.PosterPath,
		Rating:     f.Rating,
		WatchedAt:  f.WatchedAt.Format(time.RFC3339),
	}
}
