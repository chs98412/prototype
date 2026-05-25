package handler

import (
	"net/http"

	"github.com/chs98412/prototype/backend/domain"
	"github.com/chs98412/prototype/backend/service"
	"github.com/gin-gonic/gin"
)

// AnalyticsHandler handles analytics HTTP requests
type AnalyticsHandler struct {
	svc service.AnalyticsService
}

// NewAnalyticsHandler creates a new analytics handler
func NewAnalyticsHandler(svc service.AnalyticsService) *AnalyticsHandler {
	return &AnalyticsHandler{
		svc: svc,
	}
}

// GetHeatmap retrieves user's activity heatmap
func (h *AnalyticsHandler) GetHeatmap(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	heatmap, err := h.svc.GetHeatmap(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": heatmap,
	})
}

// GetGenreRatings retrieves user's genre preferences
func (h *AnalyticsHandler) GetGenreRatings(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	ratings, err := h.svc.GetGenreRatings(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  ratings,
		"count": len(ratings),
	})
}

// GetTasteMatch retrieves taste compatibility with another user
func (h *AnalyticsHandler) GetTasteMatch(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	otherUserID := c.Param("userId")
	if otherUserID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id is required"})
		return
	}

	match, err := h.svc.GetTasteMatch(c.Request.Context(), userID, otherUserID)
	if err == domain.ErrInvalidInput {
		c.JSON(http.StatusBadRequest, gin.H{"error": "cannot compare with yourself"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, match)
}

// GetCommonWorks retrieves common works watched by both users
func (h *AnalyticsHandler) GetCommonWorks(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	otherUserID := c.Param("userId")
	if otherUserID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id is required"})
		return
	}

	works, err := h.svc.GetCommonWorks(c.Request.Context(), userID, otherUserID)
	if err == domain.ErrInvalidInput {
		c.JSON(http.StatusBadRequest, gin.H{"error": "cannot compare with yourself"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  works,
		"count": len(works),
	})
}
