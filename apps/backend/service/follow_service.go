package service

import (
	"context"
	"github.com/chs98412/prototype/backend/domain"
	"github.com/chs98412/prototype/backend/domain/entity"
	"github.com/chs98412/prototype/backend/domain/repository"
	"github.com/google/uuid"
)

// FollowService interface
type FollowService interface {
	GetFollows(ctx context.Context, userID string, limit, offset int) ([]entity.FollowDTO, error)
	GetFollowers(ctx context.Context, userID string, limit, offset int) ([]entity.FollowDTO, error)
	Follow(ctx context.Context, followerID, followingID string) (*entity.FollowResponse, error)
	Unfollow(ctx context.Context, followerID, followingID string) error
	IsFollowing(ctx context.Context, followerID, followingID string) (bool, error)
	GetFollowStats(ctx context.Context, userID string) (followCount, followerCount int, err error)
}

// FollowServiceImpl implements FollowService
type FollowServiceImpl struct {
	repo repository.FollowRepository
}

// NewFollowService creates a new follow service
func NewFollowService(repo repository.FollowRepository) FollowService {
	return &FollowServiceImpl{
		repo: repo,
	}
}

// GetFollows retrieves users followed by a user
func (s *FollowServiceImpl) GetFollows(ctx context.Context, userID string, limit, offset int) ([]entity.FollowDTO, error) {
	if limit == 0 || limit > 100 {
		limit = 50
	}

	follows, err := s.repo.GetFollows(ctx, userID, limit, offset)
	if err != nil {
		return nil, err
	}

	dtos := make([]entity.FollowDTO, 0, len(follows))
	for _, f := range follows {
		dtos = append(dtos, *f.ToDTO())
	}
	return dtos, nil
}

// GetFollowers retrieves followers of a user
func (s *FollowServiceImpl) GetFollowers(ctx context.Context, userID string, limit, offset int) ([]entity.FollowDTO, error) {
	if limit == 0 || limit > 100 {
		limit = 50
	}

	followers, err := s.repo.GetFollowers(ctx, userID, limit, offset)
	if err != nil {
		return nil, err
	}

	dtos := make([]entity.FollowDTO, 0, len(followers))
	for _, f := range followers {
		dtos = append(dtos, *f.ToDTO())
	}
	return dtos, nil
}

// Follow creates a follow relationship
func (s *FollowServiceImpl) Follow(ctx context.Context, followerID, followingID string) (*entity.FollowResponse, error) {
	// Validate
	if followerID == followingID {
		return nil, domain.ErrInvalidInput
	}

	// Create follow
	follow := entity.NewFollow(uuid.New().String(), followerID, followingID)
	_, err := s.repo.Create(ctx, follow)
	if err != nil {
		return nil, err
	}

	return &entity.FollowResponse{
		Success:   true,
		Following: true,
	}, nil
}

// Unfollow removes a follow relationship
func (s *FollowServiceImpl) Unfollow(ctx context.Context, followerID, followingID string) error {
	return s.repo.Delete(ctx, followerID, followingID)
}

// IsFollowing checks if a user follows another user
func (s *FollowServiceImpl) IsFollowing(ctx context.Context, followerID, followingID string) (bool, error) {
	return s.repo.IsFollowing(ctx, followerID, followingID)
}

// GetFollowStats retrieves follow and follower counts
func (s *FollowServiceImpl) GetFollowStats(ctx context.Context, userID string) (followCount, followerCount int, err error) {
	return s.repo.GetFollowCount(ctx, userID)
}
