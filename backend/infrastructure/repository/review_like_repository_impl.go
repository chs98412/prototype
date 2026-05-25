package repository

import (
	"context"
	"fmt"
	"github.com/chs98412/prototype/backend/domain/entity"
	domainrepo "github.com/chs98412/prototype/backend/domain/repository"
	"gorm.io/gorm"
)

// ReviewLikeRepositoryImpl implements ReviewLikeRepository interface
type ReviewLikeRepositoryImpl struct {
	db *gorm.DB
}

// NewReviewLikeRepository creates a new review like repository
func NewReviewLikeRepository(db *gorm.DB) domainrepo.ReviewLikeRepository {
	return &ReviewLikeRepositoryImpl{db: db}
}

// GetLikes retrieves likes for a review
func (r *ReviewLikeRepositoryImpl) GetLikes(ctx context.Context, reviewID string, limit, offset int) ([]entity.ReviewLike, error) {
	var likes []entity.ReviewLike
	if err := r.db.WithContext(ctx).
		Where("review_id = ?", reviewID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&likes).Error; err != nil {
		return nil, fmt.Errorf("failed to query likes: %w", err)
	}
	return likes, nil
}

// IsLiked checks if a user liked a review
func (r *ReviewLikeRepositoryImpl) IsLiked(ctx context.Context, reviewID, userID string) (bool, error) {
	var count int64
	if err := r.db.WithContext(ctx).
		Model(&entity.ReviewLike{}).
		Where("review_id = ? AND user_id = ?", reviewID, userID).
		Count(&count).Error; err != nil {
		return false, fmt.Errorf("failed to check like: %w", err)
	}
	return count > 0, nil
}

// Create creates a new like
func (r *ReviewLikeRepositoryImpl) Create(ctx context.Context, like *entity.ReviewLike) error {
	if err := r.db.WithContext(ctx).Create(like).Error; err != nil {
		return fmt.Errorf("failed to create like: %w", err)
	}
	return nil
}

// Delete removes a like
func (r *ReviewLikeRepositoryImpl) Delete(ctx context.Context, reviewID, userID string) error {
	if err := r.db.WithContext(ctx).
		Where("review_id = ? AND user_id = ?", reviewID, userID).
		Delete(&entity.ReviewLike{}).Error; err != nil {
		return fmt.Errorf("failed to delete like: %w", err)
	}
	return nil
}

// GetLikeCount retrieves the number of likes for a review
func (r *ReviewLikeRepositoryImpl) GetLikeCount(ctx context.Context, reviewID string) (int, error) {
	var count int64
	if err := r.db.WithContext(ctx).
		Model(&entity.ReviewLike{}).
		Where("review_id = ?", reviewID).
		Count(&count).Error; err != nil {
		return 0, fmt.Errorf("failed to query count: %w", err)
	}
	return int(count), nil
}
