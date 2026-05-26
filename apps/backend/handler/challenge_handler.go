package handler

import (
	"net/http"
	"strconv"

	"github.com/chs98412/prototype/backend/domain"
	"github.com/chs98412/prototype/backend/service"
	"github.com/gin-gonic/gin"
)

// ChallengeHandler handles challenge HTTP requests
type ChallengeHandler struct {
	svc service.ChallengeService
}

// NewChallengeHandler creates a new challenge handler
func NewChallengeHandler(svc service.ChallengeService) *ChallengeHandler {
	return &ChallengeHandler{
		svc: svc,
	}
}

// GetChallenges retrieves challenge catalog
func (h *ChallengeHandler) GetChallenges(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	challenges, err := h.svc.GetChallenges(c.Request.Context(), limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  challenges,
		"count": len(challenges),
	})
}

// GetUserChallenges retrieves current user's challenge progress
func (h *ChallengeHandler) GetUserChallenges(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	status := c.DefaultQuery("status", "")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	progresses, err := h.svc.GetUserChallenges(c.Request.Context(), userID, status, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  progresses,
		"count": len(progresses),
	})
}

// StartChallenge starts a new challenge for current user
func (h *ChallengeHandler) StartChallenge(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	challengeID := c.Param("challengeId")
	if challengeID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "challenge_id is required"})
		return
	}

	progress, err := h.svc.StartChallenge(c.Request.Context(), userID, challengeID)
	if err == domain.ErrNotFound {
		c.JSON(http.StatusNotFound, gin.H{"error": "challenge not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, progress)
}

// AbandonChallenge abandons a challenge progress
func (h *ChallengeHandler) AbandonChallenge(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	progressID := c.Param("progressId")
	if progressID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "progress_id is required"})
		return
	}

	err := h.svc.AbandonChallenge(c.Request.Context(), userID, progressID)
	if err == domain.ErrNotFound {
		c.JSON(http.StatusNotFound, gin.H{"error": "progress not found"})
		return
	}
	if err == domain.ErrUnauthorized {
		c.JSON(http.StatusForbidden, gin.H{"error": "forbidden"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// UpdateChallengeProgress updates challenge progress by delta
func (h *ChallengeHandler) UpdateChallengeProgress(c *gin.Context) {
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

	challengeID, ok := req["challenge_id"].(string)
	if !ok || challengeID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "challenge_id is required"})
		return
	}

	delta, ok := req["delta"].(float64)
	if !ok || delta <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "delta must be a positive number"})
		return
	}

	err := h.svc.UpdateChallengeProgress(c.Request.Context(), userID, challengeID, int(delta))
	if err == domain.ErrInvalidInput {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid delta"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}
