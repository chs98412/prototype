package entity

import "time"

// ChallengeStatus represents the status of a challenge
type ChallengeStatus string

const (
	ChallengeActive    ChallengeStatus = "active"
	ChallengeAbandoned ChallengeStatus = "abandoned"
	ChallengeCompleted ChallengeStatus = "completed"
)

// Challenge is the domain entity for challenge definitions
type Challenge struct {
	ID          string
	Title       string
	Description string
	Target      int // target count to complete
	CreatedAt   time.Time
}

// NewChallenge creates a new challenge entity
func NewChallenge(id, title, description string, target int) *Challenge {
	return &Challenge{
		ID:          id,
		Title:       title,
		Description: description,
		Target:      target,
		CreatedAt:   time.Now(),
	}
}

// ToDTO converts entity to response DTO
func (c *Challenge) ToDTO() *ChallengeDTO {
	return &ChallengeDTO{
		ID:          c.ID,
		Title:       c.Title,
		Description: c.Description,
		Target:      c.Target,
		CreatedAt:   c.CreatedAt.Format(time.RFC3339),
	}
}

// ChallengeDTO is the data transfer object for challenge responses
type ChallengeDTO struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Target      int    `json:"target"`
	CreatedAt   string `json:"created_at"`
}

// ChallengeProgress is the domain entity for user's challenge progress
type ChallengeProgress struct {
	ID          string
	UserID      string
	ChallengeID string
	Progress    int
	Status      ChallengeStatus
	StartedAt   time.Time
	UpdatedAt   time.Time
}

// NewChallengeProgress creates a new challenge progress entity
func NewChallengeProgress(id, userID, challengeID string) *ChallengeProgress {
	return &ChallengeProgress{
		ID:          id,
		UserID:      userID,
		ChallengeID: challengeID,
		Progress:    0,
		Status:      ChallengeActive,
		StartedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
}

// IncrementProgress increments the progress
func (cp *ChallengeProgress) IncrementProgress(delta int) {
	cp.Progress += delta
	cp.UpdatedAt = time.Now()
}

// Complete marks the challenge as completed
func (cp *ChallengeProgress) Complete() {
	cp.Status = ChallengeCompleted
	cp.UpdatedAt = time.Now()
}

// Abandon marks the challenge as abandoned
func (cp *ChallengeProgress) Abandon() {
	cp.Status = ChallengeAbandoned
	cp.UpdatedAt = time.Now()
}

// ToDTO converts entity to response DTO
func (cp *ChallengeProgress) ToDTO() *ChallengeProgressDTO {
	return &ChallengeProgressDTO{
		ID:          cp.ID,
		UserID:      cp.UserID,
		ChallengeID: cp.ChallengeID,
		Progress:    cp.Progress,
		Status:      string(cp.Status),
		StartedAt:   cp.StartedAt.Format(time.RFC3339),
		UpdatedAt:   cp.UpdatedAt.Format(time.RFC3339),
	}
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
