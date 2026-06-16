package repository

import (
	"context"

	"github.com/chs98412/prototype/backend/domain/entity"
)

// NotificationRepository defines repository interface for notification operations
type NotificationRepository interface {
	GetNotifications(ctx context.Context, userID string, limit, offset int) ([]entity.Notification, error)
}
