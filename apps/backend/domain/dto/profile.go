package dto

// ProfileDTO is the data transfer object for profile responses
type ProfileDTO struct {
	UserID      string `json:"user_id"`
	DisplayName string `json:"display_name"`
	Bio         string `json:"bio"`
	AvatarURL   string `json:"avatar_url"`
}
