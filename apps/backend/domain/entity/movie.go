package entity

import (
	"time"

	dto "github.com/chs98412/prototype/backend/domain/dto"
)

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

func (m *Movie) ToDTO() *dto.MovieDTO {
	return &dto.MovieDTO{
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
