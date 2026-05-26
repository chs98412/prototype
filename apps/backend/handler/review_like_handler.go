package handler

import (
	"net/http"
	"strconv"

	"github.com/chs98412/prototype/backend/domain"
	"github.com/chs98412/prototype/backend/service"
	"github.com/gin-gonic/gin"
)

// ReviewLikeHandler handles review like HTTP requests
type ReviewLikeHandler struct {
	svc service.ReviewLikeService
}

// NewReviewLikeHandler creates a new review like handler
func NewReviewLikeHandler(svc service.ReviewLikeService) *ReviewLikeHandler {
	return &ReviewLikeHandler{
		svc: svc,
	}
}

// GetLikes retrieves likes for a review
func (h *ReviewLikeHandler) GetLikes(c *gin.Context) {
	reviewID := c.Param("reviewId")
	if reviewID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "review_id is required"})
		return
	}

	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	likes, err := h.svc.GetLikes(c.Request.Context(), reviewID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  likes,
		"count": len(likes),
	})
}

// CheckLike checks if current user liked a review
func (h *ReviewLikeHandler) CheckLike(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	reviewID := c.Param("reviewId")
	if reviewID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "review_id is required"})
		return
	}

	liked, err := h.svc.IsLiked(c.Request.Context(), reviewID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"liked": liked,
	})
}

// Like creates a like for current user
func (h *ReviewLikeHandler) Like(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	reviewID := c.Param("reviewId")
	if reviewID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "review_id is required"})
		return
	}

	like, err := h.svc.Like(c.Request.Context(), reviewID, userID)
	if err == domain.ErrInvalidInput {
		c.JSON(http.StatusConflict, gin.H{"error": "already liked"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, like)
}

// Unlike removes a like from a review
func (h *ReviewLikeHandler) Unlike(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	reviewID := c.Param("reviewId")
	if reviewID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "review_id is required"})
		return
	}

	err := h.svc.Unlike(c.Request.Context(), reviewID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}
