package entity

import (
	"time"

	dto "github.com/chs98412/prototype/backend/domain/dto"
)

// Follow is the domain entity for follow relationships
type Follow struct {
	ID          string    `gorm:"primaryKey;column:id"`
	FollowerID  string    `gorm:"index;column:follower_id"`
	FollowingID string    `gorm:"index;column:following_id"`
	CreatedAt   time.Time `gorm:"autoCreateTime;column:created_at"`
}

// TableName specifies the table name for GORM
func (f *Follow) TableName() string {
	return "user_follows"
}

// NewFollow creates a new follow relationship
func NewFollow(id, followerID, followingID string) *Follow {
	return &Follow{
		ID:          id,
		FollowerID:  followerID,
		FollowingID: followingID,
		CreatedAt:   time.Now(),
	}
}

// ToDTO converts entity to response DTO
func (f *Follow) ToDTO() *dto.FollowDTO {
	return &dto.FollowDTO{
		ID:          f.ID,
		FollowerID:  f.FollowerID,
		FollowingID: f.FollowingID,
		CreatedAt:   f.CreatedAt.Format(time.RFC3339),
	}
}
