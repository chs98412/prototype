package entity

import (
	"time"

	dto "github.com/chs98412/prototype/backend/domain/dto"
)

// Notification represents a user notification
type Notification struct {
	ID          string    `gorm:"primaryKey;column:id"`
	RecipientID string    `gorm:"index;column:recipient_id"`
	SenderID    string    `gorm:"index;column:sender_id"`
	Type        string    `gorm:"column:type"`
	Content     string    `gorm:"column:content"`
	CreatedAt   time.Time `gorm:"autoCreateTime;column:created_at"`
}

// TableName specifies the table name for GORM
func (n *Notification) TableName() string {
	return "notifications"
}

// ToDTO converts entity to DTO
func (n *Notification) ToDTO() *dto.NotificationDTO {
	return &dto.NotificationDTO{
		ID:          n.ID,
		RecipientID: n.RecipientID,
		SenderID:    n.SenderID,
		Type:        n.Type,
		Content:     n.Content,
		CreatedAt:   n.CreatedAt.Format(time.RFC3339),
	}
}
