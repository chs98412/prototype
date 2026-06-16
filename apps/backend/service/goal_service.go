package service

import (
	"context"
	"time"
	"github.com/chs98412/prototype/backend/domain"
	"github.com/chs98412/prototype/backend/domain/entity"
	dto "github.com/chs98412/prototype/backend/domain/dto"
	"github.com/chs98412/prototype/backend/domain/repository"
	"github.com/google/uuid"
)

// GoalService interface
type GoalService interface {
	GetGoal(ctx context.Context, userID string, year int) (*dto.GoalDTO, error)
	UpdateGoal(ctx context.Context, userID string, year, movieGoal, dramaGoal int) (*dto.GoalDTO, error)
}

// GoalServiceImpl implements GoalService
type GoalServiceImpl struct {
	repo repository.GoalRepository
}

// NewGoalService creates a new goal service
func NewGoalService(repo repository.GoalRepository) GoalService {
	return &GoalServiceImpl{
		repo: repo,
	}
}

// GetGoal retrieves user's goal for a year
func (s *GoalServiceImpl) GetGoal(ctx context.Context, userID string, year int) (*dto.GoalDTO, error) {
	goal, err := s.repo.GetByUserIDAndYear(ctx, userID, year)
	if err != nil {
		return nil, err
	}
	return goal.ToDTO(), nil
}

// UpdateGoal updates or creates user's goal
func (s *GoalServiceImpl) UpdateGoal(ctx context.Context, userID string, year, movieGoal, dramaGoal int) (*dto.GoalDTO, error) {
	// Validate input
	err := entity.NewGoal(uuid.New().String(), userID, year, movieGoal, dramaGoal).Update(movieGoal, dramaGoal)
	if err != nil {
		return nil, domain.ErrInvalidInput
	}

	// Try to get existing goal
	existing, _ := s.repo.GetByUserIDAndYear(ctx, userID, year)
	if existing != nil {
		// Update existing
		existing.Update(movieGoal, dramaGoal)
		err := s.repo.Update(ctx, existing)
		if err != nil {
			return nil, err
		}
		return existing.ToDTO(), nil
	}

	// Create new goal
	goal := &entity.Goal{
		ID:        uuid.New().String(),
		UserID:    userID,
		Year:      year,
		MovieGoal: movieGoal,
		DramaGoal: dramaGoal,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	err = s.repo.Save(ctx, goal)
	if err != nil {
		return nil, err
	}

	return goal.ToDTO(), nil
}
