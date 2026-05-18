package handler

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/chs98412/prototype/backend/db"
)

type HeatmapData struct {
	ActivityDate string `json:"activity_date"`
	Count        int    `json:"cnt"`
}

type TasteMatchResult struct {
	MatchPct     *float64 `json:"match_pct"`
	CommonCount  int      `json:"common_count"`
}

type GenreRating struct {
	GenreID   int     `json:"genre_id"`
	GenreName string  `json:"genre_name"`
	AvgRating float64 `json:"avg_rating"`
	Count     int     `json:"count"`
}

func GetHeatmap(c *gin.Context) {
	userID := c.GetString("userID")

	query := `
	SELECT DATE(created_at) as activity_date, COUNT(*) as cnt
	FROM user_records
	WHERE user_id = $1
	GROUP BY DATE(created_at)
	ORDER BY activity_date ASC
	`

	rows, err := db.DB.Query(query, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch heatmap"})
		return
	}
	defer rows.Close()

	var items []HeatmapData
	for rows.Next() {
		var item HeatmapData
		if err := rows.Scan(&item.ActivityDate, &item.Count); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan heatmap data"})
			return
		}
		items = append(items, item)
	}

	c.JSON(http.StatusOK, items)
}

func GetTasteMatch(c *gin.Context) {
	myUserID := c.GetString("userID")
	friendUserID := c.Param("userId")

	// Calculate match percentage based on common records with similar ratings
	query := `
	SELECT
		ROUND(AVG(CASE
			WHEN ABS(my.rating - friend.rating) <= 1 THEN 100
			WHEN ABS(my.rating - friend.rating) <= 2 THEN 50
			ELSE 0
		END), 1) as match_pct,
		COUNT(DISTINCT my.tmdb_id) as common_count
	FROM user_records my
	INNER JOIN user_records friend ON friend.tmdb_id = my.tmdb_id AND friend.user_id = $2
	WHERE my.user_id = $1 AND my.status = 'watched' AND friend.status = 'watched'
	`

	var result TasteMatchResult
	err := db.DB.QueryRow(query, myUserID, friendUserID).Scan(&result.MatchPct, &result.CommonCount)
	if err != nil {
		// No common records is not an error, just return 0
		result.MatchPct = nil
		result.CommonCount = 0
	}

	c.JSON(http.StatusOK, result)
}

func GetGenreRatings(c *gin.Context) {
	userID := c.GetString("userID")

	// This is a simplified version - adjust based on your schema
	query := `
	SELECT
		g.id as genre_id,
		g.name as genre_name,
		AVG(r.rating) as avg_rating,
		COUNT(DISTINCT r.tmdb_id) as count
	FROM user_records r
	LEFT JOIN genres g ON g.id = ANY(r.genre_ids)
	WHERE r.user_id = $1 AND r.rating IS NOT NULL
	GROUP BY g.id, g.name
	ORDER BY avg_rating DESC
	`

	rows, err := db.DB.Query(query, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch genre ratings"})
		return
	}
	defer rows.Close()

	var ratings []GenreRating
	for rows.Next() {
		var rating GenreRating
		if err := rows.Scan(&rating.GenreID, &rating.GenreName, &rating.AvgRating, &rating.Count); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan genre rating"})
			return
		}
		ratings = append(ratings, rating)
	}

	c.JSON(http.StatusOK, ratings)
}
