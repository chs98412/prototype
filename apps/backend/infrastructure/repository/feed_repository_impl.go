package repository

import (
	"context"
	"fmt"
	"github.com/chs98412/prototype/backend/domain/entity"
	domainrepo "github.com/chs98412/prototype/backend/domain/repository"
	"gorm.io/gorm"
)

// FeedRepositoryImpl implements FeedRepository interface
type FeedRepositoryImpl struct {
	db *gorm.DB
}

// NewFeedRepository creates a new feed repository
func NewFeedRepository(db *gorm.DB) domainrepo.FeedRepository {
	return &FeedRepositoryImpl{db: db}
}

// GetFeed retrieves friend's activity feed
func (r *FeedRepositoryImpl) GetFeed(ctx context.Context, userID string, limit, offset int) ([]entity.FeedItem, error) {
	var items []entity.FeedItem
	if err := r.db.WithContext(ctx).
		Where("user_id IN (SELECT following_id FROM user_follows WHERE follower_id = ?)", userID).
		Order("watched_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&items).Error; err != nil {
		return nil, fmt.Errorf("failed to query feed: %w", err)
	}
	return items, nil
}
