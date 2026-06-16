package dto

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
