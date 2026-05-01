package handler

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/chs98412/prototype/backend/pkg/supabase"
	"github.com/gin-gonic/gin"
)

// GetHeatmap retrieves user's activity heatmap (52 weeks x 7 days)
func GetHeatmap(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	db := supabase.NewClient()
	query := fmt.Sprintf(`
		SELECT
			EXTRACT(WEEK FROM watched_at) as week,
			EXTRACT(DOW FROM watched_at) as day,
			COUNT(*) as count
		FROM user_records
		WHERE user_id = '%s'
		GROUP BY week, day
		ORDER BY week, day
	`, userID)

	result, err := db.Query(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var heatmap interface{}
	if err := json.Unmarshal(result, &heatmap); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to parse response"})
		return
	}

	c.JSON(http.StatusOK, heatmap)
}

// GetGenreRatings retrieves user's genre preferences and ratings
func GetGenreRatings(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	db := supabase.NewClient()
	query := fmt.Sprintf(`
		SELECT
			JSONB_ARRAY_ELEMENTS(genre_ids) as genre_id,
			AVG(rating) as avg_rating,
			COUNT(*) as count
		FROM user_records
		WHERE user_id = '%s' AND rating > 0
		GROUP BY genre_id
		ORDER BY avg_rating DESC
	`, userID)

	result, err := db.Query(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var ratings []map[string]interface{}
	if err := json.Unmarshal(result, &ratings); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to parse response"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  ratings,
		"count": len(ratings),
	})
}

// GetTasteMatch retrieves taste compatibility with another user
func GetTasteMatch(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	otherUserID := c.Param("userId")
	if otherUserID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "userId is required"})
		return
	}

	if userID == otherUserID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "cannot compare with yourself"})
		return
	}

	db := supabase.NewClient()
	query := fmt.Sprintf(`
		SELECT
			COUNT(DISTINCT CASE WHEN ur1.tmdb_id = ur2.tmdb_id THEN ur1.tmdb_id END) as common_titles,
			AVG(CASE WHEN ur1.tmdb_id = ur2.tmdb_id THEN ABS(ur1.rating - ur2.rating) END) as avg_rating_diff,
			ROUND(
				100.0 * COUNT(DISTINCT CASE WHEN ur1.tmdb_id = ur2.tmdb_id THEN ur1.tmdb_id END)
				/ GREATEST(COUNT(DISTINCT ur1.tmdb_id), COUNT(DISTINCT ur2.tmdb_id), 1)
			, 2) as compatibility_score
		FROM user_records ur1
		CROSS JOIN user_records ur2
		WHERE ur1.user_id = '%s'
		AND ur2.user_id = '%s'
	`, userID, otherUserID)

	result, err := db.Query(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var match map[string]interface{}
	if err := json.Unmarshal(result, &match); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to parse response"})
		return
	}

	c.JSON(http.StatusOK, match)
}
