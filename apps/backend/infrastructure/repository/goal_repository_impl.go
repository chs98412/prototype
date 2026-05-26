package repository

import (
	"context"
	"errors"
	"fmt"
	"github.com/chs98412/prototype/backend/domain/entity"
	domainrepo "github.com/chs98412/prototype/backend/domain/repository"
	"gorm.io/gorm"
)

// GoalRepositoryImpl implements GoalRepository interface
type GoalRepositoryImpl struct {
	db *gorm.DB
}

// NewGoalRepository creates a new goal repository
func NewGoalRepository(db *gorm.DB) domainrepo.GoalRepository {
	return &GoalRepositoryImpl{db: db}
}

// GetByUserIDAndYear retrieves a goal by user ID and year
func (r *GoalRepositoryImpl) GetByUserIDAndYear(ctx context.Context, userID string, year int) (*entity.Goal, error) {
	goal := &entity.Goal{}
	if err := r.db.WithContext(ctx).
		Where("user_id = ? AND year = ?", userID, year).
		First(goal).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("goal not found")
		}
		return nil, fmt.Errorf("failed to query goal: %w", err)
	}
	return goal, nil
}

// Save creates or updates a goal using upsert semantics
func (r *GoalRepositoryImpl) Save(ctx context.Context, goal *entity.Goal) error {
	if err := r.db.WithContext(ctx).Save(goal).Error; err != nil {
		return fmt.Errorf("failed to save goal: %w", err)
	}
	return nil
}

// Update updates an existing goal
func (r *GoalRepositoryImpl) Update(ctx context.Context, goal *entity.Goal) error {
	result := r.db.WithContext(ctx).
		Where("id = ? AND user_id = ?", goal.ID, goal.UserID).
		Updates(goal)
	if result.Error != nil {
		return fmt.Errorf("failed to update goal: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("goal not found")
	}
	return nil
}
