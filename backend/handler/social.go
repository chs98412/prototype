package handler

import (
	"encoding/json"
	"net/http"

	"github.com/chs98412/prototype/backend/pkg/supabase"
	"github.com/gin-gonic/gin"
)

type FollowResponse struct {
	ID           string `json:"id"`
	FollowerID   string `json:"follower_id"`
	FollowingID  string `json:"following_id"`
	CreatedAt    string `json:"created_at"`
}

// GetFollows retrieves user's follow list
func GetFollows(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	limit := c.DefaultQuery("limit", "50")
	offset := c.DefaultQuery("offset", "0")
	query := "follower_id=eq." + userID + "&order=created_at.desc&limit=" + limit + "&offset=" + offset

	db := supabase.NewClient()
	result, err := db.Select("user_follows", query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var follows []FollowResponse
	json.Unmarshal(result, &follows)

	c.JSON(http.StatusOK, gin.H{
		"data":  follows,
		"count": len(follows),
	})
}

// GetFollowers retrieves user's followers
func GetFollowers(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	limit := c.DefaultQuery("limit", "50")
	offset := c.DefaultQuery("offset", "0")
	query := "following_id=eq." + userID + "&order=created_at.desc&limit=" + limit + "&offset=" + offset

	db := supabase.NewClient()
	result, err := db.Select("user_follows", query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var follows []FollowResponse
	json.Unmarshal(result, &follows)

	c.JSON(http.StatusOK, gin.H{
		"data":  follows,
		"count": len(follows),
	})
}

// Follow creates a follow relationship
func Follow(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	targetUserID := c.Param("userId")
	if targetUserID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "userId is required"})
		return
	}

	if userID == targetUserID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "cannot follow yourself"})
		return
	}

	data := map[string]interface{}{
		"follower_id": userID,
		"following_id": targetUserID,
	}

	db := supabase.NewClient()
	result, err := db.Insert("user_follows", data)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var follows []FollowResponse
	if err := json.Unmarshal(result, &follows); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to parse response"})
		return
	}

	if len(follows) == 0 {
		c.JSON(http.StatusCreated, gin.H{"success": true})
		return
	}

	c.JSON(http.StatusCreated, follows[0])
}

// Unfollow removes a follow relationship
func Unfollow(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	targetUserID := c.Param("userId")
	if targetUserID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "userId is required"})
		return
	}

	db := supabase.NewClient()
	_, err := db.Delete("user_follows", "follower_id=eq."+userID+"&following_id=eq."+targetUserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// GetFeed retrieves friend's activity feed (uses RPC)
func GetFeed(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	limit := c.DefaultQuery("limit", "20")
	offset := c.DefaultQuery("offset", "0")

	db := supabase.NewClient()
	result, err := db.RPC("get_friend_feed", map[string]interface{}{
		"p_user_id": userID,
		"p_limit":   limit,
		"p_offset":  offset,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var feedItems []map[string]interface{}
	if err := json.Unmarshal(result, &feedItems); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to parse response"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  feedItems,
		"count": len(feedItems),
	})
}

// GetNotifications retrieves user's notifications (uses RPC)
func GetNotifications(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	limit := c.DefaultQuery("limit", "20")
	offset := c.DefaultQuery("offset", "0")

	db := supabase.NewClient()
	result, err := db.RPC("get_notifications", map[string]interface{}{
		"p_user_id": userID,
		"p_limit":   limit,
		"p_offset":  offset,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var notifications []map[string]interface{}
	if err := json.Unmarshal(result, &notifications); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to parse response"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  notifications,
		"count": len(notifications),
	})
}

// IsFollowing checks if user follows another user
func IsFollowing(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	targetUserID := c.Param("userId")

	db := supabase.NewClient()
	result, err := db.Select("user_follows", "follower_id=eq."+userID+"&following_id=eq."+targetUserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var follows []FollowResponse
	json.Unmarshal(result, &follows)

	c.JSON(http.StatusOK, gin.H{
		"following": len(follows) > 0,
	})
}
