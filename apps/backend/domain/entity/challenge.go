package entity

import (
	"time"

	dto "github.com/chs98412/prototype/backend/domain/dto"
)

// ChallengeStatus represents the status of a challenge
type ChallengeStatus string

const (
	ChallengeActive    ChallengeStatus = "active"
	ChallengeAbandoned ChallengeStatus = "abandoned"
	ChallengeCompleted ChallengeStatus = "completed"
)

// Challenge is the domain entity for challenge definitions
type Challenge struct {
	ID          string    `gorm:"primaryKey;column:id"`
	Title       string    `gorm:"column:title"`
	Description string    `gorm:"column:description"`
	Target      int       `gorm:"column:target"`
	CreatedAt   time.Time `gorm:"autoCreateTime;column:created_at"`
}

// TableName specifies the table name for GORM
func (c *Challenge) TableName() string {
	return "challenges"
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
func (c *Challenge) ToDTO() *dto.ChallengeDTO {
	return &dto.ChallengeDTO{
		ID:          c.ID,
		Title:       c.Title,
		Description: c.Description,
		Target:      c.Target,
		CreatedAt:   c.CreatedAt.Format(time.RFC3339),
	}
}

// ChallengeProgress is the domain entity for user's challenge progress
type ChallengeProgress struct {
	ID          string          `gorm:"primaryKey;column:id"`
	UserID      string          `gorm:"index;column:user_id"`
	ChallengeID string          `gorm:"index;column:challenge_id"`
	Progress    int             `gorm:"column:progress"`
	Status      ChallengeStatus `gorm:"column:status"`
	StartedAt   time.Time       `gorm:"index;column:started_at"`
	UpdatedAt   time.Time       `gorm:"autoUpdateTime;column:updated_at"`
}

// TableName specifies the table name for GORM
func (cp *ChallengeProgress) TableName() string {
	return "challenge_progress"
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
func (cp *ChallengeProgress) ToDTO() *dto.ChallengeProgressDTO {
	return &dto.ChallengeProgressDTO{
		ID:          cp.ID,
		UserID:      cp.UserID,
		ChallengeID: cp.ChallengeID,
		Progress:    cp.Progress,
		Status:      string(cp.Status),
		StartedAt:   cp.StartedAt.Format(time.RFC3339),
		UpdatedAt:   cp.UpdatedAt.Format(time.RFC3339),
	}
}
