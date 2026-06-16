package dto

// ReviewLikeDTO is the data transfer object for review like responses
type ReviewLikeDTO struct {
	ID        string `json:"id"`
	ReviewID  string `json:"review_id"`
	UserID    string `json:"user_id"`
	CreatedAt string `json:"created_at"`
}
