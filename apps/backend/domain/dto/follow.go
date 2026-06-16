package dto

// FollowDTO is the data transfer object for follow responses
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
