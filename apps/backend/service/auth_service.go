package service

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	dto "github.com/chs98412/prototype/backend/domain/dto"
	"github.com/golang-jwt/jwt/v5"
)

// AuthService interface
type AuthService interface {
	HandleOAuthCallback(ctx context.Context, code string) (*dto.AuthResponse, error)
	RefreshToken(ctx context.Context, currentToken string) (string, error)
}

// AuthServiceImpl implements AuthService
type AuthServiceImpl struct{}

// NewAuthService creates a new auth service
func NewAuthService() AuthService {
	return &AuthServiceImpl{}
}

// HandleOAuthCallback exchanges OAuth code for access token
func (s *AuthServiceImpl) HandleOAuthCallback(ctx context.Context, code string) (*dto.AuthResponse, error) {
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

	return &dto.AuthResponse{
		AccessToken: accessToken,
		User:        userData,
	}, nil
}

// RefreshToken issues a new JWT token from current valid token
func (s *AuthServiceImpl) RefreshToken(ctx context.Context, currentToken string) (string, error) {
	if currentToken == "" {
		return "", fmt.Errorf("token required")
	}

	secret := os.Getenv("SUPABASE_JWT_SECRET")
	if secret == "" {
		return "", fmt.Errorf("missing JWT secret")
	}

	// Parse and validate current token
	claims := jwt.MapClaims{}
	token, err := jwt.ParseWithClaims(currentToken, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})

	if err != nil || !token.Valid {
		return "", fmt.Errorf("invalid token")
	}

	// Extract user ID
	userID, ok := claims["sub"].(string)
	if !ok {
		return "", fmt.Errorf("invalid token claims")
	}

	// Issue new token with 7 day expiry
	newClaims := jwt.MapClaims{
		"sub": userID,
		"iat": time.Now().Unix(),
		"exp": time.Now().AddDate(0, 0, 7).Unix(),
		"aud": "authenticated",
		"role": "authenticated",
	}

	newToken := jwt.NewWithClaims(jwt.SigningMethodHS256, newClaims)
	newTokenString, err := newToken.SignedString([]byte(secret))
	if err != nil {
		return "", fmt.Errorf("failed to sign token")
	}

	return newTokenString, nil
}
