package dto

// NotificationDTO is the data transfer object for notification responses
type NotificationDTO struct {
	ID          string `json:"id"`
	RecipientID string `json:"recipient_id"`
	SenderID    string `json:"sender_id"`
	Type        string `json:"type"`
	Content     string `json:"content"`
	CreatedAt   string `json:"created_at"`
}
