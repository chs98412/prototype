package handler

import (
	"encoding/json"
	"fmt"
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

// GetRecords retrieves user's watch history
func GetRecords(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	// Query parameters
	limit := c.DefaultQuery("limit", "100")
	offset := c.DefaultQuery("offset", "0")
	status := c.DefaultQuery("status", "")
	tmdbID := c.DefaultQuery("tmdb_id", "")
	mediaType := c.DefaultQuery("media_type", "")

	query := "user_id=eq." + userID + "&order=updated_at.desc&limit=" + limit + "&offset=" + offset
	if status != "" {
		query += "&status=eq." + status
	}
	if tmdbID != "" {
		query += "&tmdb_id=eq." + tmdbID
	}
	if mediaType != "" {
		query += "&media_type=eq." + mediaType
	}

	db := supabase.NewClient()
	result, err := db.Select("user_records", query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var records []map[string]interface{}
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
// DEPRECATED: Use RecordHandler.CreateRecord instead
func CreateRecord(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req map[string]interface{}
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	// Validate
	tmdbID, ok := req["tmdb_id"].(float64)
	if !ok || tmdbID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "tmdb_id is required"})
		return
	}
	recordType, ok := req["record_type"].(string)
	if !ok || (recordType != "movie" && recordType != "tv") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "record_type must be 'movie' or 'tv'"})
		return
	}
	rating, ok := req["rating"].(float64)
	if !ok || rating < 0 || rating > 10 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "rating must be between 0 and 10"})
		return
	}

	// Upsert record
	data := map[string]interface{}{
		"user_id":     userID,
		"tmdb_id":     int(tmdbID),
		"record_type": recordType,
		"rating":      int(rating),
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
	query := fmt.Sprintf(`
		SELECT
			COUNT(*) as total_records,
			COUNT(CASE WHEN record_type = 'movie' THEN 1 END) as movies_watched,
			COUNT(CASE WHEN record_type = 'tv' THEN 1 END) as shows_watched,
			AVG(CASE WHEN rating > 0 THEN rating ELSE NULL END) as avg_rating,
			MAX(rating) as highest_rating,
			COUNT(CASE WHEN rating > 0 THEN 1 END) as rated_count
		FROM user_records
		WHERE user_id = '%s'
	`, userID)

	result, err := db.Query(query)
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
