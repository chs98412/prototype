package repository

import (
	"context"
	"errors"
	"fmt"
	"github.com/chs98412/prototype/backend/domain/entity"
	domainrepo "github.com/chs98412/prototype/backend/domain/repository"
	"gorm.io/gorm"
)

// TrackRatingRepositoryImpl implements TrackRatingRepository interface
type TrackRatingRepositoryImpl struct {
	db *gorm.DB
}

// NewTrackRatingRepository creates a new track rating repository
func NewTrackRatingRepository(db *gorm.DB) domainrepo.TrackRatingRepository {
	return &TrackRatingRepositoryImpl{db: db}
}

// GetByID retrieves a track rating by ID
func (r *TrackRatingRepositoryImpl) GetByID(ctx context.Context, id string) (*entity.TrackRating, error) {
	rating := &entity.TrackRating{}
	if err := r.db.WithContext(ctx).Where("id = ?", id).First(rating).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("rating not found")
		}
		return nil, fmt.Errorf("failed to query rating: %w", err)
	}
	return rating, nil
}

// GetByTrackID retrieves a track rating by user and track ID
func (r *TrackRatingRepositoryImpl) GetByTrackID(ctx context.Context, userID, trackSpotifyID string) (*entity.TrackRating, error) {
	rating := &entity.TrackRating{}
	if err := r.db.WithContext(ctx).
		Where("user_id = ? AND track_spotify_id = ?", userID, trackSpotifyID).
		First(rating).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("rating not found")
		}
		return nil, fmt.Errorf("failed to query rating: %w", err)
	}
	return rating, nil
}

// Save creates or updates a track rating using upsert semantics
func (r *TrackRatingRepositoryImpl) Save(ctx context.Context, rating *entity.TrackRating) error {
	if err := r.db.WithContext(ctx).Save(rating).Error; err != nil {
		return fmt.Errorf("failed to save rating: %w", err)
	}
	return nil
}

// Delete removes a track rating
func (r *TrackRatingRepositoryImpl) Delete(ctx context.Context, userID, trackSpotifyID string) error {
	if err := r.db.WithContext(ctx).
		Where("user_id = ? AND track_spotify_id = ?", userID, trackSpotifyID).
		Delete(&entity.TrackRating{}).Error; err != nil {
		return fmt.Errorf("failed to delete rating: %w", err)
	}
	return nil
}
