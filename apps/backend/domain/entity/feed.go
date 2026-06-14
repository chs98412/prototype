package entity

import "time"

// SocialFeedItem represents a mixed social feed item (review or record)
type SocialFeedItem struct {
	Kind        string     `json:"kind"` // "review" | "record"
	ID          string     `json:"id"`
	UserID      string     `json:"user_id"`
	DisplayName string     `json:"display_name"`
	AvatarURL   string     `json:"avatar_url"`
	TmdbID      int        `json:"tmdb_id"`
	Content     *string    `json:"content,omitempty"`
	LikeCount   int        `json:"like_count"`
	Rating      *int       `json:"rating,omitempty"`
	Spoiler     *bool      `json:"spoiler,omitempty"`
	EventTime   time.Time  `json:"event_time"`
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

// FeedItemDTO is the data transfer object for feed items (legacy)
type FeedItemDTO struct {
	ID         string `json:"id"`
	UserID     string `json:"user_id"`
	TMDBID     string `json:"tmdb_id"`
	MediaType  string `json:"media_type"`
	Title      string `json:"title"`
	PosterPath string `json:"poster_path"`
	Rating     int    `json:"rating"`
	WatchedAt  string `json:"watched_at"`
}

// ToDTO converts entity to DTO
func (f *FeedItem) ToDTO() *FeedItemDTO {
	return &FeedItemDTO{
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
