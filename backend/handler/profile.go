package handler

import (
	"encoding/json"
	"net/http"

	"github.com/chs98412/prototype/backend/pkg/supabase"
	"github.com/gin-gonic/gin"
)

type ProfileResponse struct {
	UserID      string `json:"user_id"`
	DisplayName string `json:"display_name"`
	Bio         string `json:"bio"`
	AvatarURL   string `json:"avatar_url"`
}

// GetProfile retrieves current user's profile
func GetProfile(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	db := supabase.NewClient()
	result, err := db.Select("user_profiles", "user_id=eq."+userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var profiles []ProfileResponse
	if err := json.Unmarshal(result, &profiles); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to parse response"})
		return
	}

	if len(profiles) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "profile not found"})
		return
	}

	c.JSON(http.StatusOK, profiles[0])
}

// GetUserProfile retrieves another user's profile
func GetUserProfile(c *gin.Context) {
	userID := c.Param("userId")

	db := supabase.NewClient()
	result, err := db.Select("user_profiles", "user_id=eq."+userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var profiles []ProfileResponse
	if err := json.Unmarshal(result, &profiles); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to parse response"})
		return
	}

	if len(profiles) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "profile not found"})
		return
	}

	c.JSON(http.StatusOK, profiles[0])
}

// UpdateProfile updates current user's profile
func UpdateProfile(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req UpdateProfileRequest
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	// Prepare update data
	updateData := map[string]interface{}{}
	if req.DisplayName != "" {
		updateData["display_name"] = req.DisplayName
	}
	if req.Bio != "" {
		updateData["bio"] = req.Bio
	}
	if req.AvatarURL != "" {
		updateData["avatar_url"] = req.AvatarURL
	}

	if len(updateData) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "no fields to update"})
		return
	}

	db := supabase.NewClient()
	result, err := db.Update("user_profiles", updateData, "user_id=eq."+userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var profiles []ProfileResponse
	if err := json.Unmarshal(result, &profiles); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to parse response"})
		return
	}

	if len(profiles) == 0 {
		c.JSON(http.StatusOK, gin.H{"success": true})
		return
	}

	c.JSON(http.StatusOK, profiles[0])
}
