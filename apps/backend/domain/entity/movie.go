package entity

import "time"

// Movie stores TMDB movie metadata locally to avoid repeated API calls
type Movie struct {
	ID            int       `gorm:"primaryKey;column:id"` // TMDB ID
	Title         string    `gorm:"column:title"`
	OriginalTitle string    `gorm:"column:original_title"`
	PosterPath    string    `gorm:"column:poster_path"`
	BackdropPath  string    `gorm:"column:backdrop_path"`
	ReleaseYear   int       `gorm:"column:release_year"`
	Overview      string    `gorm:"column:overview"`
	Runtime       int       `gorm:"column:runtime"`
	CreatedAt     time.Time `gorm:"autoCreateTime;column:created_at"`
	UpdatedAt     time.Time `gorm:"autoUpdateTime;column:updated_at"`
}

func (m *Movie) TableName() string {
	return "movies"
}

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

func (m *Movie) ToDTO() *MovieDTO {
	return &MovieDTO{
		ID:            m.ID,
		Title:         m.Title,
		OriginalTitle: m.OriginalTitle,
		PosterPath:    m.PosterPath,
		BackdropPath:  m.BackdropPath,
		ReleaseYear:   m.ReleaseYear,
		Overview:      m.Overview,
		Runtime:       m.Runtime,
	}
}
