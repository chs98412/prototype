package repository

import (
	"context"
	"errors"
	"fmt"
	"github.com/chs98412/prototype/backend/domain/entity"
	domainrepo "github.com/chs98412/prototype/backend/domain/repository"
	"gorm.io/gorm"
)

// ChallengeRepositoryImpl implements ChallengeRepository interface
type ChallengeRepositoryImpl struct {
	db *gorm.DB
}

// NewChallengeRepository creates a new challenge repository
func NewChallengeRepository(db *gorm.DB) domainrepo.ChallengeRepository {
	return &ChallengeRepositoryImpl{db: db}
}

// GetChallenges retrieves all challenges
func (r *ChallengeRepositoryImpl) GetChallenges(ctx context.Context, limit, offset int) ([]entity.Challenge, error) {
	var challenges []entity.Challenge
	if err := r.db.WithContext(ctx).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&challenges).Error; err != nil {
		return nil, fmt.Errorf("failed to query challenges: %w", err)
	}
	return challenges, nil
}

// GetChallengeByID retrieves a challenge by ID
func (r *ChallengeRepositoryImpl) GetChallengeByID(ctx context.Context, challengeID string) (*entity.Challenge, error) {
	challenge := &entity.Challenge{}
	if err := r.db.WithContext(ctx).Where("id = ?", challengeID).First(challenge).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("challenge not found")
		}
		return nil, fmt.Errorf("failed to query challenge: %w", err)
	}
	return challenge, nil
}

// GetUserChallenges retrieves user's challenge progress
func (r *ChallengeRepositoryImpl) GetUserChallenges(ctx context.Context, userID string, status string, limit, offset int) ([]entity.ChallengeProgress, error) {
	var progresses []entity.ChallengeProgress
	query := r.db.WithContext(ctx).Where("user_id = ?", userID)

	if status != "" {
		query = query.Where("status = ?", status)
	}

	if err := query.
		Order("started_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&progresses).Error; err != nil {
		return nil, fmt.Errorf("failed to query user challenges: %w", err)
	}

	return progresses, nil
}

// GetProgress retrieves a user's progress for a specific challenge
func (r *ChallengeRepositoryImpl) GetProgress(ctx context.Context, userID, challengeID string) (*entity.ChallengeProgress, error) {
	progress := &entity.ChallengeProgress{}
	if err := r.db.WithContext(ctx).
		Where("user_id = ? AND challenge_id = ?", userID, challengeID).
		First(progress).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("progress not found")
		}
		return nil, fmt.Errorf("failed to query progress: %w", err)
	}
	return progress, nil
}

// CreateProgress creates a new challenge progress
func (r *ChallengeRepositoryImpl) CreateProgress(ctx context.Context, progress *entity.ChallengeProgress) error {
	if err := r.db.WithContext(ctx).Create(progress).Error; err != nil {
		return fmt.Errorf("failed to create progress: %w", err)
	}
	return nil
}

// UpdateProgress updates challenge progress
func (r *ChallengeRepositoryImpl) UpdateProgress(ctx context.Context, progress *entity.ChallengeProgress) error {
	result := r.db.WithContext(ctx).
		Where("id = ? AND user_id = ?", progress.ID, progress.UserID).
		Updates(progress)
	if result.Error != nil {
		return fmt.Errorf("failed to update progress: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("progress not found")
	}
	return nil
}

// DeleteProgress removes challenge progress
func (r *ChallengeRepositoryImpl) DeleteProgress(ctx context.Context, userID, progressID string) error {
	if err := r.db.WithContext(ctx).
		Where("id = ? AND user_id = ?", progressID, userID).
		Delete(&entity.ChallengeProgress{}).Error; err != nil {
		return fmt.Errorf("failed to delete progress: %w", err)
	}
	return nil
}

// UpdateProgressByDelta increments progress by delta
func (r *ChallengeRepositoryImpl) UpdateProgressByDelta(ctx context.Context, userID string, challengeID string, delta int) error {
	if err := r.db.WithContext(ctx).
		Model(&entity.ChallengeProgress{}).
		Where("user_id = ? AND challenge_id = ?", userID, challengeID).
		Update("progress", gorm.Expr("progress + ?", delta)).
		Update("updated_at", gorm.Expr("NOW()")).Error; err != nil {
		return fmt.Errorf("failed to update progress: %w", err)
	}
	return nil
}
