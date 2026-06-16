package dto

// RecordDTO is the data transfer object for record responses
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
	TotalRecords  int     `json:"total_records"`
	MoviesWatched int     `json:"movies_watched"`
	ShowsWatched  int     `json:"shows_watched"`
	AverageRating float64 `json:"average_rating"`
	HighestRating int     `json:"highest_rating"`
	RatedCount    int     `json:"rated_count"`
}
