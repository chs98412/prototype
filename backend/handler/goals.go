package handler

import (
	"encoding/json"
	"net/http"

	"github.com/chs98412/prototype/backend/pkg/supabase"
	"github.com/gin-gonic/gin"
)

type GoalResponse struct {
	ID            string `json:"id"`
	UserID        string `json:"user_id"`
	Year          int    `json:"year"`
	MovieGoal     int    `json:"movie_goal"`
	DramaGoal     int    `json:"drama_goal"`
	CreatedAt     string `json:"created_at"`
	UpdatedAt     string `json:"updated_at"`
}

type ChallengeResponse struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Type      string `json:"type"`
	Target    int    `json:"target"`
	Reward    int    `json:"reward"`
	CreatedAt string `json:"created_at"`
}

type UserChallengeResponse struct {
	ID           string `json:"id"`
	UserID       string `json:"user_id"`
	ChallengeID  string `json:"challenge_id"`
	Progress     int    `json:"progress"`
	Status       string `json:"status"` // "active", "completed", "abandoned"
	StartedAt    string `json:"started_at"`
	CompletedAt  string `json:"completed_at"`
}

type UpdateGoalRequest struct {
	MovieGoal int `json:"movie_goal"`
	DramaGoal int `json:"drama_goal"`
}

// GetGoal retrieves user's yearly goal
func GetGoal(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	year := c.DefaultQuery("year", "2026")

	db := supabase.NewClient()
	result, err := db.Select("user_goals", "user_id=eq."+userID+"&year=eq."+year)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var goals []GoalResponse
	if err := json.Unmarshal(result, &goals); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to parse response"})
		return
	}

	if len(goals) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "goal not found"})
		return
	}

	c.JSON(http.StatusOK, goals[0])
}

// UpdateGoal updates or creates user's yearly goal
func UpdateGoal(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req UpdateGoalRequest
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	if req.MovieGoal < 0 || req.DramaGoal < 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "goals must be non-negative"})
		return
	}

	data := map[string]interface{}{
		"user_id":    userID,
		"year":       2026,
		"movie_goal": req.MovieGoal,
		"drama_goal": req.DramaGoal,
	}

	db := supabase.NewClient()
	result, err := db.Upsert("user_goals", data)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var goals []GoalResponse
	if err := json.Unmarshal(result, &goals); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to parse response"})
		return
	}

	if len(goals) == 0 {
		c.JSON(http.StatusOK, gin.H{"success": true})
		return
	}

	c.JSON(http.StatusOK, goals[0])
}

// GetChallenges retrieves available challenges
func GetChallenges(c *gin.Context) {
	limit := c.DefaultQuery("limit", "50")
	offset := c.DefaultQuery("offset", "0")
	query := "order=created_at.desc&limit=" + limit + "&offset=" + offset

	db := supabase.NewClient()
	result, err := db.Select("challenges", query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var challenges []ChallengeResponse
	json.Unmarshal(result, &challenges)

	c.JSON(http.StatusOK, gin.H{
		"data":  challenges,
		"count": len(challenges),
	})
}

// GetUserChallenges retrieves user's ongoing challenges
func GetUserChallenges(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	limit := c.DefaultQuery("limit", "50")
	offset := c.DefaultQuery("offset", "0")
	status := c.DefaultQuery("status", "active")
	query := "user_id=eq." + userID + "&status=eq." + status + "&order=started_at.desc&limit=" + limit + "&offset=" + offset

	db := supabase.NewClient()
	result, err := db.Select("user_challenge_progress", query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var userChallenges []UserChallengeResponse
	json.Unmarshal(result, &userChallenges)

	c.JSON(http.StatusOK, gin.H{
		"data":  userChallenges,
		"count": len(userChallenges),
	})
}

// StartChallenge adds a challenge to user's active challenges
func StartChallenge(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	challengeID := c.Param("challengeId")
	if challengeID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "challengeId is required"})
		return
	}

	data := map[string]interface{}{
		"user_id":      userID,
		"challenge_id": challengeID,
		"progress":     0,
		"status":       "active",
	}

	db := supabase.NewClient()
	result, err := db.Insert("user_challenge_progress", data)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var userChallenges []UserChallengeResponse
	if err := json.Unmarshal(result, &userChallenges); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to parse response"})
		return
	}

	if len(userChallenges) == 0 {
		c.JSON(http.StatusCreated, gin.H{"success": true})
		return
	}

	c.JSON(http.StatusCreated, userChallenges[0])
}

// AbandonChallenge marks a challenge as abandoned
func AbandonChallenge(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	progressID := c.Param("progressId")
	if progressID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "progressId is required"})
		return
	}

	// Verify ownership
	db := supabase.NewClient()
	result, err := db.Select("user_challenge_progress", "id=eq."+progressID+"&user_id=eq."+userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var userChallenges []UserChallengeResponse
	json.Unmarshal(result, &userChallenges)
	if len(userChallenges) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "challenge not found"})
		return
	}

	// Update status
	updateData := map[string]interface{}{
		"status": "abandoned",
	}

	_, err = db.Update("user_challenge_progress", updateData, "id=eq."+progressID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}
