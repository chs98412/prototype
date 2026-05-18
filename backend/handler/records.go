package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/chs98412/prototype/backend/db"
)

type RecordItem struct {
	ID        string `json:"id"`
	UserID    string `json:"user_id"`
	TmdbID    int    `json:"tmdb_id"`
	MediaType string `json:"media_type"`
	Status    string `json:"status"`
	Rating    *int   `json:"rating"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

type RecordStats struct {
	WatchedCount  int `json:"watched_count"`
	WatchingCount int `json:"watching_count"`
	WantCount     int `json:"want_count"`
}

func GetRecords(c *gin.Context) {
	userID := c.GetString("userID")
	status := c.Query("status")
	limit := 20
	offset := 0

	if l := c.Query("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil {
			limit = parsed
		}
	}
	if o := c.Query("offset"); o != "" {
		if parsed, err := strconv.Atoi(o); err == nil {
			offset = parsed
		}
	}

	query := `
	SELECT id, user_id, tmdb_id, media_type, status, rating, created_at, updated_at
	FROM user_records
	WHERE user_id = $1
	`
	args := []interface{}{userID}

	if status != "" {
		query += ` AND status = $2`
		args = append(args, status)
	}

	query += ` ORDER BY updated_at DESC LIMIT $` + strconv.Itoa(len(args)+1) + ` OFFSET $` + strconv.Itoa(len(args)+2)
	args = append(args, limit, offset)

	rows, err := db.DB.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch records"})
		return
	}
	defer rows.Close()

	var records []RecordItem
	for rows.Next() {
		var record RecordItem
		err := rows.Scan(&record.ID, &record.UserID, &record.TmdbID, &record.MediaType, &record.Status, &record.Rating, &record.CreatedAt, &record.UpdatedAt)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan records"})
			return
		}
		records = append(records, record)
	}

	c.JSON(http.StatusOK, records)
}

func UpsertRecord(c *gin.Context) {
	userID := c.GetString("userID")

	var body struct {
		TmdbID    int     `json:"tmdb_id" binding:"required"`
		MediaType string  `json:"media_type" binding:"required"`
		Status    string  `json:"status" binding:"required"`
		Rating    *int    `json:"rating"`
	}

	if err := c.BindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	query := `
	INSERT INTO user_records (user_id, tmdb_id, media_type, status, rating)
	VALUES ($1, $2, $3, $4, $5)
	ON CONFLICT (user_id, tmdb_id) DO UPDATE SET
		status = $4,
		rating = $5,
		updated_at = NOW()
	RETURNING id, user_id, tmdb_id, media_type, status, rating, created_at, updated_at
	`

	var record RecordItem
	err := db.DB.QueryRow(query, userID, body.TmdbID, body.MediaType, body.Status, body.Rating).
		Scan(&record.ID, &record.UserID, &record.TmdbID, &record.MediaType, &record.Status, &record.Rating, &record.CreatedAt, &record.UpdatedAt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upsert record"})
		return
	}

	c.JSON(http.StatusOK, record)
}

func DeleteRecord(c *gin.Context) {
	userID := c.GetString("userID")
	recordID := c.Param("id")

	query := `DELETE FROM user_records WHERE id = $1 AND user_id = $2`

	result, err := db.DB.Exec(query, recordID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete record"})
		return
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Record not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

func DeleteRecordByTmdbID(c *gin.Context) {
	userID := c.GetString("userID")
	tmdbID := c.Param("tmdbId")

	query := `DELETE FROM user_records WHERE tmdb_id = $1 AND user_id = $2`

	result, err := db.DB.Exec(query, tmdbID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete record"})
		return
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Record not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

func GetRecordStats(c *gin.Context) {
	userID := c.GetString("userID")

	query := `
	SELECT
		COUNT(CASE WHEN status = 'watched' THEN 1 END) as watched_count,
		COUNT(CASE WHEN status = 'watching' THEN 1 END) as watching_count,
		COUNT(CASE WHEN status = 'want' THEN 1 END) as want_count
	FROM user_records
	WHERE user_id = $1
	`

	var stats RecordStats
	err := db.DB.QueryRow(query, userID).Scan(&stats.WatchedCount, &stats.WatchingCount, &stats.WantCount)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch stats"})
		return
	}

	c.JSON(http.StatusOK, stats)
}
