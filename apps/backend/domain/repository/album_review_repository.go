package repository

import (
	"context"
	"github.com/chs98412/prototype/backend/domain/entity"
)

// AlbumReviewRepository defines repository interface for album review operations
type AlbumReviewRepository interface {
	GetByID(ctx context.Context, id string) (*entity.AlbumReview, error)
	GetByAlbumID(ctx context.Context, userID, albumSpotifyID string) (*entity.AlbumReview, error)
	Save(ctx context.Context, review *entity.AlbumReview) error
	Update(ctx context.Context, review *entity.AlbumReview) error
	Delete(ctx context.Context, id string) error
}
