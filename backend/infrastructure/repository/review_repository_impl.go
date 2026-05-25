package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/chs98412/prototype/backend/domain"
	"github.com/chs98412/prototype/backend/domain/entity"
	domainrepo "github.com/chs98412/prototype/backend/domain/repository"
	"github.com/chs98412/prototype/backend/pkg/supabase"
)

// ReviewRepositoryImpl implements ReviewRepository interface
type ReviewRepositoryImpl struct {
	db *supabase.Client
}

// NewReviewRepository creates a new review repository
func NewReviewRepository(db *supabase.Client) domainrepo.ReviewRepository {
	return &ReviewRepositoryImpl{db: db}
}

// GetByID retrieves a review by ID
func (r *ReviewRepositoryImpl) GetByID(ctx context.Context, reviewID string) (*entity.Review, error) {
	result, err := r.db.Query(
		"SELECT id, user_id, tmdb_id, content, spoiler, like_count, created_at, updated_at FROM reviews WHERE id = $1",
		reviewID,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to query review: %w", err)
	}

	var reviews []map[string]interface{}
	if err := json.Unmarshal(result, &reviews); err != nil {
		return nil, fmt.Errorf("failed to parse review: %w", err)
	}

	if len(reviews) == 0 {
		return nil, domain.ErrNotFound
	}

	return r.mapToEntity(reviews[0]), nil
}

// GetByTMDBID retrieves reviews by TMDB ID
func (r *ReviewRepositoryImpl) GetByTMDBID(ctx context.Context, tmdbID int, limit, offset int) ([]entity.Review, error) {
	result, err := r.db.Query(
		`SELECT id, user_id, tmdb_id, content, spoiler, like_count, created_at, updated_at
		 FROM reviews WHERE tmdb_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
		tmdbID, limit, offset,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to query reviews: %w", err)
	}

	var reviews []map[string]interface{}
	if err := json.Unmarshal(result, &reviews); err != nil {
		return nil, fmt.Errorf("failed to parse reviews: %w", err)
	}

	entities := make([]entity.Review, 0, len(reviews))
	for _, review := range reviews {
		entities = append(entities, *r.mapToEntity(review))
	}

	return entities, nil
}

// GetByUserID retrieves reviews by user ID
func (r *ReviewRepositoryImpl) GetByUserID(ctx context.Context, userID string, limit, offset int) ([]entity.Review, error) {
	result, err := r.db.Query(
		`SELECT id, user_id, tmdb_id, content, spoiler, like_count, created_at, updated_at
		 FROM reviews WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
		userID, limit, offset,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to query reviews: %w", err)
	}

	var reviews []map[string]interface{}
	if err := json.Unmarshal(result, &reviews); err != nil {
		return nil, fmt.Errorf("failed to parse reviews: %w", err)
	}

	entities := make([]entity.Review, 0, len(reviews))
	for _, review := range reviews {
		entities = append(entities, *r.mapToEntity(review))
	}

	return entities, nil
}

// List retrieves all reviews
func (r *ReviewRepositoryImpl) List(ctx context.Context, limit, offset int) ([]entity.Review, error) {
	result, err := r.db.Query(
		`SELECT id, user_id, tmdb_id, content, spoiler, like_count, created_at, updated_at
		 FROM reviews ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
		limit, offset,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to query reviews: %w", err)
	}

	var reviews []map[string]interface{}
	if err := json.Unmarshal(result, &reviews); err != nil {
		return nil, fmt.Errorf("failed to parse reviews: %w", err)
	}

	entities := make([]entity.Review, 0, len(reviews))
	for _, review := range reviews {
		entities = append(entities, *r.mapToEntity(review))
	}

	return entities, nil
}

// GetUserReviewByTMDB retrieves a user's review for a specific TMDB ID
func (r *ReviewRepositoryImpl) GetUserReviewByTMDB(ctx context.Context, userID string, tmdbID int) (*entity.Review, error) {
	result, err := r.db.Query(
		`SELECT id, user_id, tmdb_id, content, spoiler, like_count, created_at, updated_at
		 FROM reviews WHERE user_id = $1 AND tmdb_id = $2`,
		userID, tmdbID,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to query review: %w", err)
	}

	var reviews []map[string]interface{}
	if err := json.Unmarshal(result, &reviews); err != nil {
		return nil, fmt.Errorf("failed to parse review: %w", err)
	}

	if len(reviews) == 0 {
		return nil, domain.ErrNotFound
	}

	return r.mapToEntity(reviews[0]), nil
}

// Save creates a new review (upsert)
func (r *ReviewRepositoryImpl) Save(ctx context.Context, review *entity.Review) error {
	result, err := r.db.Query(
		`INSERT INTO reviews (id, user_id, tmdb_id, content, spoiler, like_count, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		 ON CONFLICT (user_id, tmdb_id) DO UPDATE SET
		   content = $4, spoiler = $5, updated_at = $8
		 RETURNING id`,
		review.ID, review.UserID, review.TMDBID, review.Content, review.Spoiler,
		review.LikeCount, review.CreatedAt, review.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to save review: %w", err)
	}

	var saved []map[string]interface{}
	if err := json.Unmarshal(result, &saved); err != nil {
		return fmt.Errorf("failed to parse result: %w", err)
	}

	if len(saved) == 0 {
		return fmt.Errorf("review not created")
	}

	return nil
}

// Update updates an existing review
func (r *ReviewRepositoryImpl) Update(ctx context.Context, review *entity.Review) error {
	result, err := r.db.Query(
		`UPDATE reviews SET content = $1, spoiler = $2, updated_at = $3
		 WHERE id = $4 AND user_id = $5 RETURNING id`,
		review.Content, review.Spoiler, review.UpdatedAt, review.ID, review.UserID,
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

// Delete removes a review
func (r *ReviewRepositoryImpl) Delete(ctx context.Context, reviewID, userID string) error {
	err := r.db.Exec("DELETE FROM reviews WHERE id = $1 AND user_id = $2", reviewID, userID)
	if err != nil {
		return fmt.Errorf("failed to delete review: %w", err)
	}
	return nil
}

// GetLikeCount retrieves the like count for a review
func (r *ReviewRepositoryImpl) GetLikeCount(ctx context.Context, reviewID string) (int, error) {
	result, err := r.db.Query(
		"SELECT like_count FROM reviews WHERE id = $1",
		reviewID,
	)
	if err != nil {
		return 0, fmt.Errorf("failed to query like count: %w", err)
	}

	var reviews []map[string]interface{}
	if err := json.Unmarshal(result, &reviews); err != nil {
		return 0, fmt.Errorf("failed to parse result: %w", err)
	}

	if len(reviews) == 0 {
		return 0, domain.ErrNotFound
	}

	if v, ok := reviews[0]["like_count"].(float64); ok {
		return int(v), nil
	}

	return 0, nil
}

// Helper: map database result to entity
func (r *ReviewRepositoryImpl) mapToEntity(data map[string]interface{}) *entity.Review {
	review := &entity.Review{}

	if v, ok := data["id"].(string); ok {
		review.ID = v
	}
	if v, ok := data["user_id"].(string); ok {
		review.UserID = v
	}
	if v, ok := data["tmdb_id"].(float64); ok {
		review.TMDBID = int(v)
	}
	if v, ok := data["content"].(string); ok {
		review.Content = v
	}
	if v, ok := data["spoiler"].(bool); ok {
		review.Spoiler = v
	}
	if v, ok := data["like_count"].(float64); ok {
		review.LikeCount = int(v)
	}

	return review
}
