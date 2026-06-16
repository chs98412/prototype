package dto

// TrackRatingDTO is the data transfer object for track rating responses
type TrackRatingDTO struct {
	ID             string `json:"id"`
	UserID         string `json:"user_id"`
	TrackSpotifyID string `json:"track_spotify_id"`
	Rating         int    `json:"rating"`
	ListenedAt     string `json:"listened_at"`
}
