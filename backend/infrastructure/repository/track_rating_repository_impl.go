package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/chs98412/prototype/backend/domain/entity"
	domainrepo "github.com/chs98412/prototype/backend/domain/repository"
	"github.com/chs98412/prototype/backend/pkg/supabase"
)

// TrackRatingRepositoryImpl implements TrackRatingRepository interface
type TrackRatingRepositoryImpl struct {
	db *supabase.Client
}

// NewTrackRatingRepository creates a new track rating repository
func NewTrackRatingRepository(db *supabase.Client) domainrepo.TrackRatingRepository {
	return &TrackRatingRepositoryImpl{db: db}
}

// GetByID retrieves a track rating by ID
func (r *TrackRatingRepositoryImpl) GetByID(ctx context.Context, id string) (*entity.TrackRating, error) {
	result, err := r.db.Query(
		`SELECT id, user_id, track_spotify_id, rating, listened_at FROM track_records WHERE id = $1`,
		id,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to query rating: %w", err)
	}

	var ratings []map[string]interface{}
	if err := json.Unmarshal(result, &ratings); err != nil {
		return nil, fmt.Errorf("failed to parse rating: %w", err)
	}

	if len(ratings) == 0 {
		return nil, fmt.Errorf("rating not found")
	}

	return r.mapToEntity(ratings[0]), nil
}

// GetByTrackID retrieves a track rating by user and track ID
func (r *TrackRatingRepositoryImpl) GetByTrackID(ctx context.Context, userID, trackSpotifyID string) (*entity.TrackRating, error) {
	result, err := r.db.Query(
		`SELECT id, user_id, track_spotify_id, rating, listened_at FROM track_records
		 WHERE user_id = $1 AND track_spotify_id = $2`,
		userID, trackSpotifyID,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to query rating: %w", err)
	}

	var ratings []map[string]interface{}
	if err := json.Unmarshal(result, &ratings); err != nil {
		return nil, fmt.Errorf("failed to parse rating: %w", err)
	}

	if len(ratings) == 0 {
		return nil, fmt.Errorf("rating not found")
	}

	return r.mapToEntity(ratings[0]), nil
}

// Save creates or updates a track rating using upsert semantics
func (r *TrackRatingRepositoryImpl) Save(ctx context.Context, rating *entity.TrackRating) error {
	result, err := r.db.Query(
		`INSERT INTO track_records (id, user_id, track_spotify_id, rating, listened_at)
		 VALUES ($1, $2, $3, $4, $5)
		 ON CONFLICT (user_id, track_spotify_id) DO UPDATE
		 SET rating = EXCLUDED.rating,
		     listened_at = EXCLUDED.listened_at
		 RETURNING id`,
		rating.ID, rating.UserID, rating.TrackSpotifyID, rating.Rating, rating.ListenedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to save rating: %w", err)
	}

	var saved []map[string]interface{}
	if err := json.Unmarshal(result, &saved); err != nil {
		return fmt.Errorf("failed to parse result: %w", err)
	}

	if len(saved) == 0 {
		return fmt.Errorf("rating not saved")
	}

	return nil
}

// Delete removes a track rating
func (r *TrackRatingRepositoryImpl) Delete(ctx context.Context, userID, trackSpotifyID string) error {
	err := r.db.Exec(
		"DELETE FROM track_records WHERE user_id = $1 AND track_spotify_id = $2",
		userID, trackSpotifyID,
	)
	if err != nil {
		return fmt.Errorf("failed to delete rating: %w", err)
	}
	return nil
}

// Helper: map database result to entity
func (r *TrackRatingRepositoryImpl) mapToEntity(data map[string]interface{}) *entity.TrackRating {
	rating := &entity.TrackRating{}

	if v, ok := data["id"].(string); ok {
		rating.ID = v
	}
	if v, ok := data["user_id"].(string); ok {
		rating.UserID = v
	}
	if v, ok := data["track_spotify_id"].(string); ok {
		rating.TrackSpotifyID = v
	}
	if v, ok := data["rating"].(float64); ok {
		rating.Rating = int(v)
	}

	return rating
}
