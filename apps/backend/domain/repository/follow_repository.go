package repository

import (
	"context"
	"github.com/chs98412/prototype/backend/domain/entity"
)

// FollowRepository defines repository interface for follow operations
type FollowRepository interface {
	GetFollows(ctx context.Context, followerID string, limit, offset int) ([]entity.Follow, error)
	GetFollowers(ctx context.Context, followingID string, limit, offset int) ([]entity.Follow, error)
	Create(ctx context.Context, follow *entity.Follow) (*entity.Follow, error)
	Delete(ctx context.Context, followerID, followingID string) error
	IsFollowing(ctx context.Context, followerID, followingID string) (bool, error)
	GetFollowCount(ctx context.Context, userID string) (followCount, followerCount int, err error)
}
