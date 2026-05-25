package handler

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/chs98412/prototype/backend/db"
)

type Challenge struct {
	ID            string `json:"id"`
	Title         string `json:"title"`
	Description   string `json:"description"`
	RequiredCount int    `json:"required_count"`
	BadgeEmoji    string `json:"badge_emoji"`
}

type ChallengeProgress struct {
	ChallengeID string `json:"challenge_id"`
	CurrentCount int    `json:"current_count"`
	CompletedAt string `json:"completed_at"`
}

type ChallengeWithProgress struct {
	Challenge Challenge          `json:"challenge"`
	Progress  *ChallengeProgress `json:"progress"`
}

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

	supabaseURL := os.Getenv("SUPABASE_URL")
	serviceKey := os.Getenv("SUPABASE_SERVICE_ROLE_KEY")

	body, _ := json.Marshal(map[string]interface{}{
		"p_user_id": userID,
		"p_tmdb_id": req.TmdbID,
		"p_delta":   req.Delta,
	})

	httpReq, err := http.NewRequest("POST", supabaseURL+"/rest/v1/rpc/update_challenge_progress", bytes.NewBuffer(body))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "request error"})
		return
	}
	httpReq.Header.Set("apikey", serviceKey)
	httpReq.Header.Set("Authorization", "Bearer "+serviceKey)
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(httpReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "supabase error"})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusNoContent {
		body, _ := io.ReadAll(resp.Body)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("rpc error: %s", body)})
		return
	}

	c.JSON(http.StatusOK, gin.H{"ok": true})
}

func GetChallenges(c *gin.Context) {
	userID := c.GetString("userID")

	// Get all challenges
	challengeQuery := `
	SELECT id, title, description, required_count, badge_emoji
	FROM challenges
	ORDER BY created_at
	`

	rows, err := db.DB.Query(challengeQuery)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch challenges"})
		return
	}
	defer rows.Close()

	var challenges []Challenge
	for rows.Next() {
		var ch Challenge
		if err := rows.Scan(&ch.ID, &ch.Title, &ch.Description, &ch.RequiredCount, &ch.BadgeEmoji); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan challenges"})
			return
		}
		challenges = append(challenges, ch)
	}

	// If no user ID, return just challenges
	if userID == "" {
		c.JSON(http.StatusOK, challenges)
		return
	}

	// Get user's progress for each challenge
	progressMap := make(map[string]*ChallengeProgress)
	if userID != "" {
		progressQuery := `
		SELECT challenge_id, current_count, completed_at
		FROM user_challenge_progress
		WHERE user_id = $1
		`

		progRows, err := db.DB.Query(progressQuery, userID)
		if err == nil {
			defer progRows.Close()

			for progRows.Next() {
				var p ChallengeProgress
				if err := progRows.Scan(&p.ChallengeID, &p.CurrentCount, &p.CompletedAt); err == nil {
					progressMap[p.ChallengeID] = &p
				}
			}
		}
	}

	// Combine challenges with progress
	var result []ChallengeWithProgress
	for _, ch := range challenges {
		cwp := ChallengeWithProgress{
			Challenge: ch,
			Progress:  progressMap[ch.ID],
		}
		result = append(result, cwp)
	}

	c.JSON(http.StatusOK, result)
}
