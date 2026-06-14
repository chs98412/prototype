package service

import (
	"context"
	"github.com/chs98412/prototype/backend/domain"
	"github.com/chs98412/prototype/backend/domain/entity"
	"github.com/chs98412/prototype/backend/domain/repository"
)

// ReviewService interface
type ReviewService interface {
	GetReview(ctx context.Context, reviewID string) (*entity.ReviewDTO, error)
	ListReviews(ctx context.Context, limit, offset int) ([]entity.ReviewDTO, error)
	GetReviewsByTMDB(ctx context.Context, tmdbID int, limit, offset int) ([]entity.ReviewDTO, error)
	GetUserReviews(ctx context.Context, userID string, limit, offset int) ([]entity.ReviewDTO, error)
	CreateReview(ctx context.Context, userID string, tmdbID int, content string, spoiler bool) (*entity.ReviewDTO, error)
	UpdateReview(ctx context.Context, userID, reviewID string, content string, spoiler bool) (*entity.ReviewDTO, error)
	DeleteReview(ctx context.Context, userID, reviewID string) error
	GetLikeCount(ctx context.Context, reviewID string) (int, error)
}

// ReviewServiceImpl implements ReviewService
type ReviewServiceImpl struct {
	repo     repository.ReviewRepository
	movieSvc MovieService
}

// NewReviewService creates a new review service
func NewReviewService(repo repository.ReviewRepository, movieSvc MovieService) ReviewService {
	return &ReviewServiceImpl{
		repo:     repo,
		movieSvc: movieSvc,
	}
}

// GetReview retrieves a single review
func (s *ReviewServiceImpl) GetReview(ctx context.Context, reviewID string) (*entity.ReviewDTO, error) {
	review, err := s.repo.GetByID(ctx, reviewID)
	if err != nil {
		return nil, err
	}
	return review.ToDTO(), nil
}

// ListReviews retrieves all reviews
func (s *ReviewServiceImpl) ListReviews(ctx context.Context, limit, offset int) ([]entity.ReviewDTO, error) {
	if limit == 0 || limit > 100 {
		limit = 20
	}

	reviews, err := s.repo.List(ctx, limit, offset)
	if err != nil {
		return nil, err
	}

	dtos := make([]entity.ReviewDTO, 0, len(reviews))
	for _, r := range reviews {
		dtos = append(dtos, *r.ToDTO())
	}
	return dtos, nil
}

// GetReviewsByTMDB retrieves reviews for a specific TMDB ID
func (s *ReviewServiceImpl) GetReviewsByTMDB(ctx context.Context, tmdbID int, limit, offset int) ([]entity.ReviewDTO, error) {
	if limit == 0 || limit > 100 {
		limit = 20
	}

	reviews, err := s.repo.GetByTMDBID(ctx, tmdbID, limit, offset)
	if err != nil {
		return nil, err
	}

	dtos := make([]entity.ReviewDTO, 0, len(reviews))
	for _, r := range reviews {
		dtos = append(dtos, *r.ToDTO())
	}
	return dtos, nil
}

// GetUserReviews retrieves reviews by a user
func (s *ReviewServiceImpl) GetUserReviews(ctx context.Context, userID string, limit, offset int) ([]entity.ReviewDTO, error) {
	if limit == 0 || limit > 100 {
		limit = 20
	}

	reviews, err := s.repo.GetByUserID(ctx, userID, limit, offset)
	if err != nil {
		return nil, err
	}

	dtos := make([]entity.ReviewDTO, 0, len(reviews))
	for _, r := range reviews {
		dtos = append(dtos, *r.ToDTO())
	}
	return dtos, nil
}

// CreateReview creates a new review (or updates existing)
func (s *ReviewServiceImpl) CreateReview(ctx context.Context, userID string, tmdbID int, content string, spoiler bool) (*entity.ReviewDTO, error) {
	// Validate input
	if content == "" {
		return nil, domain.ErrInvalidInput
	}
	if len(content) > 500 {
		return nil, domain.ErrInvalidInput
	}

	// Check if review exists
	existingReview, _ := s.repo.GetUserReviewByTMDB(ctx, userID, tmdbID)
	if existingReview != nil {
		// Update existing review
		existingReview.UpdateContent(content, spoiler)
		if err := s.repo.Update(ctx, existingReview); err != nil {
			return nil, err
		}
		return existingReview.ToDTO(), nil
	}

	// Create new review
	review := entity.NewReview("", userID, tmdbID, content, spoiler)

	if err := s.repo.Save(ctx, review); err != nil {
		return nil, err
	}

	// Best-effort: cache movie metadata from TMDB
	go s.movieSvc.UpsertFromTMDB(context.Background(), tmdbID)

	return review.ToDTO(), nil
}

// UpdateReview updates an existing review
func (s *ReviewServiceImpl) UpdateReview(ctx context.Context, userID, reviewID string, content string, spoiler bool) (*entity.ReviewDTO, error) {
	// Verify ownership
	review, err := s.repo.GetByID(ctx, reviewID)
	if err != nil {
		return nil, err
	}

	if review.UserID != userID {
		return nil, domain.ErrUnauthorized
	}

	// Update content
	if err := review.UpdateContent(content, spoiler); err != nil {
		return nil, err
	}

	if err := s.repo.Update(ctx, review); err != nil {
		return nil, err
	}

	return review.ToDTO(), nil
}

// DeleteReview deletes a review
func (s *ReviewServiceImpl) DeleteReview(ctx context.Context, userID, reviewID string) error {
	// Verify ownership
	review, err := s.repo.GetByID(ctx, reviewID)
	if err != nil {
		return err
	}

	if review.UserID != userID {
		return domain.ErrUnauthorized
	}

	return s.repo.Delete(ctx, reviewID, userID)
}

// GetLikeCount retrieves the like count for a review
func (s *ReviewServiceImpl) GetLikeCount(ctx context.Context, reviewID string) (int, error) {
	return s.repo.GetLikeCount(ctx, reviewID)
}
