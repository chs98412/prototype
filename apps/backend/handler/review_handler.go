package handler

import (
	"net/http"
	"strconv"

	"github.com/chs98412/prototype/backend/domain"
	"github.com/chs98412/prototype/backend/service"
	"github.com/gin-gonic/gin"
)

// ReviewHandler handles review HTTP requests
type ReviewHandler struct {
	svc service.ReviewService
}

// NewReviewHandler creates a new review handler
func NewReviewHandler(svc service.ReviewService) *ReviewHandler {
	return &ReviewHandler{
		svc: svc,
	}
}

// CreateReviewRequest is the request DTO for creating a review
type CreateReviewRequest struct {
	TMDBID    int    `json:"tmdb_id" binding:"required"`
	MediaType string `json:"media_type"`
	Title     string `json:"title"`
	Content   string `json:"content" binding:"required"`
	Spoiler   bool   `json:"spoiler"`
}

// UpdateReviewRequest is the request DTO for updating a review
type UpdateReviewRequest struct {
	Content string `json:"content" binding:"required"`
	Spoiler bool   `json:"spoiler"`
}

// GetReviews retrieves reviews
func (h *ReviewHandler) GetReviews(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	reviews, err := h.svc.ListReviews(c.Request.Context(), limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  reviews,
		"count": len(reviews),
	})
}

// GetReviewByID retrieves a single review
func (h *ReviewHandler) GetReviewByID(c *gin.Context) {
	reviewID := c.Param("reviewId")

	review, err := h.svc.GetReview(c.Request.Context(), reviewID)
	if err == domain.ErrNotFound {
		c.JSON(http.StatusNotFound, gin.H{"error": "review not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, review)
}

// CreateReview creates a new review (upsert)
func (h *ReviewHandler) CreateReview(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req CreateReviewRequest
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	mediaType := req.MediaType
	if mediaType == "" {
		mediaType = "movie"
	}

	review, err := h.svc.CreateReview(c.Request.Context(), userID, req.TMDBID, mediaType, req.Title, req.Content, req.Spoiler)
	if err == domain.ErrInvalidInput {
		c.JSON(http.StatusBadRequest, gin.H{"error": "content must be provided and less than 500 characters"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, review)
}

// UpdateReview updates a review
func (h *ReviewHandler) UpdateReview(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	reviewID := c.Param("reviewId")

	var req UpdateReviewRequest
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	review, err := h.svc.UpdateReview(c.Request.Context(), userID, reviewID, req.Content, req.Spoiler)
	if err == domain.ErrNotFound {
		c.JSON(http.StatusNotFound, gin.H{"error": "review not found"})
		return
	}
	if err == domain.ErrUnauthorized {
		c.JSON(http.StatusForbidden, gin.H{"error": "you can only edit your own reviews"})
		return
	}
	if err == domain.ErrInvalidInput {
		c.JSON(http.StatusBadRequest, gin.H{"error": "content must be provided and less than 500 characters"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, review)
}

// DeleteReview deletes a review
func (h *ReviewHandler) DeleteReview(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	reviewID := c.Param("reviewId")

	if err := h.svc.DeleteReview(c.Request.Context(), userID, reviewID); err != nil {
		if err == domain.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "review not found"})
			return
		}
		if err == domain.ErrUnauthorized {
			c.JSON(http.StatusForbidden, gin.H{"error": "you can only delete your own reviews"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// GetReviewsByTMDB retrieves reviews for a TMDB ID
func (h *ReviewHandler) GetReviewsByTMDB(c *gin.Context) {
	tmdbID, err := strconv.Atoi(c.Param("tmdbId"))
	if err != nil || tmdbID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid tmdb_id"})
		return
	}

	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	reviews, err := h.svc.GetReviewsByTMDB(c.Request.Context(), tmdbID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  reviews,
		"count": len(reviews),
	})
}
