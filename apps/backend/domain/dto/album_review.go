package dto

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
