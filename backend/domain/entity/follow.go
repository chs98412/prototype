package entity

import "time"

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
func (f *Follow) ToDTO() *FollowDTO {
	return &FollowDTO{
		ID:          f.ID,
		FollowerID:  f.FollowerID,
		FollowingID: f.FollowingID,
		CreatedAt:   f.CreatedAt.Format(time.RFC3339),
	}
}

// FollowDTO is the data transfer object for responses
type FollowDTO struct {
	ID          string `json:"id"`
	FollowerID  string `json:"follower_id"`
	FollowingID string `json:"following_id"`
	CreatedAt   string `json:"created_at"`
}

// FollowResponse for follow/unfollow actions
type FollowResponse struct {
	Success   bool `json:"success"`
	Following bool `json:"following"`
}
