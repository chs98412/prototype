package entity

// AuthResponse is the response after successful authentication
type AuthResponse struct {
	AccessToken string                 `json:"access_token"`
	User        map[string]interface{} `json:"user"`
}

// LogoutResponse is the response after logout
type LogoutResponse struct {
	Success bool `json:"success"`
}

// HealthResponse is the response for health check
type HealthResponse struct {
	Status string `json:"status"`
}
