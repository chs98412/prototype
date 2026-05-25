package repository

import (
	"context"
	"fmt"
	"github.com/chs98412/prototype/backend/domain/entity"
	domainrepo "github.com/chs98412/prototype/backend/domain/repository"
	"gorm.io/gorm"
)

// NotificationRepositoryImpl implements NotificationRepository interface
type NotificationRepositoryImpl struct {
	db *gorm.DB
}

// NewNotificationRepository creates a new notification repository
func NewNotificationRepository(db *gorm.DB) domainrepo.NotificationRepository {
	return &NotificationRepositoryImpl{db: db}
}

// GetNotifications retrieves user's notifications
func (r *NotificationRepositoryImpl) GetNotifications(ctx context.Context, userID string, limit, offset int) ([]entity.Notification, error) {
	var notifications []entity.Notification
	if err := r.db.WithContext(ctx).
		Where("recipient_id = ?", userID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&notifications).Error; err != nil {
		return nil, fmt.Errorf("failed to query notifications: %w", err)
	}
	return notifications, nil
}
