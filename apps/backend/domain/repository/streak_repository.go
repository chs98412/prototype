package repository

import (
	"context"
	"github.com/chs98412/prototype/backend/domain/entity"
)

// StreakRepository defines repository interface for streak operations
type StreakRepository interface {
	GetStreak(ctx context.Context, userID string) (*entity.Streak, error)
}
