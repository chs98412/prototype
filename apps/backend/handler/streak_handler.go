package handler

import (
	"net/http"

	"github.com/chs98412/prototype/backend/service"
	"github.com/gin-gonic/gin"
)

// StreakHandler handles streak HTTP requests
type StreakHandler struct {
	svc service.StreakService
}

// NewStreakHandler creates a new streak handler
func NewStreakHandler(svc service.StreakService) *StreakHandler {
	return &StreakHandler{
		svc: svc,
	}
}

// LogStreak retrieves user's current and longest streak
func (h *StreakHandler) LogStreak(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	streak, err := h.svc.GetStreak(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, streak)
}
