package service

import (
	"context"

	"github.com/chs98412/prototype/backend/domain"
	dto "github.com/chs98412/prototype/backend/domain/dto"
	"github.com/chs98412/prototype/backend/domain/entity"
	"github.com/chs98412/prototype/backend/domain/repository"
	"github.com/google/uuid"
)

// ChallengeService interface
type ChallengeService interface {
	GetChallenges(ctx context.Context, limit, offset int) ([]dto.ChallengeDTO, error)
	GetUserChallenges(ctx context.Context, userID string, status string, limit, offset int) ([]dto.ChallengeProgressDTO, error)
	StartChallenge(ctx context.Context, userID, challengeID string) (*dto.ChallengeProgressDTO, error)
	AbandonChallenge(ctx context.Context, userID, progressID string) error
	UpdateChallengeProgress(ctx context.Context, userID, challengeID string, delta int) error
}

// ChallengeServiceImpl implements ChallengeService
type ChallengeServiceImpl struct {
	repo repository.ChallengeRepository
}

// NewChallengeService creates a new challenge service
func NewChallengeService(repo repository.ChallengeRepository) ChallengeService {
	return &ChallengeServiceImpl{
		repo: repo,
	}
}

// GetChallenges retrieves challenge catalog
func (s *ChallengeServiceImpl) GetChallenges(ctx context.Context, limit, offset int) ([]dto.ChallengeDTO, error) {
	if limit == 0 || limit > 100 {
		limit = 50
	}

	challenges, err := s.repo.GetChallenges(ctx, limit, offset)
	if err != nil {
		return nil, err
	}

	dtos := make([]dto.ChallengeDTO, 0, len(challenges))
	for _, c := range challenges {
		dtos = append(dtos, *c.ToDTO())
	}
	return dtos, nil
}

// GetUserChallenges retrieves user's challenge progress with optional status filter
func (s *ChallengeServiceImpl) GetUserChallenges(ctx context.Context, userID string, status string, limit, offset int) ([]dto.ChallengeProgressDTO, error) {
	if limit == 0 || limit > 100 {
		limit = 50
	}

	progresses, err := s.repo.GetUserChallenges(ctx, userID, status, limit, offset)
	if err != nil {
		return nil, err
	}

	dtos := make([]dto.ChallengeProgressDTO, 0, len(progresses))
	for _, p := range progresses {
		dtos = append(dtos, *p.ToDTO())
	}
	return dtos, nil
}

// StartChallenge creates new challenge progress for a user
func (s *ChallengeServiceImpl) StartChallenge(ctx context.Context, userID, challengeID string) (*dto.ChallengeProgressDTO, error) {
	// Verify challenge exists
	_, err := s.repo.GetChallengeByID(ctx, challengeID)
	if err != nil {
		return nil, domain.ErrNotFound
	}

	// Check if already in progress
	existing, err := s.repo.GetProgress(ctx, userID, challengeID)
	if err == nil && existing != nil {
		// Already started, return existing
		return existing.ToDTO(), nil
	}

	// Create new progress
	progress := entity.NewChallengeProgress(uuid.New().String(), userID, challengeID)
	err = s.repo.CreateProgress(ctx, progress)
	if err != nil {
		return nil, err
	}

	return progress.ToDTO(), nil
}

// AbandonChallenge marks a challenge progress as abandoned
func (s *ChallengeServiceImpl) AbandonChallenge(ctx context.Context, userID, progressID string) error {
	// Get existing progress to verify ownership
	progress, err := s.repo.GetProgress(ctx, userID, "")
	if err != nil {
		return domain.ErrNotFound
	}

	if progress.ID != progressID || progress.UserID != userID {
		return domain.ErrUnauthorized
	}

	progress.Abandon()
	return s.repo.UpdateProgress(ctx, progress)
}

// UpdateChallengeProgress increments progress by delta
func (s *ChallengeServiceImpl) UpdateChallengeProgress(ctx context.Context, userID, challengeID string, delta int) error {
	if delta <= 0 {
		return domain.ErrInvalidInput
	}

	return s.repo.UpdateProgressByDelta(ctx, userID, challengeID, delta)
}
