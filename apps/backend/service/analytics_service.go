package service

import (
	"context"

	"github.com/chs98412/prototype/backend/domain"
	dto "github.com/chs98412/prototype/backend/domain/dto"
	"github.com/chs98412/prototype/backend/domain/repository"
)

// AnalyticsService interface
type AnalyticsService interface {
	GetHeatmap(ctx context.Context, userID string) ([]dto.HeatmapEntry, error)
	GetGenreRatings(ctx context.Context, userID string) ([]dto.GenreRating, error)
	GetTasteMatch(ctx context.Context, userID, otherUserID string) (*dto.TasteMatch, error)
	GetCommonWorks(ctx context.Context, userID, otherUserID string) ([]dto.CommonWork, error)
}

// AnalyticsServiceImpl implements AnalyticsService
type AnalyticsServiceImpl struct {
	repo repository.AnalyticsRepository
}

// NewAnalyticsService creates a new analytics service
func NewAnalyticsService(repo repository.AnalyticsRepository) AnalyticsService {
	return &AnalyticsServiceImpl{
		repo: repo,
	}
}

// GetHeatmap retrieves user's activity heatmap
func (s *AnalyticsServiceImpl) GetHeatmap(ctx context.Context, userID string) ([]dto.HeatmapEntry, error) {
	return s.repo.GetHeatmap(ctx, userID)
}

// GetGenreRatings retrieves user's genre preferences
func (s *AnalyticsServiceImpl) GetGenreRatings(ctx context.Context, userID string) ([]dto.GenreRating, error) {
	return s.repo.GetGenreRatings(ctx, userID)
}

// GetTasteMatch retrieves taste compatibility between two users
func (s *AnalyticsServiceImpl) GetTasteMatch(ctx context.Context, userID, otherUserID string) (*dto.TasteMatch, error) {
	// Validate
	if userID == otherUserID {
		return nil, domain.ErrInvalidInput
	}

	return s.repo.GetTasteMatch(ctx, userID, otherUserID)
}

// GetCommonWorks retrieves common works watched by both users
func (s *AnalyticsServiceImpl) GetCommonWorks(ctx context.Context, userID, otherUserID string) ([]dto.CommonWork, error) {
	// Validate
	if userID == otherUserID {
		return nil, domain.ErrInvalidInput
	}

	return s.repo.GetCommonWorks(ctx, userID, otherUserID)
}
