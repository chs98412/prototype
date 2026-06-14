package repository

import (
	"context"
	"github.com/chs98412/prototype/backend/domain/entity"
)

// FeedRepository defines repository interface for feed operations
type FeedRepository interface {
	GetFeed(ctx context.Context, userID string, limit, offset int) ([]entity.FeedItem, error)
	GetSocialFeed(ctx context.Context, userID string, limit, offset int) ([]entity.SocialFeedItem, error)
}
