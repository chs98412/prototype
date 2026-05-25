package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/chs98412/prototype/backend/domain/entity"
	domainrepo "github.com/chs98412/prototype/backend/domain/repository"
	"github.com/chs98412/prototype/backend/pkg/supabase"
)

// NotificationRepositoryImpl implements NotificationRepository interface
type NotificationRepositoryImpl struct {
	db *supabase.Client
}

// NewNotificationRepository creates a new notification repository
func NewNotificationRepository(db *supabase.Client) domainrepo.NotificationRepository {
	return &NotificationRepositoryImpl{db: db}
}

// GetNotifications retrieves user's notifications
func (r *NotificationRepositoryImpl) GetNotifications(ctx context.Context, userID string, limit, offset int) ([]entity.Notification, error) {
	result, err := r.db.Query(
		`SELECT id, recipient_id, sender_id, type, content, created_at
		 FROM notifications
		 WHERE recipient_id = $1
		 ORDER BY created_at DESC
		 LIMIT $2 OFFSET $3`,
		userID, limit, offset,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to query notifications: %w", err)
	}

	var notifications []map[string]interface{}
	if err := json.Unmarshal(result, &notifications); err != nil {
		return nil, fmt.Errorf("failed to parse notifications: %w", err)
	}

	entities := make([]entity.Notification, 0, len(notifications))
	for _, notif := range notifications {
		entities = append(entities, *r.mapToEntity(notif))
	}

	return entities, nil
}

// Helper: map database result to entity
func (r *NotificationRepositoryImpl) mapToEntity(data map[string]interface{}) *entity.Notification {
	notif := &entity.Notification{}

	if v, ok := data["id"].(string); ok {
		notif.ID = v
	}
	if v, ok := data["recipient_id"].(string); ok {
		notif.RecipientID = v
	}
	if v, ok := data["sender_id"].(string); ok {
		notif.SenderID = v
	}
	if v, ok := data["type"].(string); ok {
		notif.Type = v
	}
	if v, ok := data["content"].(string); ok {
		notif.Content = v
	}

	return notif
}
