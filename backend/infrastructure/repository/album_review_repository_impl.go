package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/chs98412/prototype/backend/domain/entity"
	domainrepo "github.com/chs98412/prototype/backend/domain/repository"
	"github.com/chs98412/prototype/backend/pkg/supabase"
)

// AlbumReviewRepositoryImpl implements AlbumReviewRepository interface
type AlbumReviewRepositoryImpl struct {
	db *supabase.Client
}

// NewAlbumReviewRepository creates a new album review repository
func NewAlbumReviewRepository(db *supabase.Client) domainrepo.AlbumReviewRepository {
	return &AlbumReviewRepositoryImpl{db: db}
}

// GetByID retrieves an album review by ID
func (r *AlbumReviewRepositoryImpl) GetByID(ctx context.Context, id string) (*entity.AlbumReview, error) {
	result, err := r.db.Query(
		`SELECT id, user_id, album_spotify_id, content, has_spoiler, created_at, updated_at
		 FROM album_reviews WHERE id = $1`,
		id,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to query review: %w", err)
	}

	var reviews []map[string]interface{}
	if err := json.Unmarshal(result, &reviews); err != nil {
		return nil, fmt.Errorf("failed to parse review: %w", err)
	}

	if len(reviews) == 0 {
		return nil, fmt.Errorf("review not found")
	}

	return r.mapToEntity(reviews[0]), nil
}

// GetByAlbumID retrieves an album review by user and album ID
func (r *AlbumReviewRepositoryImpl) GetByAlbumID(ctx context.Context, userID, albumSpotifyID string) (*entity.AlbumReview, error) {
	result, err := r.db.Query(
		`SELECT id, user_id, album_spotify_id, content, has_spoiler, created_at, updated_at
		 FROM album_reviews WHERE user_id = $1 AND album_spotify_id = $2`,
		userID, albumSpotifyID,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to query review: %w", err)
	}

	var reviews []map[string]interface{}
	if err := json.Unmarshal(result, &reviews); err != nil {
		return nil, fmt.Errorf("failed to parse review: %w", err)
	}

	if len(reviews) == 0 {
		return nil, fmt.Errorf("review not found")
	}

	return r.mapToEntity(reviews[0]), nil
}

// Save creates a new album review
func (r *AlbumReviewRepositoryImpl) Save(ctx context.Context, review *entity.AlbumReview) error {
	result, err := r.db.Query(
		`INSERT INTO album_reviews (id, user_id, album_spotify_id, content, has_spoiler, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
		review.ID, review.UserID, review.AlbumSpotifyID, review.Content, review.HasSpoiler,
		review.CreatedAt, review.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to save review: %w", err)
	}

	var saved []map[string]interface{}
	if err := json.Unmarshal(result, &saved); err != nil {
		return fmt.Errorf("failed to parse result: %w", err)
	}

	if len(saved) == 0 {
		return fmt.Errorf("review not saved")
	}

	return nil
}

// Update updates an existing album review
func (r *AlbumReviewRepositoryImpl) Update(ctx context.Context, review *entity.AlbumReview) error {
	result, err := r.db.Query(
		`UPDATE album_reviews
		 SET content = $1, has_spoiler = $2, updated_at = $3
		 WHERE id = $4 AND user_id = $5 RETURNING id`,
		review.Content, review.HasSpoiler, review.UpdatedAt, review.ID, review.UserID,
	)
	if err != nil {
		return fmt.Errorf("failed to update review: %w", err)
	}

	var updated []map[string]interface{}
	if err := json.Unmarshal(result, &updated); err != nil {
		return fmt.Errorf("failed to parse result: %w", err)
	}

	if len(updated) == 0 {
		return fmt.Errorf("review not found")
	}

	return nil
}

// Delete removes an album review
func (r *AlbumReviewRepositoryImpl) Delete(ctx context.Context, id string) error {
	err := r.db.Exec(
		"DELETE FROM album_reviews WHERE id = $1",
		id,
	)
	if err != nil {
		return fmt.Errorf("failed to delete review: %w", err)
	}
	return nil
}

// Helper: map database result to entity
func (r *AlbumReviewRepositoryImpl) mapToEntity(data map[string]interface{}) *entity.AlbumReview {
	review := &entity.AlbumReview{}

	if v, ok := data["id"].(string); ok {
		review.ID = v
	}
	if v, ok := data["user_id"].(string); ok {
		review.UserID = v
	}
	if v, ok := data["album_spotify_id"].(string); ok {
		review.AlbumSpotifyID = v
	}
	if v, ok := data["content"].(string); ok {
		review.Content = v
	}
	if v, ok := data["has_spoiler"].(bool); ok {
		review.HasSpoiler = v
	}

	return review
}
