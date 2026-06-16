package handlerdto

// CreateReviewRequest is the request DTO for creating a review
type CreateReviewRequest struct {
	TMDBID    int    `json:"tmdb_id" binding:"required"`
	MediaType string `json:"media_type"`
	Kind      string `json:"kind"`
	Title     string `json:"title"`
	Content   string `json:"content" binding:"required"`
	Spoiler   bool   `json:"spoiler"`
}

// UpdateReviewRequest is the request DTO for updating a review
type UpdateReviewRequest struct {
	Content string `json:"content" binding:"required"`
	Spoiler bool   `json:"spoiler"`
}

// CreateRecordRequest is the request DTO for creating a record
type CreateRecordRequest struct {
	TMDBID    int    `json:"tmdb_id" binding:"required"`
	MediaType string `json:"media_type" binding:"required"`
	Rating    int    `json:"rating" binding:"required"`
}

// UpdateRecordRatingRequest is the request DTO for updating rating
type UpdateRecordRatingRequest struct {
	Rating int `json:"rating" binding:"required"`
}

// UpdateProfileRequest is the request DTO for updating profile
type UpdateProfileRequest struct {
	DisplayName string `json:"display_name"`
	Bio         string `json:"bio"`
	AvatarURL   string `json:"avatar_url"`
}

// LoginRequest is the request DTO for login
type LoginRequest struct {
	Code string `json:"code" binding:"required"`
}
