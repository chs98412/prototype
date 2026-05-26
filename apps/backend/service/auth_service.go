package service

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/chs98412/prototype/backend/domain/entity"
)

// AuthService interface
type AuthService interface {
	HandleOAuthCallback(ctx context.Context, code string) (*entity.AuthResponse, error)
}

// AuthServiceImpl implements AuthService
type AuthServiceImpl struct{}

// NewAuthService creates a new auth service
func NewAuthService() AuthService {
	return &AuthServiceImpl{}
}

// HandleOAuthCallback exchanges OAuth code for access token
func (s *AuthServiceImpl) HandleOAuthCallback(ctx context.Context, code string) (*entity.AuthResponse, error) {
	if code == "" {
		return nil, fmt.Errorf("code is required")
	}

	supabaseURL := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_ANON_KEY")

	if supabaseURL == "" || supabaseKey == "" {
		return nil, fmt.Errorf("missing supabase config")
	}

	// Exchange code for session
	exchangeURL := fmt.Sprintf("%s/auth/v1/token?grant_type=authorization_code&code=%s&client_id=%s&client_secret=%s&redirect_uri=%s",
		supabaseURL, code, supabaseKey, supabaseKey, os.Getenv("OAUTH_REDIRECT_URI"))

	resp, err := http.Post(exchangeURL, "application/json", nil)
	if err != nil || resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to exchange code")
	}
	defer resp.Body.Close()

	var tokenData map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&tokenData); err != nil {
		return nil, fmt.Errorf("failed to parse token")
	}

	accessToken, ok := tokenData["access_token"].(string)
	if !ok {
		return nil, fmt.Errorf("invalid token response")
	}

	// Get user info from Supabase
	userURL := fmt.Sprintf("%s/auth/v1/user", supabaseURL)
	userReq, _ := http.NewRequest("GET", userURL, nil)
	userReq.Header.Set("Authorization", fmt.Sprintf("Bearer %s", accessToken))
	userReq.Header.Set("apikey", supabaseKey)

	userResp, err := http.DefaultClient.Do(userReq)
	if err != nil || userResp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to get user")
	}
	defer userResp.Body.Close()

	var userData map[string]interface{}
	if err := json.NewDecoder(userResp.Body).Decode(&userData); err != nil {
		return nil, fmt.Errorf("failed to parse user")
	}

	return &entity.AuthResponse{
		AccessToken: accessToken,
		User:        userData,
	}, nil
}
