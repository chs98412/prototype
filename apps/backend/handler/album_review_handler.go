package handler

import (
	"net/http"

	"github.com/chs98412/prototype/backend/domain"
	"github.com/chs98412/prototype/backend/service"
	"github.com/gin-gonic/gin"
)

// AlbumReviewHandler handles album review HTTP requests
type AlbumReviewHandler struct {
	svc service.AlbumReviewService
}

// NewAlbumReviewHandler creates a new album review handler
func NewAlbumReviewHandler(svc service.AlbumReviewService) *AlbumReviewHandler {
	return &AlbumReviewHandler{
		svc: svc,
	}
}

// SaveReview creates a new album review
func (h *AlbumReviewHandler) SaveReview(c *gin.Context) {
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

	albumSpotifyID, ok := req["album_spotify_id"].(string)
	if !ok || albumSpotifyID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "album_spotify_id is required"})
		return
	}

	content, ok := req["content"].(string)
	if !ok || content == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "content is required"})
		return
	}

	hasSpoiler := false
	if v, ok := req["has_spoiler"].(bool); ok {
		hasSpoiler = v
	}

	review, err := h.svc.SaveReview(c.Request.Context(), userID, albumSpotifyID, content, hasSpoiler)
	if err == domain.ErrInvalidInput {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid content"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, review)
}

// UpdateReview updates an existing album review
func (h *AlbumReviewHandler) UpdateReview(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	reviewID := c.Param("id")
	if reviewID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id is required"})
		return
	}

	req := map[string]interface{}{}
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	content, ok := req["content"].(string)
	if !ok || content == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "content is required"})
		return
	}

	hasSpoiler := false
	if v, ok := req["has_spoiler"].(bool); ok {
		hasSpoiler = v
	}

	review, err := h.svc.UpdateReview(c.Request.Context(), userID, reviewID, content, hasSpoiler)
	if err == domain.ErrNotFound {
		c.JSON(http.StatusNotFound, gin.H{"error": "review not found"})
		return
	}
	if err == domain.ErrUnauthorized {
		c.JSON(http.StatusForbidden, gin.H{"error": "forbidden"})
		return
	}
	if err == domain.ErrInvalidInput {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid content"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, review)
}

// DeleteReview removes an album review
func (h *AlbumReviewHandler) DeleteReview(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	reviewID := c.Param("id")
	if reviewID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id is required"})
		return
	}

	err := h.svc.DeleteReview(c.Request.Context(), userID, reviewID)
	if err == domain.ErrNotFound {
		c.JSON(http.StatusNotFound, gin.H{"error": "review not found"})
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
