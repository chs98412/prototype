package repository

import (
	"context"
	"github.com/chs98412/prototype/backend/domain/entity"
)

// ReviewLikeRepository defines repository interface for review like operations
type ReviewLikeRepository interface {
	GetLikes(ctx context.Context, reviewID string, limit, offset int) ([]entity.ReviewLike, error)
	IsLiked(ctx context.Context, reviewID, userID string) (bool, error)
	Create(ctx context.Context, like *entity.ReviewLike) error
	Delete(ctx context.Context, reviewID, userID string) error
	GetLikeCount(ctx context.Context, reviewID string) (int, error)
}
