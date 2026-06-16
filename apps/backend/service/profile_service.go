package service

import (
	"context"

	dto "github.com/chs98412/prototype/backend/domain/dto"
	"github.com/chs98412/prototype/backend/domain/repository"
)

// ProfileService interface
type ProfileService interface {
	GetProfile(ctx context.Context, userID string) (*dto.ProfileDTO, error)
	GetUserProfile(ctx context.Context, userID string) (*dto.ProfileDTO, error)
	UpdateProfile(ctx context.Context, userID string, displayName, bio, avatarURL string) (*dto.ProfileDTO, error)
}

// ProfileServiceImpl implements ProfileService
type ProfileServiceImpl struct {
	repo repository.ProfileRepository
}

// NewProfileService creates a new profile service
func NewProfileService(repo repository.ProfileRepository) ProfileService {
	return &ProfileServiceImpl{
		repo: repo,
	}
}

// GetProfile retrieves current user's profile
func (s *ProfileServiceImpl) GetProfile(ctx context.Context, userID string) (*dto.ProfileDTO, error) {
	profile, err := s.repo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}
	return profile.ToDTO(), nil
}

// GetUserProfile retrieves another user's profile
func (s *ProfileServiceImpl) GetUserProfile(ctx context.Context, userID string) (*dto.ProfileDTO, error) {
	profile, err := s.repo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}
	return profile.ToDTO(), nil
}

// UpdateProfile updates current user's profile
func (s *ProfileServiceImpl) UpdateProfile(
	ctx context.Context,
	userID string,
	displayName, bio, avatarURL string,
) (*dto.ProfileDTO, error) {
	// Load existing profile
	profile, err := s.repo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	// Apply business logic
	profile.UpdateInfo(displayName, bio, avatarURL)

	// Persist changes
	if err := s.repo.Update(ctx, profile); err != nil {
		return nil, err
	}

	return profile.ToDTO(), nil
}
