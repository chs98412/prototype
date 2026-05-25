package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/chs98412/prototype/backend/domain/entity"
	domainrepo "github.com/chs98412/prototype/backend/domain/repository"
	"github.com/chs98412/prototype/backend/pkg/supabase"
)

// ReviewLikeRepositoryImpl implements ReviewLikeRepository interface
type ReviewLikeRepositoryImpl struct {
	db *supabase.Client
}

// NewReviewLikeRepository creates a new review like repository
func NewReviewLikeRepository(db *supabase.Client) domainrepo.ReviewLikeRepository {
	return &ReviewLikeRepositoryImpl{db: db}
}

// GetLikes retrieves likes for a review
func (r *ReviewLikeRepositoryImpl) GetLikes(ctx context.Context, reviewID string, limit, offset int) ([]entity.ReviewLike, error) {
	result, err := r.db.Query(
		`SELECT id, review_id, user_id, created_at FROM review_likes
		 WHERE review_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
		reviewID, limit, offset,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to query likes: %w", err)
	}

	var likes []map[string]interface{}
	if err := json.Unmarshal(result, &likes); err != nil {
		return nil, fmt.Errorf("failed to parse likes: %w", err)
	}

	entities := make([]entity.ReviewLike, 0, len(likes))
	for _, like := range likes {
		entities = append(entities, *r.mapToEntity(like))
	}

	return entities, nil
}

// IsLiked checks if a user liked a review
func (r *ReviewLikeRepositoryImpl) IsLiked(ctx context.Context, reviewID, userID string) (bool, error) {
	result, err := r.db.Query(
		"SELECT id FROM review_likes WHERE review_id = $1 AND user_id = $2",
		reviewID, userID,
	)
	if err != nil {
		return false, fmt.Errorf("failed to check like: %w", err)
	}

	var likes []map[string]interface{}
	if err := json.Unmarshal(result, &likes); err != nil {
		return false, fmt.Errorf("failed to parse result: %w", err)
	}

	return len(likes) > 0, nil
}

// Create creates a new like
func (r *ReviewLikeRepositoryImpl) Create(ctx context.Context, like *entity.ReviewLike) error {
	result, err := r.db.Query(
		`INSERT INTO review_likes (id, review_id, user_id, created_at)
		 VALUES ($1, $2, $3, $4) RETURNING id`,
		like.ID, like.ReviewID, like.UserID, like.CreatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to create like: %w", err)
	}

	var created []map[string]interface{}
	if err := json.Unmarshal(result, &created); err != nil {
		return fmt.Errorf("failed to parse result: %w", err)
	}

	if len(created) == 0 {
		return fmt.Errorf("like not created")
	}

	return nil
}

// Delete removes a like
func (r *ReviewLikeRepositoryImpl) Delete(ctx context.Context, reviewID, userID string) error {
	err := r.db.Exec(
		"DELETE FROM review_likes WHERE review_id = $1 AND user_id = $2",
		reviewID, userID,
	)
	if err != nil {
		return fmt.Errorf("failed to delete like: %w", err)
	}
	return nil
}

// GetLikeCount retrieves the number of likes for a review
func (r *ReviewLikeRepositoryImpl) GetLikeCount(ctx context.Context, reviewID string) (int, error) {
	result, err := r.db.Query(
		"SELECT COUNT(*) as count FROM review_likes WHERE review_id = $1",
		reviewID,
	)
	if err != nil {
		return 0, fmt.Errorf("failed to query count: %w", err)
	}

	var counts []map[string]interface{}
	if err := json.Unmarshal(result, &counts); err != nil {
		return 0, fmt.Errorf("failed to parse count: %w", err)
	}

	if len(counts) > 0 {
		if v, ok := counts[0]["count"].(float64); ok {
			return int(v), nil
		}
	}

	return 0, nil
}

// Helper: map database result to entity
func (r *ReviewLikeRepositoryImpl) mapToEntity(data map[string]interface{}) *entity.ReviewLike {
	like := &entity.ReviewLike{}

	if v, ok := data["id"].(string); ok {
		like.ID = v
	}
	if v, ok := data["review_id"].(string); ok {
		like.ReviewID = v
	}
	if v, ok := data["user_id"].(string); ok {
		like.UserID = v
	}

	return like
}
