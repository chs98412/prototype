package service

import (
	"context"

	"github.com/chs98412/prototype/backend/domain"
	dto "github.com/chs98412/prototype/backend/domain/dto"
	"github.com/chs98412/prototype/backend/domain/entity"
	"github.com/chs98412/prototype/backend/domain/repository"
	"github.com/google/uuid"
)

// ReviewService interface
type ReviewService interface {
	GetReview(ctx context.Context, reviewID string) (*dto.ReviewDTO, error)
	ListReviews(ctx context.Context, limit, offset int) ([]dto.ReviewDTO, error)
	GetReviewsByTMDB(ctx context.Context, tmdbID int, limit, offset int) ([]dto.ReviewDTO, error)
	GetUserReviews(ctx context.Context, userID string, limit, offset int) ([]dto.ReviewDTO, error)
	CreateReview(ctx context.Context, userID string, tmdbID int, mediaType, kind, title, content string, spoiler bool) (*dto.ReviewDTO, error)
	UpdateReview(ctx context.Context, userID, reviewID string, content string, spoiler bool) (*dto.ReviewDTO, error)
	DeleteReview(ctx context.Context, userID, reviewID string) error
	GetLikeCount(ctx context.Context, reviewID string) (int, error)
}

// ReviewServiceImpl implements ReviewService
type ReviewServiceImpl struct {
	repo        repository.ReviewRepository
	movieSvc    MovieService
	movieRepo   repository.MovieRepository
	profileRepo repository.ProfileRepository
}

// NewReviewService creates a new review service
func NewReviewService(repo repository.ReviewRepository, movieSvc MovieService, movieRepo repository.MovieRepository, profileRepo repository.ProfileRepository) ReviewService {
	return &ReviewServiceImpl{
		repo:        repo,
		movieSvc:    movieSvc,
		movieRepo:   movieRepo,
		profileRepo: profileRepo,
	}
}

// enrichReviewDTO populates title, poster_path, display_name, avatar_url for a single item
func (s *ReviewServiceImpl) enrichReviewDTO(ctx context.Context, d *dto.ReviewDTO) {
	movie, err := s.movieRepo.GetByID(ctx, d.TMDBID)
	if err == nil && movie != nil {
		d.Title = movie.Title
		d.PosterPath = movie.PosterPath
	}
	profile, err := s.profileRepo.GetByUserID(ctx, d.UserID)
	if err == nil && profile != nil {
		d.DisplayName = profile.DisplayName
		d.AvatarURL = profile.AvatarURL
	}
}

// enrichReviewDTOs batch-fetches movies and profiles to avoid N+1 queries
func (s *ReviewServiceImpl) enrichReviewDTOs(ctx context.Context, dtos []dto.ReviewDTO) {
	if len(dtos) == 0 {
		return
	}

	tmdbIDs := make([]int, 0, len(dtos))
	userIDs := make([]string, 0, len(dtos))
	seenTMDB := map[int]bool{}
	seenUser := map[string]bool{}
	for _, d := range dtos {
		if !seenTMDB[d.TMDBID] {
			tmdbIDs = append(tmdbIDs, d.TMDBID)
			seenTMDB[d.TMDBID] = true
		}
		if !seenUser[d.UserID] {
			userIDs = append(userIDs, d.UserID)
			seenUser[d.UserID] = true
		}
	}

	movieMap := map[int]entity.Movie{}
	if movies, err := s.movieRepo.GetByIDs(ctx, tmdbIDs); err == nil {
		for _, m := range movies {
			movieMap[m.ID] = m
		}
	}

	profileMap := map[string]entity.Profile{}
	if profiles, err := s.profileRepo.GetByUserIDs(ctx, userIDs); err == nil {
		for _, p := range profiles {
			profileMap[p.UserID] = p
		}
	}

	for i := range dtos {
		if m, ok := movieMap[dtos[i].TMDBID]; ok {
			dtos[i].Title = m.Title
			dtos[i].PosterPath = m.PosterPath
		}
		if p, ok := profileMap[dtos[i].UserID]; ok {
			dtos[i].DisplayName = p.DisplayName
			dtos[i].AvatarURL = p.AvatarURL
		}
	}
}

// GetReview retrieves a single review
func (s *ReviewServiceImpl) GetReview(ctx context.Context, reviewID string) (*dto.ReviewDTO, error) {
	review, err := s.repo.GetByID(ctx, reviewID)
	if err != nil {
		return nil, err
	}
	d := review.ToDTO()
	s.enrichReviewDTO(ctx, d)
	return d, nil
}

// ListReviews retrieves all reviews
func (s *ReviewServiceImpl) ListReviews(ctx context.Context, limit, offset int) ([]dto.ReviewDTO, error) {
	if limit == 0 || limit > 100 {
		limit = 20
	}

	reviews, err := s.repo.List(ctx, limit, offset)
	if err != nil {
		return nil, err
	}

	dtos := make([]dto.ReviewDTO, 0, len(reviews))
	for _, r := range reviews {
		dtos = append(dtos, *r.ToDTO())
	}
	s.enrichReviewDTOs(ctx, dtos)
	return dtos, nil
}

// GetReviewsByTMDB retrieves reviews for a specific TMDB ID
func (s *ReviewServiceImpl) GetReviewsByTMDB(ctx context.Context, tmdbID int, limit, offset int) ([]dto.ReviewDTO, error) {
	if limit == 0 || limit > 100 {
		limit = 20
	}

	reviews, err := s.repo.GetByTMDBID(ctx, tmdbID, limit, offset)
	if err != nil {
		return nil, err
	}

	dtos := make([]dto.ReviewDTO, 0, len(reviews))
	for _, r := range reviews {
		dtos = append(dtos, *r.ToDTO())
	}
	s.enrichReviewDTOs(ctx, dtos)
	return dtos, nil
}

// GetUserReviews retrieves reviews by a user
func (s *ReviewServiceImpl) GetUserReviews(ctx context.Context, userID string, limit, offset int) ([]dto.ReviewDTO, error) {
	if limit == 0 || limit > 100 {
		limit = 20
	}

	reviews, err := s.repo.GetByUserID(ctx, userID, limit, offset)
	if err != nil {
		return nil, err
	}

	dtos := make([]dto.ReviewDTO, 0, len(reviews))
	for _, r := range reviews {
		dtos = append(dtos, *r.ToDTO())
	}
	s.enrichReviewDTOs(ctx, dtos)
	return dtos, nil
}

// CreateReview creates a new review (or updates existing)
func (s *ReviewServiceImpl) CreateReview(ctx context.Context, userID string, tmdbID int, mediaType, kind, title, content string, spoiler bool) (*dto.ReviewDTO, error) {
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
		d := existingReview.ToDTO()
		s.enrichReviewDTO(ctx, d)
		return d, nil
	}

	// Create new review
	review := entity.NewReview(uuid.New().String(), userID, tmdbID, mediaType, kind, title, content, spoiler)

	if err := s.repo.Save(ctx, review); err != nil {
		return nil, err
	}

	// Best-effort: cache movie metadata from TMDB
	go s.movieSvc.UpsertFromTMDB(context.Background(), tmdbID)

	d := review.ToDTO()
	s.enrichReviewDTO(ctx, d)
	return d, nil
}

// UpdateReview updates an existing review
func (s *ReviewServiceImpl) UpdateReview(ctx context.Context, userID, reviewID string, content string, spoiler bool) (*dto.ReviewDTO, error) {
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

	d := review.ToDTO()
	s.enrichReviewDTO(ctx, d)
	return d, nil
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
