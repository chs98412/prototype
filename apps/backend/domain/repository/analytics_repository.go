package repository

import (
	"context"
	"github.com/chs98412/prototype/backend/domain/entity"
)

// AnalyticsRepository defines repository interface for analytics operations
type AnalyticsRepository interface {
	GetHeatmap(ctx context.Context, userID string) ([]entity.HeatmapEntry, error)
	GetGenreRatings(ctx context.Context, userID string) ([]entity.GenreRating, error)
	GetTasteMatch(ctx context.Context, userID, otherUserID string) (*entity.TasteMatch, error)
	GetCommonWorks(ctx context.Context, userID, otherUserID string) ([]entity.CommonWork, error)
}
