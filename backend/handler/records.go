package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/chs98412/prototype/backend/pkg/supabase"
	"github.com/gin-gonic/gin"
)

type RecordResponse struct {
	ID           string `json:"id"`
	UserID       string `json:"user_id"`
	TMDBID       int    `json:"tmdb_id"`
	RecordType   string `json:"record_type"`
	Rating       int    `json:"rating"`
	WatchedAt    string `json:"watched_at"`
	CreatedAt    string `json:"created_at"`
	UpdatedAt    string `json:"updated_at"`
}

type CreateRecordRequest struct {
	TMDBID     int    `json:"tmdb_id"`
	RecordType string `json:"record_type"` // "movie" or "tv"
	Rating     int    `json:"rating"`      // 0-10
}

// GetRecords retrieves user's watch history
func GetRecords(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	// Query parameters
	limit := c.DefaultQuery("limit", "20")
	offset := c.DefaultQuery("offset", "0")
	query := "user_id=eq." + userID + "&order=watched_at.desc&limit=" + limit + "&offset=" + offset

	db := supabase.NewClient()
	result, err := db.Select("user_records", query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var records []RecordResponse
	if err := json.Unmarshal(result, &records); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to parse response"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  records,
		"count": len(records),
	})
}

// CreateRecord creates a new watch record (upsert)
func CreateRecord(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req CreateRecordRequest
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	// Validate
	if req.TMDBID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "tmdb_id is required"})
		return
	}
	if req.RecordType != "movie" && req.RecordType != "tv" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "record_type must be 'movie' or 'tv'"})
		return
	}
	if req.Rating < 0 || req.Rating > 10 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "rating must be between 0 and 10"})
		return
	}

	// Upsert record
	data := map[string]interface{}{
		"user_id":     userID,
		"tmdb_id":     req.TMDBID,
		"record_type": req.RecordType,
		"rating":      req.Rating,
	}

	db := supabase.NewClient()
	result, err := db.Upsert("user_records", data)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var records []RecordResponse
	if err := json.Unmarshal(result, &records); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to parse response"})
		return
	}

	if len(records) == 0 {
		c.JSON(http.StatusCreated, gin.H{"success": true})
		return
	}

	c.JSON(http.StatusCreated, records[0])
}

// DeleteRecord deletes a watch record
func DeleteRecord(c *gin.Context) {
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

	// Verify ownership
	db := supabase.NewClient()
	result, err := db.Select("user_records", "id=eq."+recordID+"&user_id=eq."+userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var records []RecordResponse
	json.Unmarshal(result, &records)
	if len(records) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "record not found or not owned by user"})
		return
	}

	// Delete
	_, err = db.Delete("user_records", "id=eq."+recordID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// GetRecordStats retrieves user's watch statistics
func GetRecordStats(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	db := supabase.NewClient()
	result, err := db.RPC("get_record_stats", map[string]interface{}{
		"p_user_id": userID,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var stats map[string]interface{}
	if err := json.Unmarshal(result, &stats); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to parse response"})
		return
	}

	c.JSON(http.StatusOK, stats)
}

// DeleteRecordByTMDB deletes a record by TMDB ID (helper for upsert pattern)
func DeleteRecordByTMDB(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	tmdbIDStr := c.Param("tmdbId")
	if tmdbIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "tmdb_id is required"})
		return
	}

	_, err := strconv.Atoi(tmdbIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid tmdb_id"})
		return
	}

	db := supabase.NewClient()
	_, err = db.Delete("user_records", "user_id=eq."+userID+"&tmdb_id=eq."+tmdbIDStr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}
