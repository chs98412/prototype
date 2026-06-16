package handler

import (
	"net/http"
	"strconv"

	"github.com/chs98412/prototype/backend/domain"
	handlerdto "github.com/chs98412/prototype/backend/handler/dto"
	"github.com/chs98412/prototype/backend/service"
	"github.com/gin-gonic/gin"
)

// RecordHandler handles record HTTP requests
type RecordHandler struct {
	svc service.RecordService
}

// NewRecordHandler creates a new record handler
func NewRecordHandler(svc service.RecordService) *RecordHandler {
	return &RecordHandler{
		svc: svc,
	}
}

// GetRecords retrieves user's watch history
func (h *RecordHandler) GetRecords(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "100"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))
	status := c.DefaultQuery("status", "")
	mediaType := c.DefaultQuery("media_type", "")

	records, err := h.svc.ListRecords(c.Request.Context(), userID, status, mediaType, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  records,
		"count": len(records),
	})
}

// CreateRecord creates a new watch record (upsert)
func (h *RecordHandler) CreateRecord(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req handlerdto.CreateRecordRequest
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	record, err := h.svc.CreateRecord(c.Request.Context(), userID, req.TMDBID, req.MediaType, req.Rating)
	if err == domain.ErrInvalidInput {
		c.JSON(http.StatusBadRequest, gin.H{"error": "tmdb_id is required"})
		return
	}
	if err == domain.ErrInvalidMediaType {
		c.JSON(http.StatusBadRequest, gin.H{"error": "media_type must be 'movie' or 'tv'"})
		return
	}
	if err == domain.ErrInvalidRating {
		c.JSON(http.StatusBadRequest, gin.H{"error": "rating must be between 0 and 10"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, record)
}

// DeleteRecord deletes a watch record
func (h *RecordHandler) DeleteRecord(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	recordID := c.Param("recordId")
	if recordID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "record_id is required"})
		return
	}

	if err := h.svc.DeleteRecord(c.Request.Context(), userID, recordID); err != nil {
		if err == domain.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "record not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// DeleteRecordByTMDB deletes a record by TMDB ID
func (h *RecordHandler) DeleteRecordByTMDB(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	tmdbID, err := strconv.Atoi(c.Param("tmdbId"))
	if err != nil || tmdbID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid tmdb_id"})
		return
	}

	if err := h.svc.DeleteRecordByTMDB(c.Request.Context(), userID, tmdbID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// GetRecordStats retrieves user's watch statistics
func (h *RecordHandler) GetRecordStats(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	stats, err := h.svc.GetStats(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, stats)
}
