package repository

import (
	"context"
	"github.com/chs98412/prototype/backend/domain/entity"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type MovieRepositoryImpl struct {
	db *gorm.DB
}

func NewMovieRepository(db *gorm.DB) *MovieRepositoryImpl {
	return &MovieRepositoryImpl{db: db}
}

func (r *MovieRepositoryImpl) Upsert(ctx context.Context, movie *entity.Movie) error {
	return r.db.WithContext(ctx).
		Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "id"}},
			DoUpdates: clause.AssignmentColumns([]string{"title", "original_title", "poster_path", "backdrop_path", "release_year", "overview", "runtime", "updated_at"}),
		}).
		Create(movie).Error
}

func (r *MovieRepositoryImpl) GetByID(ctx context.Context, tmdbID int) (*entity.Movie, error) {
	var movie entity.Movie
	if err := r.db.WithContext(ctx).First(&movie, tmdbID).Error; err != nil {
		return nil, err
	}
	return &movie, nil
}

func (r *MovieRepositoryImpl) GetByIDs(ctx context.Context, tmdbIDs []int) ([]entity.Movie, error) {
	var movies []entity.Movie
	if len(tmdbIDs) == 0 {
		return movies, nil
	}
	if err := r.db.WithContext(ctx).Where("id IN ?", tmdbIDs).Find(&movies).Error; err != nil {
		return nil, err
	}
	return movies, nil
}
