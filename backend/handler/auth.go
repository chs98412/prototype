package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/chs98412/prototype/backend/pkg/supabase"
	"github.com/gin-gonic/gin"
)

type LoginRequest struct {
	Code string `json:"code" binding:"required"`
}

type AuthResponse struct {
	AccessToken string `json:"access_token"`
	User        map[string]interface{} `json:"user"`
}

// HandleOAuthCallback handles OAuth callback from Supabase
func HandleOAuthCallback(c *gin.Context) {
	code := c.Query("code")
	if code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "code is required"})
		return
	}

	// Exchange code for session with Supabase
	db := supabase.NewClient()

	// Supabase auth endpoint
	supabaseURL := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_ANON_KEY")

	if supabaseURL == "" || supabaseKey == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "missing supabase config"})
		return
	}

	// Exchange code for session
	exchangeURL := fmt.Sprintf("%s/auth/v1/token?grant_type=authorization_code&code=%s&client_id=%s&client_secret=%s&redirect_uri=%s",
		supabaseURL, code, supabaseKey, supabaseKey, os.Getenv("OAUTH_REDIRECT_URI"))

	resp, err := http.Post(exchangeURL, "application/json", nil)
	if err != nil || resp.StatusCode != http.StatusOK {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "failed to exchange code"})
		return
	}
	defer resp.Body.Close()

	var tokenData map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&tokenData); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to parse token"})
		return
	}

	accessToken, ok := tokenData["access_token"].(string)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token response"})
		return
	}

	// Get user info from Supabase
	userURL := fmt.Sprintf("%s/auth/v1/user", supabaseURL)
	userReq, _ := http.NewRequest("GET", userURL, nil)
	userReq.Header.Set("Authorization", fmt.Sprintf("Bearer %s", accessToken))
	userReq.Header.Set("apikey", supabaseKey)

	userResp, err := http.DefaultClient.Do(userReq)
	if err != nil || userResp.StatusCode != http.StatusOK {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "failed to get user"})
		return
	}
	defer userResp.Body.Close()

	var userData map[string]interface{}
	if err := json.NewDecoder(userResp.Body).Decode(&userData); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to parse user"})
		return
	}

	// Set token in HttpOnly cookie
	c.SetCookie("auth_token", accessToken, 3600*24*30, "/", "", false, true)

	c.JSON(http.StatusOK, gin.H{
		"access_token": accessToken,
		"user":         userData,
	})
}

// GetMe returns current user info
func GetMe(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	// Get user profile from database
	db := supabase.NewClient()
	result, err := db.Select("user_profiles", "user_id=eq."+userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var profiles []map[string]interface{}
	if err := json.Unmarshal(result, &profiles); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to parse response"})
		return
	}

	if len(profiles) == 0 {
		c.JSON(http.StatusOK, gin.H{"user_id": userID})
		return
	}

	c.JSON(http.StatusOK, profiles[0])
}

// Logout clears auth token
func Logout(c *gin.Context) {
	c.SetCookie("auth_token", "", -1, "/", "", false, true)
	c.JSON(http.StatusOK, gin.H{"success": true})
}
