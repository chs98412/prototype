package repository

import (
	"context"
	dto "github.com/chs98412/prototype/backend/domain/dto"
)

// AnalyticsRepository defines repository interface for analytics operations
type AnalyticsRepository interface {
	GetHeatmap(ctx context.Context, userID string) ([]dto.HeatmapEntry, error)
	GetGenreRatings(ctx context.Context, userID string) ([]dto.GenreRating, error)
	GetTasteMatch(ctx context.Context, userID, otherUserID string) (*dto.TasteMatch, error)
	GetCommonWorks(ctx context.Context, userID, otherUserID string) ([]dto.CommonWork, error)
}
