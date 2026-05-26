package handler

import (
	"net/http"

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

// Logout clears auth token
func (h *AuthHandler) Logout(c *gin.Context) {
	c.SetCookie("auth_token", "", -1, "/", "", false, true)
	c.JSON(http.StatusOK, &entity.LogoutResponse{Success: true})
}

// Health returns health status
func (h *AuthHandler) Health(c *gin.Context) {
	c.JSON(http.StatusOK, &entity.HealthResponse{Status: "ok"})
}
