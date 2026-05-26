package repository

import (
	"context"
	"github.com/chs98412/prototype/backend/domain/entity"
)

// TrackRatingRepository defines repository interface for track rating operations
type TrackRatingRepository interface {
	GetByID(ctx context.Context, id string) (*entity.TrackRating, error)
	GetByTrackID(ctx context.Context, userID, trackSpotifyID string) (*entity.TrackRating, error)
	Save(ctx context.Context, rating *entity.TrackRating) error
	Delete(ctx context.Context, userID, trackSpotifyID string) error
}
