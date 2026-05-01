package handler

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/chs98412/prototype/backend/pkg/supabase"
	"github.com/gin-gonic/gin"
)

type streakResult struct {
	CurrentStreak int `json:"current_streak"`
	LongestStreak int `json:"longest_streak"`
}

func LogStreak(c *gin.Context) {
	userID := c.GetString("userID")

	db := supabase.NewClient()
	query := fmt.Sprintf(`
		SELECT
			COALESCE(current_streak, 0) as current_streak,
			COALESCE(longest_streak, 0) as longest_streak
		FROM (
			SELECT
				COUNT(*) FILTER (
					WHERE watched_at::DATE >= CURRENT_DATE - INTERVAL '1 day' * (ROW_NUMBER() OVER (ORDER BY watched_at::DATE DESC) - 1)
				) as current_streak,
				(
					SELECT COUNT(*)
					FROM (
						SELECT watched_at::DATE as watch_date,
							ROW_NUMBER() OVER (ORDER BY watched_at::DATE DESC) - ROW_NUMBER() OVER (ORDER BY watched_at::DATE DESC) as grp
						FROM user_records
						WHERE user_id = '%s'
						GROUP BY watch_date
					) t
					GROUP BY grp
					ORDER BY COUNT(*) DESC
					LIMIT 1
				) as longest_streak
			FROM user_records
			WHERE user_id = '%s'
			ORDER BY watched_at DESC
			LIMIT 1
		) t
	`, userID, userID)

	result, err := db.Query(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var results []streakResult
	if err := json.Unmarshal(result, &results); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to parse response"})
		return
	}

	if len(results) == 0 {
		c.JSON(http.StatusOK, streakResult{CurrentStreak: 0, LongestStreak: 0})
		return
	}

	c.JSON(http.StatusOK, results[0])
}
