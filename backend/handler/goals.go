package handler

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/chs98412/prototype/backend/db"
)

type Goal struct {
	UserID      string `json:"user_id"`
	Year        int    `json:"year"`
	TargetCount int    `json:"target_count"`
}

func GetGoal(c *gin.Context) {
	userID := c.GetString("userID")
	year := time.Now().Year()

	query := `
	SELECT user_id, year, target_count
	FROM user_goals
	WHERE user_id = $1 AND year = $2
	`

	var goal Goal
	err := db.DB.QueryRow(query, userID, year).Scan(&goal.UserID, &goal.Year, &goal.TargetCount)
	if err != nil {
		// No goal set yet, return empty response
		c.JSON(http.StatusOK, gin.H{"user_id": userID, "year": year, "target_count": nil})
		return
	}

	c.JSON(http.StatusOK, goal)
}

func SetGoal(c *gin.Context) {
	userID := c.GetString("userID")
	year := time.Now().Year()

	var body struct {
		TargetCount int `json:"target_count" binding:"required"`
	}

	if err := c.BindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	query := `
	INSERT INTO user_goals (user_id, year, target_count)
	VALUES ($1, $2, $3)
	ON CONFLICT (user_id, year) DO UPDATE SET
		target_count = $3
	RETURNING user_id, year, target_count
	`

	var goal Goal
	err := db.DB.QueryRow(query, userID, year, body.TargetCount).Scan(&goal.UserID, &goal.Year, &goal.TargetCount)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to set goal"})
		return
	}

	c.JSON(http.StatusOK, goal)
}
