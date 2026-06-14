package handler

import (
	"fmt"
	"net/http"
	"net/url"
	"os"

	"github.com/chs98412/prototype/backend/domain/entity"
	"github.com/chs98412/prototype/backend/service"
	"github.com/gin-gonic/gin"
)

// AuthHandler handles auth HTTP requests
type AuthHandler struct {
	authSvc    service.AuthService
	profileSvc service.ProfileService
}

// NewAuthHandler creates a new auth handler
func NewAuthHandler(authSvc service.AuthService, profileSvc service.ProfileService) *AuthHandler {
	return &AuthHandler{
		authSvc:    authSvc,
		profileSvc: profileSvc,
	}
}

// HandleOAuthCallback handles OAuth callback from Supabase
func (h *AuthHandler) HandleOAuthCallback(c *gin.Context) {
	code := c.Query("code")
	if code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "code is required"})
		return
	}

	authResp, err := h.authSvc.HandleOAuthCallback(c.Request.Context(), code)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "failed to authenticate"})
		return
	}

	// Set token in HttpOnly cookie
	c.SetCookie("auth_token", authResp.AccessToken, 3600*24*30, "/", "", false, true)

	c.JSON(http.StatusOK, authResp)
}

// GetMe returns current user info from profile
func (h *AuthHandler) GetMe(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	profile, err := h.profileSvc.GetProfile(c.Request.Context(), userID)
	if err != nil {
		// If no profile exists, return just user ID
		c.JSON(http.StatusOK, gin.H{"user_id": userID})
		return
	}

	c.JSON(http.StatusOK, profile)
}

// InitiateGoogleOAuth returns Google OAuth URL
func (h *AuthHandler) InitiateGoogleOAuth(c *gin.Context) {
	var req struct {
		RedirectUri string `json:"redirect_uri"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "redirect_uri is required"})
		return
	}

	supabaseURL := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_ANON_KEY")

	if supabaseURL == "" || supabaseKey == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "missing supabase config"})
		return
	}

	authURL := fmt.Sprintf(
		"%s/auth/v1/authorize?provider=google&redirect_to=%s",
		supabaseURL,
		url.QueryEscape(req.RedirectUri),
	)

	c.JSON(http.StatusOK, gin.H{"auth_url": authURL})
}

// Refresh issues a new JWT token
func (h *AuthHandler) Refresh(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "authorization header required"})
		return
	}

	// Extract token from "Bearer <token>"
	var token string
	if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
		token = authHeader[7:]
	} else {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid authorization header"})
		return
	}

	newToken, err := h.authSvc.RefreshToken(c.Request.Context(), token)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "failed to refresh token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"access_token": newToken})
}

// Logout clears auth token
func (h *AuthHandler) Logout(c *gin.Context) {
	c.SetCookie("auth_token", "", -1, "/", "", false, true)
	c.JSON(http.StatusOK, &entity.LogoutResponse{Success: true})
}

// Health returns health status
func (h *AuthHandler) Health(c *gin.Context) {
	c.JSON(http.StatusOK, &entity.HealthResponse{Status: "ok"})
}
