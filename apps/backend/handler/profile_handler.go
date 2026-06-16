package handler

import (
	"net/http"

	handlerdto "github.com/chs98412/prototype/backend/handler/dto"
	"github.com/chs98412/prototype/backend/service"
	"github.com/gin-gonic/gin"
)

// ProfileHandler handles profile HTTP requests
type ProfileHandler struct {
	svc service.ProfileService
}

// NewProfileHandler creates a new profile handler
func NewProfileHandler(svc service.ProfileService) *ProfileHandler {
	return &ProfileHandler{
		svc: svc,
	}
}

// GetProfile retrieves current user's profile
func (h *ProfileHandler) GetProfile(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	profile, err := h.svc.GetProfile(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, profile)
}

// GetUserProfile retrieves another user's profile
func (h *ProfileHandler) GetUserProfile(c *gin.Context) {
	userID := c.Param("userId")

	profile, err := h.svc.GetUserProfile(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "profile not found"})
		return
	}

	c.JSON(http.StatusOK, profile)
}

// UpdateProfile updates current user's profile
func (h *ProfileHandler) UpdateProfile(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req handlerdto.UpdateProfileRequest
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	profile, err := h.svc.UpdateProfile(c.Request.Context(), userID, req.DisplayName, req.Bio, req.AvatarURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, profile)
}
