package handler

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"

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
