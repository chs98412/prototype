package handler

import (
	"net/http"
	"strconv"

	"github.com/chs98412/prototype/backend/domain"
	"github.com/chs98412/prototype/backend/service"
	"github.com/gin-gonic/gin"
)

// FollowHandler handles follow HTTP requests
type FollowHandler struct {
	svc service.FollowService
}

// NewFollowHandler creates a new follow handler
func NewFollowHandler(svc service.FollowService) *FollowHandler {
	return &FollowHandler{
		svc: svc,
	}
}

// GetFollows retrieves users followed by current user
func (h *FollowHandler) GetFollows(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	follows, err := h.svc.GetFollows(c.Request.Context(), userID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  follows,
		"count": len(follows),
	})
}

// GetFollowers retrieves followers of current user
func (h *FollowHandler) GetFollowers(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	followers, err := h.svc.GetFollowers(c.Request.Context(), userID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  followers,
		"count": len(followers),
	})
}

// Follow creates a follow relationship
func (h *FollowHandler) Follow(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	targetUserID := c.Param("userId")
	if targetUserID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id is required"})
		return
	}

	result, err := h.svc.Follow(c.Request.Context(), userID, targetUserID)
	if err == domain.ErrInvalidInput {
		c.JSON(http.StatusBadRequest, gin.H{"error": "cannot follow yourself"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, result)
}

// Unfollow removes a follow relationship
func (h *FollowHandler) Unfollow(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	targetUserID := c.Param("userId")
	if targetUserID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id is required"})
		return
	}

	if err := h.svc.Unfollow(c.Request.Context(), userID, targetUserID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// IsFollowing checks if current user follows another user
func (h *FollowHandler) IsFollowing(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	targetUserID := c.Param("userId")
	if targetUserID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id is required"})
		return
	}

	isFollowing, err := h.svc.IsFollowing(c.Request.Context(), userID, targetUserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"is_following": isFollowing,
	})
}
