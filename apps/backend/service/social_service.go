package service

import (
	"context"
	"github.com/chs98412/prototype/backend/domain/entity"
	"github.com/chs98412/prototype/backend/domain/repository"
)

// FeedService interface
type FeedService interface {
	GetFeed(ctx context.Context, userID string, limit, offset int) ([]entity.FeedItemDTO, error)
}

// NotificationService interface
type NotificationService interface {
	GetNotifications(ctx context.Context, userID string, limit, offset int) ([]entity.NotificationDTO, error)
}

// FeedServiceImpl implements FeedService
type FeedServiceImpl struct {
	repo repository.FeedRepository
}

// NewFeedService creates a new feed service
func NewFeedService(repo repository.FeedRepository) FeedService {
	return &FeedServiceImpl{
		repo: repo,
	}
}

// GetFeed retrieves friend's activity feed
func (s *FeedServiceImpl) GetFeed(ctx context.Context, userID string, limit, offset int) ([]entity.FeedItemDTO, error) {
	if limit == 0 || limit > 100 {
		limit = 20
	}

	items, err := s.repo.GetFeed(ctx, userID, limit, offset)
	if err != nil {
		return nil, err
	}

	dtos := make([]entity.FeedItemDTO, 0, len(items))
	for _, item := range items {
		dtos = append(dtos, *item.ToDTO())
	}
	return dtos, nil
}

// NotificationServiceImpl implements NotificationService
type NotificationServiceImpl struct {
	repo repository.NotificationRepository
}

// NewNotificationService creates a new notification service
func NewNotificationService(repo repository.NotificationRepository) NotificationService {
	return &NotificationServiceImpl{
		repo: repo,
	}
}

// GetNotifications retrieves user's notifications
func (s *NotificationServiceImpl) GetNotifications(ctx context.Context, userID string, limit, offset int) ([]entity.NotificationDTO, error) {
	if limit == 0 || limit > 100 {
		limit = 20
	}

	notifications, err := s.repo.GetNotifications(ctx, userID, limit, offset)
	if err != nil {
		return nil, err
	}

	dtos := make([]entity.NotificationDTO, 0, len(notifications))
	for _, notif := range notifications {
		dtos = append(dtos, *notif.ToDTO())
	}
	return dtos, nil
}
