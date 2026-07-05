package entity

import (
	"time"

	dto "github.com/chs98412/prototype/backend/domain/dto"
)

// Profile is the domain entity for user profiles
// Not exported outside domain layer
type Profile struct {
	UserID      string    `gorm:"primaryKey;column:user_id"`
	DisplayName string    `gorm:"column:display_name"`
	Bio         string    `gorm:"column:bio"`
	AvatarURL   string    `gorm:"column:avatar_url"`
	CreatedAt   time.Time `gorm:"autoCreateTime;column:created_at"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime;column:updated_at"`
}

// TableName specifies the table name for GORM
func (p *Profile) TableName() string {
	return "user_profiles"
}

// NewProfile creates a new profile entity
func NewProfile(userID, displayName string) *Profile {
	return &Profile{
		UserID:      userID,
		DisplayName: displayName,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
}

// UpdateInfo updates profile information (business logic)
func (p *Profile) UpdateInfo(displayName, bio, avatarURL string) {
	if displayName != "" {
		p.DisplayName = displayName
	}
	if bio != "" {
		p.Bio = bio
	}
	if avatarURL != "" {
		p.AvatarURL = avatarURL
	}
	p.UpdatedAt = time.Now()
}

// ToDTO converts entity to response DTO
func (p *Profile) ToDTO() *dto.ProfileDTO {
	return &dto.ProfileDTO{
		UserID:      p.UserID,
		DisplayName: p.DisplayName,
		Bio:         p.Bio,
		AvatarURL:   p.AvatarURL,
	}
}
