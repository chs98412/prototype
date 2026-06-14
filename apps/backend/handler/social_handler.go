package handler

import (
	"net/http"
	"strconv"

	"github.com/chs98412/prototype/backend/service"
	"github.com/gin-gonic/gin"
)

// SocialHandler handles social-related HTTP requests (feed, notifications)
type SocialHandler struct {
	feedSvc  service.FeedService
	notifSvc service.NotificationService
}

// NewSocialHandler creates a new social handler
func NewSocialHandler(feedSvc service.FeedService, notifSvc service.NotificationService) *SocialHandler {
	return &SocialHandler{
		feedSvc:  feedSvc,
		notifSvc: notifSvc,
	}
}

// GetFeed retrieves friend's activity feed (legacy)
func (h *SocialHandler) GetFeed(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	items, err := h.feedSvc.GetFeed(c.Request.Context(), userID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  items,
		"count": len(items),
	})
}

// GetSocialFeed retrieves a mixed social feed (reviews + records from followed users)
func (h *SocialHandler) GetSocialFeed(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	items, err := h.feedSvc.GetSocialFeed(c.Request.Context(), userID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  items,
		"count": len(items),
	})
}

// GetNotifications retrieves user's notifications
func (h *SocialHandler) GetNotifications(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	notifications, err := h.notifSvc.GetNotifications(c.Request.Context(), userID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  notifications,
		"count": len(notifications),
	})
}
