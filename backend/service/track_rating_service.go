package service

import (
	"context"
	"github.com/chs98412/prototype/backend/domain"
	"github.com/chs98412/prototype/backend/domain/entity"
	"github.com/chs98412/prototype/backend/domain/repository"
	"github.com/google/uuid"
)

// TrackRatingService interface
type TrackRatingService interface {
	RateTrack(ctx context.Context, userID, trackSpotifyID string, rating int) (*entity.TrackRatingDTO, error)
	GetRating(ctx context.Context, userID, trackSpotifyID string) (*entity.TrackRatingDTO, error)
	DeleteRating(ctx context.Context, userID, trackSpotifyID string) error
}

// TrackRatingServiceImpl implements TrackRatingService
type TrackRatingServiceImpl struct {
	repo repository.TrackRatingRepository
}

// NewTrackRatingService creates a new track rating service
func NewTrackRatingService(repo repository.TrackRatingRepository) TrackRatingService {
	return &TrackRatingServiceImpl{
		repo: repo,
	}
}

// RateTrack rates or updates a track rating
func (s *TrackRatingServiceImpl) RateTrack(ctx context.Context, userID, trackSpotifyID string, rating int) (*entity.TrackRatingDTO, error) {
	// Validate rating
	if rating < 0 || rating > 5 {
		return nil, domain.ErrInvalidInput
	}

	tr := entity.NewTrackRating(uuid.New().String(), userID, trackSpotifyID, rating)
	err := s.repo.Save(ctx, tr)
	if err != nil {
		return nil, err
	}

	return tr.ToDTO(), nil
}

// GetRating retrieves a track rating
func (s *TrackRatingServiceImpl) GetRating(ctx context.Context, userID, trackSpotifyID string) (*entity.TrackRatingDTO, error) {
	tr, err := s.repo.GetByTrackID(ctx, userID, trackSpotifyID)
	if err != nil {
		return nil, err
	}
	return tr.ToDTO(), nil
}

// DeleteRating removes a track rating
func (s *TrackRatingServiceImpl) DeleteRating(ctx context.Context, userID, trackSpotifyID string) error {
	return s.repo.Delete(ctx, userID, trackSpotifyID)
}
