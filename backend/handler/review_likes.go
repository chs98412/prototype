package handler

import (
	"encoding/json"
	"net/http"

	"github.com/chs98412/prototype/backend/pkg/supabase"
	"github.com/gin-gonic/gin"
)

type ReviewLikeResponse struct {
	ID       string `json:"id"`
	ReviewID string `json:"review_id"`
	UserID   string `json:"user_id"`
	CreatedAt string `json:"created_at"`
}

// GetReviewLikes retrieves likes for a review
func GetReviewLikes(c *gin.Context) {
	reviewID := c.Param("reviewId")

	db := supabase.NewClient()
	result, err := db.Select("review_likes", "review_id=eq."+reviewID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var likes []ReviewLikeResponse
	json.Unmarshal(result, &likes)

	c.JSON(http.StatusOK, gin.H{
		"data":  likes,
		"count": len(likes),
	})
}

// LikeReview adds a like to a review
func LikeReview(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	reviewID := c.Param("reviewId")
	if reviewID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "reviewId is required"})
		return
	}

	// Check if already liked
	db := supabase.NewClient()
	result, err := db.Select("review_likes", "review_id=eq."+reviewID+"&user_id=eq."+userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var existing []ReviewLikeResponse
	json.Unmarshal(result, &existing)
	if len(existing) > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "already liked"})
		return
	}

	// Insert like
	data := map[string]interface{}{
		"review_id": reviewID,
		"user_id":   userID,
	}

	result, err = db.Insert("review_likes", data)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var likes []ReviewLikeResponse
	if err := json.Unmarshal(result, &likes); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to parse response"})
		return
	}

	if len(likes) == 0 {
		c.JSON(http.StatusCreated, gin.H{"success": true})
		return
	}

	c.JSON(http.StatusCreated, likes[0])
}

// UnlikeReview removes a like from a review
func UnlikeReview(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	reviewID := c.Param("reviewId")
	if reviewID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "reviewId is required"})
		return
	}

	db := supabase.NewClient()
	_, err := db.Delete("review_likes", "review_id=eq."+reviewID+"&user_id=eq."+userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// CheckReviewLike checks if user liked a review
func CheckReviewLike(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	reviewID := c.Param("reviewId")

	db := supabase.NewClient()
	result, err := db.Select("review_likes", "review_id=eq."+reviewID+"&user_id=eq."+userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var likes []ReviewLikeResponse
	json.Unmarshal(result, &likes)

	c.JSON(http.StatusOK, gin.H{
		"liked": len(likes) > 0,
	})
}
