package dto

// MovieDTO is the data transfer object for movie responses
type MovieDTO struct {
	ID            int    `json:"id"`
	Title         string `json:"title"`
	OriginalTitle string `json:"original_title"`
	PosterPath    string `json:"poster_path"`
	BackdropPath  string `json:"backdrop_path"`
	ReleaseYear   int    `json:"release_year"`
	Overview      string `json:"overview"`
	Runtime       int    `json:"runtime"`
}
