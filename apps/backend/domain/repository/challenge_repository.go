package repository

import (
	"context"
	"github.com/chs98412/prototype/backend/domain/entity"
)

// ChallengeRepository defines repository interface for challenge operations
type ChallengeRepository interface {
	// Challenges
	GetChallenges(ctx context.Context, limit, offset int) ([]entity.Challenge, error)
	GetChallengeByID(ctx context.Context, challengeID string) (*entity.Challenge, error)

	// Challenge Progress
	GetUserChallenges(ctx context.Context, userID string, status string, limit, offset int) ([]entity.ChallengeProgress, error)
	GetProgress(ctx context.Context, userID, challengeID string) (*entity.ChallengeProgress, error)
	CreateProgress(ctx context.Context, progress *entity.ChallengeProgress) error
	UpdateProgress(ctx context.Context, progress *entity.ChallengeProgress) error
	DeleteProgress(ctx context.Context, userID, progressID string) error
	UpdateProgressByDelta(ctx context.Context, userID string, challengeID string, delta int) error
}
