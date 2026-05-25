package service

import (
	"context"
	"github.com/chs98412/prototype/backend/domain"
	"github.com/chs98412/prototype/backend/domain/entity"
	"github.com/chs98412/prototype/backend/domain/repository"
	"github.com/google/uuid"
)

// ReviewLikeService interface
type ReviewLikeService interface {
	GetLikes(ctx context.Context, reviewID string, limit, offset int) ([]entity.ReviewLikeDTO, error)
	IsLiked(ctx context.Context, reviewID, userID string) (bool, error)
	Like(ctx context.Context, reviewID, userID string) (*entity.ReviewLikeDTO, error)
	Unlike(ctx context.Context, reviewID, userID string) error
}

// ReviewLikeServiceImpl implements ReviewLikeService
type ReviewLikeServiceImpl struct {
	repo repository.ReviewLikeRepository
}

// NewReviewLikeService creates a new review like service
func NewReviewLikeService(repo repository.ReviewLikeRepository) ReviewLikeService {
	return &ReviewLikeServiceImpl{
		repo: repo,
	}
}

// GetLikes retrieves likes for a review
func (s *ReviewLikeServiceImpl) GetLikes(ctx context.Context, reviewID string, limit, offset int) ([]entity.ReviewLikeDTO, error) {
	if limit == 0 || limit > 100 {
		limit = 50
	}

	likes, err := s.repo.GetLikes(ctx, reviewID, limit, offset)
	if err != nil {
		return nil, err
	}

	dtos := make([]entity.ReviewLikeDTO, 0, len(likes))
	for _, like := range likes {
		dtos = append(dtos, *like.ToDTO())
	}
	return dtos, nil
}

// IsLiked checks if a user liked a review
func (s *ReviewLikeServiceImpl) IsLiked(ctx context.Context, reviewID, userID string) (bool, error) {
	return s.repo.IsLiked(ctx, reviewID, userID)
}

// Like creates a like for a review
func (s *ReviewLikeServiceImpl) Like(ctx context.Context, reviewID, userID string) (*entity.ReviewLikeDTO, error) {
	// Check if already liked
	liked, err := s.repo.IsLiked(ctx, reviewID, userID)
	if err != nil {
		return nil, err
	}

	if liked {
		return nil, domain.ErrInvalidInput
	}

	// Create like
	like := entity.NewReviewLike(uuid.New().String(), reviewID, userID)
	err = s.repo.Create(ctx, like)
	if err != nil {
		return nil, err
	}

	return like.ToDTO(), nil
}

// Unlike removes a like from a review
func (s *ReviewLikeServiceImpl) Unlike(ctx context.Context, reviewID, userID string) error {
	return s.repo.Delete(ctx, reviewID, userID)
}
