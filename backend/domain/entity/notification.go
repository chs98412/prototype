package entity

import "time"

// Notification represents a user notification
type Notification struct {
	ID          string
	RecipientID string
	SenderID    string
	Type        string // "follow", "like", "comment", etc.
	Content     string
	CreatedAt   time.Time
}

// NotificationDTO is the data transfer object for notifications
type NotificationDTO struct {
	ID          string `json:"id"`
	RecipientID string `json:"recipient_id"`
	SenderID    string `json:"sender_id"`
	Type        string `json:"type"`
	Content     string `json:"content"`
	CreatedAt   string `json:"created_at"`
}

// ToDTO converts entity to DTO
func (n *Notification) ToDTO() *NotificationDTO {
	return &NotificationDTO{
		ID:          n.ID,
		RecipientID: n.RecipientID,
		SenderID:    n.SenderID,
		Type:        n.Type,
		Content:     n.Content,
		CreatedAt:   n.CreatedAt.Format(time.RFC3339),
	}
}
