package service

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/chs98412/prototype/backend/domain/entity"
	"github.com/chs98412/prototype/backend/domain/repository"
)

type MovieService interface {
	UpsertFromTMDB(ctx context.Context, tmdbID int) (*entity.Movie, error)
}

type MovieServiceImpl struct {
	repo repository.MovieRepository
}

func NewMovieService(repo repository.MovieRepository) MovieService {
	return &MovieServiceImpl{repo: repo}
}

type tmdbMovieResponse struct {
	ID            int    `json:"id"`
	Title         string `json:"title"`
	OriginalTitle string `json:"original_title"`
	PosterPath    string `json:"poster_path"`
	BackdropPath  string `json:"backdrop_path"`
	ReleaseDate   string `json:"release_date"`
	Overview      string `json:"overview"`
	Runtime       int    `json:"runtime"`
}

func (s *MovieServiceImpl) UpsertFromTMDB(ctx context.Context, tmdbID int) (*entity.Movie, error) {
	key := os.Getenv("TMDB_API_KEY")
	url := fmt.Sprintf("https://api.themoviedb.org/3/movie/%d?api_key=%s&language=ko-KR", tmdbID, key)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("tmdb returned %d", resp.StatusCode)
	}

	var t tmdbMovieResponse
	if err := json.NewDecoder(resp.Body).Decode(&t); err != nil {
		return nil, err
	}

	releaseYear := 0
	if len(t.ReleaseDate) >= 4 {
		releaseYear, _ = strconv.Atoi(strings.Split(t.ReleaseDate, "-")[0])
	}

	movie := &entity.Movie{
		ID:            t.ID,
		Title:         t.Title,
		OriginalTitle: t.OriginalTitle,
		PosterPath:    t.PosterPath,
		BackdropPath:  t.BackdropPath,
		ReleaseYear:   releaseYear,
		Overview:      t.Overview,
		Runtime:       t.Runtime,
	}

	if err := s.repo.Upsert(ctx, movie); err != nil {
		return nil, err
	}
	return movie, nil
}
