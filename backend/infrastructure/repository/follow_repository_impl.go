package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/chs98412/prototype/backend/domain/entity"
	domainrepo "github.com/chs98412/prototype/backend/domain/repository"
	"github.com/chs98412/prototype/backend/pkg/supabase"
)

// FollowRepositoryImpl implements FollowRepository interface
type FollowRepositoryImpl struct {
	db *supabase.Client
}

// NewFollowRepository creates a new follow repository
func NewFollowRepository(db *supabase.Client) domainrepo.FollowRepository {
	return &FollowRepositoryImpl{db: db}
}

// GetFollows retrieves users followed by a user
func (r *FollowRepositoryImpl) GetFollows(ctx context.Context, followerID string, limit, offset int) ([]entity.Follow, error) {
	result, err := r.db.Query(
		`SELECT id, follower_id, following_id, created_at FROM user_follows
		 WHERE follower_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
		followerID, limit, offset,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to query follows: %w", err)
	}

	var follows []map[string]interface{}
	if err := json.Unmarshal(result, &follows); err != nil {
		return nil, fmt.Errorf("failed to parse follows: %w", err)
	}

	entities := make([]entity.Follow, 0, len(follows))
	for _, follow := range follows {
		entities = append(entities, *r.mapToEntity(follow))
	}

	return entities, nil
}

// GetFollowers retrieves followers of a user
func (r *FollowRepositoryImpl) GetFollowers(ctx context.Context, followingID string, limit, offset int) ([]entity.Follow, error) {
	result, err := r.db.Query(
		`SELECT id, follower_id, following_id, created_at FROM user_follows
		 WHERE following_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
		followingID, limit, offset,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to query followers: %w", err)
	}

	var follows []map[string]interface{}
	if err := json.Unmarshal(result, &follows); err != nil {
		return nil, fmt.Errorf("failed to parse followers: %w", err)
	}

	entities := make([]entity.Follow, 0, len(follows))
	for _, follow := range follows {
		entities = append(entities, *r.mapToEntity(follow))
	}

	return entities, nil
}

// Create creates a new follow relationship
func (r *FollowRepositoryImpl) Create(ctx context.Context, follow *entity.Follow) (*entity.Follow, error) {
	// Check if already following
	isFollowing, err := r.IsFollowing(ctx, follow.FollowerID, follow.FollowingID)
	if err == nil && isFollowing {
		return follow, nil // Already following, return success
	}

	result, err := r.db.Query(
		`INSERT INTO user_follows (id, follower_id, following_id, created_at)
		 VALUES ($1, $2, $3, $4) RETURNING id`,
		follow.ID, follow.FollowerID, follow.FollowingID, follow.CreatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create follow: %w", err)
	}

	var created []map[string]interface{}
	if err := json.Unmarshal(result, &created); err != nil {
		return nil, fmt.Errorf("failed to parse result: %w", err)
	}

	if len(created) == 0 {
		return nil, fmt.Errorf("follow not created")
	}

	return follow, nil
}

// Delete removes a follow relationship
func (r *FollowRepositoryImpl) Delete(ctx context.Context, followerID, followingID string) error {
	err := r.db.Exec(
		"DELETE FROM user_follows WHERE follower_id = $1 AND following_id = $2",
		followerID, followingID,
	)
	if err != nil {
		return fmt.Errorf("failed to delete follow: %w", err)
	}
	return nil
}

// IsFollowing checks if a user follows another user
func (r *FollowRepositoryImpl) IsFollowing(ctx context.Context, followerID, followingID string) (bool, error) {
	result, err := r.db.Query(
		"SELECT id FROM user_follows WHERE follower_id = $1 AND following_id = $2",
		followerID, followingID,
	)
	if err != nil {
		return false, fmt.Errorf("failed to check follow: %w", err)
	}

	var follows []map[string]interface{}
	if err := json.Unmarshal(result, &follows); err != nil {
		return false, fmt.Errorf("failed to parse result: %w", err)
	}

	return len(follows) > 0, nil
}

// GetFollowCount retrieves follow and follower counts for a user
func (r *FollowRepositoryImpl) GetFollowCount(ctx context.Context, userID string) (followCount, followerCount int, err error) {
	result, err := r.db.Query(
		`SELECT
			(SELECT COUNT(*) FROM user_follows WHERE follower_id = $1) as follow_count,
			(SELECT COUNT(*) FROM user_follows WHERE following_id = $1) as follower_count`,
		userID,
	)
	if err != nil {
		return 0, 0, fmt.Errorf("failed to query counts: %w", err)
	}

	var counts []map[string]interface{}
	if err := json.Unmarshal(result, &counts); err != nil {
		return 0, 0, fmt.Errorf("failed to parse counts: %w", err)
	}

	if len(counts) > 0 {
		if v, ok := counts[0]["follow_count"].(float64); ok {
			followCount = int(v)
		}
		if v, ok := counts[0]["follower_count"].(float64); ok {
			followerCount = int(v)
		}
	}

	return followCount, followerCount, nil
}

// Helper: map database result to entity
func (r *FollowRepositoryImpl) mapToEntity(data map[string]interface{}) *entity.Follow {
	follow := &entity.Follow{}

	if v, ok := data["id"].(string); ok {
		follow.ID = v
	}
	if v, ok := data["follower_id"].(string); ok {
		follow.FollowerID = v
	}
	if v, ok := data["following_id"].(string); ok {
		follow.FollowingID = v
	}

	return follow
}
