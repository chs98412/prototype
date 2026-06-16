package service

import (
	"context"

	"github.com/chs98412/prototype/backend/domain"
	dto "github.com/chs98412/prototype/backend/domain/dto"
	"github.com/chs98412/prototype/backend/domain/entity"
	"github.com/chs98412/prototype/backend/domain/repository"
	"github.com/google/uuid"
)

// AlbumReviewService interface
type AlbumReviewService interface {
	SaveReview(ctx context.Context, userID, albumSpotifyID, content string, hasSpoiler bool) (*dto.AlbumReviewDTO, error)
	GetReview(ctx context.Context, id string) (*dto.AlbumReviewDTO, error)
	UpdateReview(ctx context.Context, userID, id, content string, hasSpoiler bool) (*dto.AlbumReviewDTO, error)
	DeleteReview(ctx context.Context, userID, id string) error
}

// AlbumReviewServiceImpl implements AlbumReviewService
type AlbumReviewServiceImpl struct {
	repo repository.AlbumReviewRepository
}

// NewAlbumReviewService creates a new album review service
func NewAlbumReviewService(repo repository.AlbumReviewRepository) AlbumReviewService {
	return &AlbumReviewServiceImpl{
		repo: repo,
	}
}

// SaveReview creates a new album review
func (s *AlbumReviewServiceImpl) SaveReview(ctx context.Context, userID, albumSpotifyID, content string, hasSpoiler bool) (*dto.AlbumReviewDTO, error) {
	if content == "" {
		return nil, domain.ErrInvalidInput
	}

	review := entity.NewAlbumReview(uuid.New().String(), userID, albumSpotifyID, content, hasSpoiler)
	err := s.repo.Save(ctx, review)
	if err != nil {
		return nil, err
	}

	return review.ToDTO(), nil
}

// GetReview retrieves an album review by ID
func (s *AlbumReviewServiceImpl) GetReview(ctx context.Context, id string) (*dto.AlbumReviewDTO, error) {
	review, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return review.ToDTO(), nil
}

// UpdateReview updates an existing album review
func (s *AlbumReviewServiceImpl) UpdateReview(ctx context.Context, userID, id, content string, hasSpoiler bool) (*dto.AlbumReviewDTO, error) {
	// Get existing review to verify ownership
	review, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, domain.ErrNotFound
	}

	if review.UserID != userID {
		return nil, domain.ErrUnauthorized
	}

	// Update
	err = review.Update(content, hasSpoiler)
	if err != nil {
		return nil, err
	}

	err = s.repo.Update(ctx, review)
	if err != nil {
		return nil, err
	}

	return review.ToDTO(), nil
}

// DeleteReview removes an album review
func (s *AlbumReviewServiceImpl) DeleteReview(ctx context.Context, userID, id string) error {
	review, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return domain.ErrNotFound
	}

	if review.UserID != userID {
		return domain.ErrUnauthorized
	}

	return s.repo.Delete(ctx, id)
}
