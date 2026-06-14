package repository

import (
	"context"
	"errors"
	"fmt"
	"github.com/chs98412/prototype/backend/domain"
	"github.com/chs98412/prototype/backend/domain/entity"
	domainrepo "github.com/chs98412/prototype/backend/domain/repository"
	"gorm.io/gorm"
)

// ReviewRepositoryImpl implements ReviewRepository interface
type ReviewRepositoryImpl struct {
	db *gorm.DB
}

// NewReviewRepository creates a new review repository
func NewReviewRepository(db *gorm.DB) domainrepo.ReviewRepository {
	return &ReviewRepositoryImpl{db: db}
}

// GetByID retrieves a review by ID
func (r *ReviewRepositoryImpl) GetByID(ctx context.Context, reviewID string) (*entity.Review, error) {
	review := &entity.Review{}
	sql := `
		SELECT
			rev.id, rev.user_id, rev.tmdb_id, rev.media_type, rev.content,
			rev.is_spoiler as spoiler, rev.like_count,
			COALESCE(m.title, '') as title,
			COALESCE(m.poster_path, '') as poster_path,
			rev.created_at, rev.updated_at
		FROM reviews rev
		LEFT JOIN movies m ON m.id = rev.tmdb_id
		WHERE rev.id = ?
	`
	if err := r.db.WithContext(ctx).Raw(sql, reviewID).Scan(review).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, domain.ErrNotFound
		}
		return nil, fmt.Errorf("failed to query review: %w", err)
	}
	return review, nil
}

// GetByTMDBID retrieves reviews by TMDB ID
func (r *ReviewRepositoryImpl) GetByTMDBID(ctx context.Context, tmdbID int, limit, offset int) ([]entity.Review, error) {
	var reviews []entity.Review
	sql := fmt.Sprintf(`
		SELECT
			rev.id, rev.user_id, rev.tmdb_id, rev.media_type, rev.content,
			rev.is_spoiler as spoiler, rev.like_count,
			COALESCE(m.title, '') as title,
			COALESCE(m.poster_path, '') as poster_path,
			rev.created_at, rev.updated_at
		FROM reviews rev
		LEFT JOIN movies m ON m.id = rev.tmdb_id
		WHERE rev.tmdb_id = ?
		ORDER BY rev.created_at DESC
		LIMIT %d OFFSET %d
	`, limit, offset)
	if err := r.db.WithContext(ctx).Raw(sql, tmdbID).Scan(&reviews).Error; err != nil {
		return nil, fmt.Errorf("failed to query reviews: %w", err)
	}
	return reviews, nil
}

// GetByUserID retrieves reviews by user ID
func (r *ReviewRepositoryImpl) GetByUserID(ctx context.Context, userID string, limit, offset int) ([]entity.Review, error) {
	var reviews []entity.Review
	sql := fmt.Sprintf(`
		SELECT
			rev.id, rev.user_id, rev.tmdb_id, rev.media_type, rev.content,
			rev.is_spoiler as spoiler, rev.like_count,
			COALESCE(m.title, '') as title,
			COALESCE(m.poster_path, '') as poster_path,
			rev.created_at, rev.updated_at
		FROM reviews rev
		LEFT JOIN movies m ON m.id = rev.tmdb_id
		WHERE rev.user_id = ?
		ORDER BY rev.created_at DESC
		LIMIT %d OFFSET %d
	`, limit, offset)
	if err := r.db.WithContext(ctx).Raw(sql, userID).Scan(&reviews).Error; err != nil {
		return nil, fmt.Errorf("failed to query reviews: %w", err)
	}
	return reviews, nil
}

// List retrieves all reviews
func (r *ReviewRepositoryImpl) List(ctx context.Context, limit, offset int) ([]entity.Review, error) {
	var reviews []entity.Review
	sql := fmt.Sprintf(`
		SELECT
			rev.id, rev.user_id, rev.tmdb_id, rev.media_type, rev.content,
			rev.is_spoiler as spoiler, rev.like_count,
			COALESCE(m.title, '') as title,
			COALESCE(m.poster_path, '') as poster_path,
			rev.created_at, rev.updated_at
		FROM reviews rev
		LEFT JOIN movies m ON m.id = rev.tmdb_id
		ORDER BY rev.created_at DESC
		LIMIT %d OFFSET %d
	`, limit, offset)
	if err := r.db.WithContext(ctx).Raw(sql).Scan(&reviews).Error; err != nil {
		return nil, fmt.Errorf("failed to query reviews: %w", err)
	}
	return reviews, nil
}

// GetUserReviewByTMDB retrieves a user's review for a specific TMDB ID
func (r *ReviewRepositoryImpl) GetUserReviewByTMDB(ctx context.Context, userID string, tmdbID int) (*entity.Review, error) {
	review := &entity.Review{}
	sql := `
		SELECT
			rev.id, rev.user_id, rev.tmdb_id, rev.media_type, rev.content,
			rev.is_spoiler as spoiler, rev.like_count,
			COALESCE(m.title, '') as title,
			COALESCE(m.poster_path, '') as poster_path,
			rev.created_at, rev.updated_at
		FROM reviews rev
		LEFT JOIN movies m ON m.id = rev.tmdb_id
		WHERE rev.user_id = ? AND rev.tmdb_id = ?
	`
	if err := r.db.WithContext(ctx).Raw(sql, userID, tmdbID).Scan(review).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, domain.ErrNotFound
		}
		return nil, fmt.Errorf("failed to query review: %w", err)
	}
	return review, nil
}

// Save creates a new review (upsert)
func (r *ReviewRepositoryImpl) Save(ctx context.Context, review *entity.Review) error {
	if err := r.db.WithContext(ctx).Save(review).Error; err != nil {
		return fmt.Errorf("failed to save review: %w", err)
	}
	return nil
}

// Update updates an existing review
func (r *ReviewRepositoryImpl) Update(ctx context.Context, review *entity.Review) error {
	result := r.db.WithContext(ctx).
		Where("id = ? AND user_id = ?", review.ID, review.UserID).
		Updates(review)
	if result.Error != nil {
		return fmt.Errorf("failed to update review: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("review not found")
	}
	return nil
}

// Delete removes a review
func (r *ReviewRepositoryImpl) Delete(ctx context.Context, reviewID, userID string) error {
	if err := r.db.WithContext(ctx).
		Where("id = ? AND user_id = ?", reviewID, userID).
		Delete(&entity.Review{}).Error; err != nil {
		return fmt.Errorf("failed to delete review: %w", err)
	}
	return nil
}

// GetLikeCount retrieves the like count for a review
func (r *ReviewRepositoryImpl) GetLikeCount(ctx context.Context, reviewID string) (int, error) {
	var likeCount int
	if err := r.db.WithContext(ctx).
		Model(&entity.Review{}).
		Where("id = ?", reviewID).
		Select("like_count").
		Scan(&likeCount).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return 0, domain.ErrNotFound
		}
		return 0, fmt.Errorf("failed to query like count: %w", err)
	}
	return likeCount, nil
}
