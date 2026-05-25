package handler

import (
	"net/http"

	"github.com/chs98412/prototype/backend/domain"
	"github.com/chs98412/prototype/backend/service"
	"github.com/gin-gonic/gin"
)

// TrackRatingHandler handles track rating HTTP requests
type TrackRatingHandler struct {
	svc service.TrackRatingService
}

// NewTrackRatingHandler creates a new track rating handler
func NewTrackRatingHandler(svc service.TrackRatingService) *TrackRatingHandler {
	return &TrackRatingHandler{
		svc: svc,
	}
}

// RateTrack rates a music track
func (h *TrackRatingHandler) RateTrack(c *gin.Context) {
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

	trackSpotifyID, ok := req["track_spotify_id"].(string)
	if !ok || trackSpotifyID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "track_spotify_id is required"})
		return
	}

	rating, ok := req["rating"].(float64)
	if !ok || rating < 0 || rating > 5 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "rating must be between 0 and 5"})
		return
	}

	result, err := h.svc.RateTrack(c.Request.Context(), userID, trackSpotifyID, int(rating))
	if err == domain.ErrInvalidInput {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid rating"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": result})
}
