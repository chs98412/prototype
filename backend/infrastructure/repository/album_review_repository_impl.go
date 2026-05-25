package repository

import (
	"context"
	"errors"
	"fmt"
	"github.com/chs98412/prototype/backend/domain/entity"
	domainrepo "github.com/chs98412/prototype/backend/domain/repository"
	"gorm.io/gorm"
)

// AlbumReviewRepositoryImpl implements AlbumReviewRepository interface
type AlbumReviewRepositoryImpl struct {
	db *gorm.DB
}

// NewAlbumReviewRepository creates a new album review repository
func NewAlbumReviewRepository(db *gorm.DB) domainrepo.AlbumReviewRepository {
	return &AlbumReviewRepositoryImpl{db: db}
}

// GetByID retrieves an album review by ID
func (r *AlbumReviewRepositoryImpl) GetByID(ctx context.Context, id string) (*entity.AlbumReview, error) {
	review := &entity.AlbumReview{}
	if err := r.db.WithContext(ctx).Where("id = ?", id).First(review).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("review not found")
		}
		return nil, fmt.Errorf("failed to query review: %w", err)
	}
	return review, nil
}

// GetByAlbumID retrieves an album review by user and album ID
func (r *AlbumReviewRepositoryImpl) GetByAlbumID(ctx context.Context, userID, albumSpotifyID string) (*entity.AlbumReview, error) {
	review := &entity.AlbumReview{}
	if err := r.db.WithContext(ctx).
		Where("user_id = ? AND album_spotify_id = ?", userID, albumSpotifyID).
		First(review).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("review not found")
		}
		return nil, fmt.Errorf("failed to query review: %w", err)
	}
	return review, nil
}

// Save creates a new album review
func (r *AlbumReviewRepositoryImpl) Save(ctx context.Context, review *entity.AlbumReview) error {
	if err := r.db.WithContext(ctx).Create(review).Error; err != nil {
		return fmt.Errorf("failed to save review: %w", err)
	}
	return nil
}

// Update updates an existing album review
func (r *AlbumReviewRepositoryImpl) Update(ctx context.Context, review *entity.AlbumReview) error {
	result := r.db.WithContext(ctx).
		Where("id = ? AND user_id = ?", review.ID, review.UserID).
		Updates(review)
	if result.Error != nil {
		return fmt.Errorf("failed to update review: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("review not found")
	}
	return nil
}

// Delete removes an album review
func (r *AlbumReviewRepositoryImpl) Delete(ctx context.Context, id string) error {
	if err := r.db.WithContext(ctx).Where("id = ?", id).Delete(&entity.AlbumReview{}).Error; err != nil {
		return fmt.Errorf("failed to delete review: %w", err)
	}
	return nil
}
