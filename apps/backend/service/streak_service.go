package service

import (
	"context"

	dto "github.com/chs98412/prototype/backend/domain/dto"
	"github.com/chs98412/prototype/backend/domain/repository"
)

// StreakService interface
type StreakService interface {
	GetStreak(ctx context.Context, userID string) (*dto.StreakDTO, error)
}

// StreakServiceImpl implements StreakService
type StreakServiceImpl struct {
	repo repository.StreakRepository
}

// NewStreakService creates a new streak service
func NewStreakService(repo repository.StreakRepository) StreakService {
	return &StreakServiceImpl{
		repo: repo,
	}
}

// GetStreak retrieves user's current and longest streak
func (s *StreakServiceImpl) GetStreak(ctx context.Context, userID string) (*dto.StreakDTO, error) {
	streak, err := s.repo.GetStreak(ctx, userID)
	if err != nil {
		return nil, err
	}
	return streak.ToDTO(), nil
}
