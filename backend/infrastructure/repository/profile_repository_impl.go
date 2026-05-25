package repository

import (
	"context"
	"errors"
	"fmt"
	"github.com/chs98412/prototype/backend/domain/entity"
	"github.com/chs98412/prototype/backend/domain/repository"
	"gorm.io/gorm"
)

// ProfileRepositoryImpl implements ProfileRepository interface
type ProfileRepositoryImpl struct {
	db *gorm.DB
}

// NewProfileRepository creates a new profile repository
func NewProfileRepository(db *gorm.DB) repository.ProfileRepository {
	return &ProfileRepositoryImpl{db: db}
}

// GetByUserID retrieves a profile by user ID
func (r *ProfileRepositoryImpl) GetByUserID(ctx context.Context, userID string) (*entity.Profile, error) {
	profile := &entity.Profile{}
	if err := r.db.WithContext(ctx).Where("user_id = ?", userID).First(profile).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("profile not found")
		}
		return nil, fmt.Errorf("failed to query profile: %w", err)
	}
	return profile, nil
}

// Save creates a new profile
func (r *ProfileRepositoryImpl) Save(ctx context.Context, profile *entity.Profile) error {
	if err := r.db.WithContext(ctx).Create(profile).Error; err != nil {
		return fmt.Errorf("failed to save profile: %w", err)
	}
	return nil
}

// Update updates an existing profile
func (r *ProfileRepositoryImpl) Update(ctx context.Context, profile *entity.Profile) error {
	if err := r.db.WithContext(ctx).Save(profile).Error; err != nil {
		return fmt.Errorf("failed to update profile: %w", err)
	}
	return nil
}

// Delete removes a profile
func (r *ProfileRepositoryImpl) Delete(ctx context.Context, userID string) error {
	if err := r.db.WithContext(ctx).Where("user_id = ?", userID).Delete(&entity.Profile{}).Error; err != nil {
		return fmt.Errorf("failed to delete profile: %w", err)
	}
	return nil
}
