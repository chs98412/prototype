package entity

// HeatmapEntry represents a single day's activity
type HeatmapEntry struct {
	ActivityDate string `json:"activity_date"`
	Count        int    `json:"cnt"`
}

// GenreRating represents user's rating for a genre
type GenreRating struct {
	GenreID   string  `json:"genre_id"`
	AvgRating float64 `json:"avg_rating"`
	Count     int     `json:"count"`
}

// TasteMatch represents taste compatibility between two users
type TasteMatch struct {
	CommonTitles       int     `json:"common_titles"`
	AvgRatingDiff      float64 `json:"avg_rating_diff"`
	CompatibilityScore float64 `json:"compatibility_score"`
}

// CommonWork represents a work watched by both users
type CommonWork struct {
	TMDBID    string `json:"tmdb_id"`
	MediaType string `json:"media_type"`
	Title     string `json:"title"`
	PosterPath string `json:"poster_path"`
	Rating    int    `json:"rating"`
}
