package dto

// ReviewDTO is the data transfer object for review responses
type ReviewDTO struct {
	ID          string `json:"id"`
	UserID      string `json:"user_id"`
	DisplayName string `json:"display_name"`
	AvatarURL   string `json:"avatar_url"`
	TMDBID      int    `json:"tmdb_id"`
	MediaType   string `json:"media_type"`
	Kind        string `json:"kind"`
	ReviewTitle string `json:"review_title"`
	Title       string `json:"title"`
	PosterPath  string `json:"poster_path"`
	Content     string `json:"content"`
	Spoiler     bool   `json:"spoiler"`
	LikeCount   int    `json:"like_count"`
	CreatedAt   string `json:"created_at"`
	UpdatedAt   string `json:"updated_at"`
}
