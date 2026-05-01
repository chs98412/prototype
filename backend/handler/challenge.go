package handler

import (
	"fmt"
	"net/http"

	"github.com/chs98412/prototype/backend/pkg/supabase"
	"github.com/gin-gonic/gin"
)

type progressRequest struct {
	TmdbID int `json:"tmdb_id" binding:"required"`
	Delta  int `json:"delta"`
}

func UpdateChallengeProgress(c *gin.Context) {
	userID := c.GetString("userID")

	var req progressRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "tmdb_id required"})
		return
	}
	if req.Delta == 0 {
		req.Delta = 1
	}

	db := supabase.NewClient()
	query := fmt.Sprintf(`
		INSERT INTO challenge_progress (user_id, challenge_id, progress)
		SELECT
			'%s' as user_id,
			c.id as challenge_id,
			%d as progress
		FROM challenges c
		WHERE c.tmdb_id = %d
		ON CONFLICT (user_id, challenge_id)
		DO UPDATE SET progress = challenge_progress.progress + %d
	`, userID, req.Delta, req.TmdbID, req.Delta)

	_, err := db.Query(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"ok": true})
}
