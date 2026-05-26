package handler

import (
	"net/http"
	"strconv"
	"time"

	"github.com/chs98412/prototype/backend/domain"
	"github.com/chs98412/prototype/backend/service"
	"github.com/gin-gonic/gin"
)

// GoalHandler handles goal HTTP requests
type GoalHandler struct {
	svc service.GoalService
}

// NewGoalHandler creates a new goal handler
func NewGoalHandler(svc service.GoalService) *GoalHandler {
	return &GoalHandler{
		svc: svc,
	}
}

// GetGoal retrieves user's yearly goal
func (h *GoalHandler) GetGoal(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	year, _ := strconv.Atoi(c.DefaultQuery("year", strconv.Itoa(time.Now().Year())))

	goal, err := h.svc.GetGoal(c.Request.Context(), userID, year)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "goal not found"})
		return
	}

	c.JSON(http.StatusOK, goal)
}

// UpdateGoal updates or creates user's yearly goal
func (h *GoalHandler) UpdateGoal(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	req := map[string]interface{}{}
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	movieGoal, ok := req["movie_goal"].(float64)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "movie_goal is required"})
		return
	}

	dramaGoal, ok := req["drama_goal"].(float64)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "drama_goal is required"})
		return
	}

	year := time.Now().Year()
	if y, ok := req["year"].(float64); ok {
		year = int(y)
	}

	goal, err := h.svc.UpdateGoal(c.Request.Context(), userID, year, int(movieGoal), int(dramaGoal))
	if err == domain.ErrInvalidInput {
		c.JSON(http.StatusBadRequest, gin.H{"error": "goals must be non-negative"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, goal)
}
