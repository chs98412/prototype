package repository

import (
	"context"
	"github.com/chs98412/prototype/backend/domain/entity"
)

// GoalRepository defines repository interface for goal operations
type GoalRepository interface {
	GetByUserIDAndYear(ctx context.Context, userID string, year int) (*entity.Goal, error)
	Save(ctx context.Context, goal *entity.Goal) error
	Update(ctx context.Context, goal *entity.Goal) error
}
