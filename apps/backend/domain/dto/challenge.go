package dto

// ChallengeDTO is the data transfer object for challenge responses
type ChallengeDTO struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Target      int    `json:"target"`
	CreatedAt   string `json:"created_at"`
}

// ChallengeProgressDTO is the data transfer object for challenge progress responses
type ChallengeProgressDTO struct {
	ID          string `json:"id"`
	UserID      string `json:"user_id"`
	ChallengeID string `json:"challenge_id"`
	Progress    int    `json:"progress"`
	Status      string `json:"status"`
	StartedAt   string `json:"started_at"`
	UpdatedAt   string `json:"updated_at"`
}
