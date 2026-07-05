package repository

import (
	"context"
	"github.com/chs98412/prototype/backend/domain/entity"
)

type MovieRepository interface {
	Upsert(ctx context.Context, movie *entity.Movie) error
	GetByID(ctx context.Context, tmdbID int) (*entity.Movie, error)
	GetByIDs(ctx context.Context, tmdbIDs []int) ([]entity.Movie, error)
}
