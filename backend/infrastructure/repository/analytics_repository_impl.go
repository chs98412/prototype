package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/chs98412/prototype/backend/domain/entity"
	domainrepo "github.com/chs98412/prototype/backend/domain/repository"
	"github.com/chs98412/prototype/backend/pkg/supabase"
)

// AnalyticsRepositoryImpl implements AnalyticsRepository interface
type AnalyticsRepositoryImpl struct {
	db *supabase.Client
}

// NewAnalyticsRepository creates a new analytics repository
func NewAnalyticsRepository(db *supabase.Client) domainrepo.AnalyticsRepository {
	return &AnalyticsRepositoryImpl{db: db}
}

// GetHeatmap retrieves user's activity heatmap by date
func (r *AnalyticsRepositoryImpl) GetHeatmap(ctx context.Context, userID string) ([]entity.HeatmapEntry, error) {
	result, err := r.db.Query(
		`SELECT
			DATE(watched_at) as activity_date,
			COUNT(*) as cnt
		 FROM user_records
		 WHERE user_id = $1
		 GROUP BY DATE(watched_at)
		 ORDER BY DATE(watched_at) DESC`,
		userID,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to query heatmap: %w", err)
	}

	var entries []entity.HeatmapEntry
	if err := json.Unmarshal(result, &entries); err != nil {
		return nil, fmt.Errorf("failed to parse heatmap: %w", err)
	}

	return entries, nil
}

// GetGenreRatings retrieves user's genre preferences and ratings
func (r *AnalyticsRepositoryImpl) GetGenreRatings(ctx context.Context, userID string) ([]entity.GenreRating, error) {
	result, err := r.db.Query(
		`SELECT
			JSONB_ARRAY_ELEMENTS(genre_ids) as genre_id,
			AVG(rating) as avg_rating,
			COUNT(*) as count
		 FROM user_records
		 WHERE user_id = $1 AND rating > 0
		 GROUP BY genre_id
		 ORDER BY avg_rating DESC`,
		userID,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to query genre ratings: %w", err)
	}

	var ratings []entity.GenreRating
	if err := json.Unmarshal(result, &ratings); err != nil {
		return nil, fmt.Errorf("failed to parse genre ratings: %w", err)
	}

	return ratings, nil
}

// GetTasteMatch retrieves taste compatibility between two users
func (r *AnalyticsRepositoryImpl) GetTasteMatch(ctx context.Context, userID, otherUserID string) (*entity.TasteMatch, error) {
	result, err := r.db.Query(
		`SELECT
			COUNT(DISTINCT CASE WHEN ur1.tmdb_id = ur2.tmdb_id THEN ur1.tmdb_id END) as common_titles,
			AVG(CASE WHEN ur1.tmdb_id = ur2.tmdb_id THEN ABS(ur1.rating - ur2.rating) END) as avg_rating_diff,
			ROUND(
				100.0 * COUNT(DISTINCT CASE WHEN ur1.tmdb_id = ur2.tmdb_id THEN ur1.tmdb_id END)
				/ GREATEST(COUNT(DISTINCT ur1.tmdb_id), COUNT(DISTINCT ur2.tmdb_id), 1)
			, 2) as compatibility_score
		 FROM user_records ur1
		 CROSS JOIN user_records ur2
		 WHERE ur1.user_id = $1
		 AND ur2.user_id = $2`,
		userID, otherUserID,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to query taste match: %w", err)
	}

	var matches []entity.TasteMatch
	if err := json.Unmarshal(result, &matches); err != nil {
		return nil, fmt.Errorf("failed to parse taste match: %w", err)
	}

	if len(matches) == 0 {
		return &entity.TasteMatch{}, nil
	}

	return &matches[0], nil
}

// GetCommonWorks retrieves common works watched by both users
func (r *AnalyticsRepositoryImpl) GetCommonWorks(ctx context.Context, userID, otherUserID string) ([]entity.CommonWork, error) {
	result, err := r.db.Query(
		`SELECT
			ur1.tmdb_id,
			ur1.media_type,
			ur1.title,
			ur1.poster_path,
			ur1.rating
		 FROM user_records ur1
		 WHERE ur1.user_id = $1
		 AND EXISTS (
			SELECT 1 FROM user_records ur2
			WHERE ur2.user_id = $2
			AND ur2.tmdb_id = ur1.tmdb_id
			AND ur2.media_type = ur1.media_type
		 )
		 ORDER BY ur1.watched_at DESC`,
		userID, otherUserID,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to query common works: %w", err)
	}

	var works []entity.CommonWork
	if err := json.Unmarshal(result, &works); err != nil {
		return nil, fmt.Errorf("failed to parse common works: %w", err)
	}

	return works, nil
}
