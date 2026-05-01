package handler

import (
	"encoding/json"
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
	result, err := db.RPC("get_activity_heatmap", map[string]interface{}{
		"p_user_id": userID,
	})
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
	result, err := db.RPC("get_genre_ratings", map[string]interface{}{
		"p_user_id": userID,
	})
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
	result, err := db.RPC("get_taste_match", map[string]interface{}{
		"p_user_id_1": userID,
		"p_user_id_2": otherUserID,
	})
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
