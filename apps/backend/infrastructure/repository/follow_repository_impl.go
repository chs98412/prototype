package repository

import (
	"context"
	"fmt"
	"github.com/chs98412/prototype/backend/domain/entity"
	domainrepo "github.com/chs98412/prototype/backend/domain/repository"
	"gorm.io/gorm"
)

// FollowRepositoryImpl implements FollowRepository interface
type FollowRepositoryImpl struct {
	db *gorm.DB
}

// NewFollowRepository creates a new follow repository
func NewFollowRepository(db *gorm.DB) domainrepo.FollowRepository {
	return &FollowRepositoryImpl{db: db}
}

// GetFollows retrieves users followed by a user
func (r *FollowRepositoryImpl) GetFollows(ctx context.Context, followerID string, limit, offset int) ([]entity.Follow, error) {
	var follows []entity.Follow
	if err := r.db.WithContext(ctx).
		Where("follower_id = ?", followerID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&follows).Error; err != nil {
		return nil, fmt.Errorf("failed to query follows: %w", err)
	}
	return follows, nil
}

// GetFollowers retrieves followers of a user
func (r *FollowRepositoryImpl) GetFollowers(ctx context.Context, followingID string, limit, offset int) ([]entity.Follow, error) {
	var follows []entity.Follow
	if err := r.db.WithContext(ctx).
		Where("following_id = ?", followingID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&follows).Error; err != nil {
		return nil, fmt.Errorf("failed to query followers: %w", err)
	}
	return follows, nil
}

// Create creates a new follow relationship
func (r *FollowRepositoryImpl) Create(ctx context.Context, follow *entity.Follow) (*entity.Follow, error) {
	isFollowing, err := r.IsFollowing(ctx, follow.FollowerID, follow.FollowingID)
	if err == nil && isFollowing {
		return follow, nil
	}

	if err := r.db.WithContext(ctx).Create(follow).Error; err != nil {
		return nil, fmt.Errorf("failed to create follow: %w", err)
	}

	return follow, nil
}

// Delete removes a follow relationship
func (r *FollowRepositoryImpl) Delete(ctx context.Context, followerID, followingID string) error {
	if err := r.db.WithContext(ctx).
		Where("follower_id = ? AND following_id = ?", followerID, followingID).
		Delete(&entity.Follow{}).Error; err != nil {
		return fmt.Errorf("failed to delete follow: %w", err)
	}
	return nil
}

// IsFollowing checks if a user follows another user
func (r *FollowRepositoryImpl) IsFollowing(ctx context.Context, followerID, followingID string) (bool, error) {
	var count int64
	if err := r.db.WithContext(ctx).
		Model(&entity.Follow{}).
		Where("follower_id = ? AND following_id = ?", followerID, followingID).
		Count(&count).Error; err != nil {
		return false, fmt.Errorf("failed to check follow: %w", err)
	}
	return count > 0, nil
}

// GetFollowCount retrieves follow and follower counts for a user
func (r *FollowRepositoryImpl) GetFollowCount(ctx context.Context, userID string) (followCount, followerCount int, err error) {
	var followCnt, followerCnt int64

	if err := r.db.WithContext(ctx).
		Model(&entity.Follow{}).
		Where("follower_id = ?", userID).
		Count(&followCnt).Error; err != nil {
		return 0, 0, fmt.Errorf("failed to query follow count: %w", err)
	}

	if err := r.db.WithContext(ctx).
		Model(&entity.Follow{}).
		Where("following_id = ?", userID).
		Count(&followerCnt).Error; err != nil {
		return 0, 0, fmt.Errorf("failed to query follower count: %w", err)
	}

	return int(followCnt), int(followerCnt), nil
}
