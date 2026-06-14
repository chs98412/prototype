package service

import (
	"context"
	"github.com/chs98412/prototype/backend/domain"
	"github.com/chs98412/prototype/backend/domain/entity"
	"github.com/chs98412/prototype/backend/domain/repository"
	"github.com/google/uuid"
)

// ReviewService interface
type ReviewService interface {
	GetReview(ctx context.Context, reviewID string) (*entity.ReviewDTO, error)
	ListReviews(ctx context.Context, limit, offset int) ([]entity.ReviewDTO, error)
	GetReviewsByTMDB(ctx context.Context, tmdbID int, limit, offset int) ([]entity.ReviewDTO, error)
	GetUserReviews(ctx context.Context, userID string, limit, offset int) ([]entity.ReviewDTO, error)
	CreateReview(ctx context.Context, userID string, tmdbID int, mediaType, title, content string, spoiler bool) (*entity.ReviewDTO, error)
	UpdateReview(ctx context.Context, userID, reviewID string, content string, spoiler bool) (*entity.ReviewDTO, error)
	DeleteReview(ctx context.Context, userID, reviewID string) error
	GetLikeCount(ctx context.Context, reviewID string) (int, error)
}

// ReviewServiceImpl implements ReviewService
type ReviewServiceImpl struct {
	repo           repository.ReviewRepository
	movieSvc       MovieService
	movieRepo      repository.MovieRepository
}

// NewReviewService creates a new review service
func NewReviewService(repo repository.ReviewRepository, movieSvc MovieService, movieRepo repository.MovieRepository) ReviewService {
	return &ReviewServiceImpl{
		repo:      repo,
		movieSvc:  movieSvc,
		movieRepo: movieRepo,
	}
}

// enrichReviewDTO populates title and poster_path from movies table
func (s *ReviewServiceImpl) enrichReviewDTO(ctx context.Context, dto *entity.ReviewDTO) {
	movie, err := s.movieRepo.GetByID(ctx, dto.TMDBID)
	if err == nil && movie != nil {
		dto.Title = movie.Title
		dto.PosterPath = movie.PosterPath
	}
}

// GetReview retrieves a single review
func (s *ReviewServiceImpl) GetReview(ctx context.Context, reviewID string) (*entity.ReviewDTO, error) {
	review, err := s.repo.GetByID(ctx, reviewID)
	if err != nil {
		return nil, err
	}
	dto := review.ToDTO()
	s.enrichReviewDTO(ctx, dto)
	return dto, nil
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
		dto := r.ToDTO()
		s.enrichReviewDTO(ctx, dto)
		dtos = append(dtos, *dto)
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
		dto := r.ToDTO()
		s.enrichReviewDTO(ctx, dto)
		dtos = append(dtos, *dto)
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
		dto := r.ToDTO()
		s.enrichReviewDTO(ctx, dto)
		dtos = append(dtos, *dto)
	}
	return dtos, nil
}

// CreateReview creates a new review (or updates existing)
func (s *ReviewServiceImpl) CreateReview(ctx context.Context, userID string, tmdbID int, mediaType, title, content string, spoiler bool) (*entity.ReviewDTO, error) {
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
		dto := existingReview.ToDTO()
		s.enrichReviewDTO(ctx, dto)
		return dto, nil
	}

	// Create new review
	review := entity.NewReview(uuid.New().String(), userID, tmdbID, mediaType, title, content, spoiler)

	if err := s.repo.Save(ctx, review); err != nil {
		return nil, err
	}

	// Best-effort: cache movie metadata from TMDB
	go s.movieSvc.UpsertFromTMDB(context.Background(), tmdbID)

	dto := review.ToDTO()
	s.enrichReviewDTO(ctx, dto)
	return dto, nil
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

	dto := review.ToDTO()
	s.enrichReviewDTO(ctx, dto)
	return dto, nil
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
