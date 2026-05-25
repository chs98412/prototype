package repository

import (
	"context"
	"github.com/chs98412/prototype/backend/domain/entity"
)

// ReviewRepository defines repository interface for review operations
type ReviewRepository interface {
	GetByID(ctx context.Context, reviewID string) (*entity.Review, error)
	GetByTMDBID(ctx context.Context, tmdbID int, limit, offset int) ([]entity.Review, error)
	GetByUserID(ctx context.Context, userID string, limit, offset int) ([]entity.Review, error)
	List(ctx context.Context, limit, offset int) ([]entity.Review, error)
	GetUserReviewByTMDB(ctx context.Context, userID string, tmdbID int) (*entity.Review, error)
	Save(ctx context.Context, review *entity.Review) error
	Update(ctx context.Context, review *entity.Review) error
	Delete(ctx context.Context, reviewID, userID string) error
	GetLikeCount(ctx context.Context, reviewID string) (int, error)
}
