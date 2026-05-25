package handler

import (
	"encoding/json"
	"net/http"

	"github.com/chs98412/prototype/backend/pkg/supabase"
	"github.com/gin-gonic/gin"
)

type ReviewResponse struct {
	ID        string `json:"id"`
	UserID    string `json:"user_id"`
	TMDBID    int    `json:"tmdb_id"`
	Title     string `json:"title"`
	Content   string `json:"content"`
	Spoiler   bool   `json:"spoiler"`
	Rating    int    `json:"rating"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

type CreateReviewRequest struct {
	TMDBID  int    `json:"tmdb_id"`
	Title   string `json:"title"`
	Content string `json:"content"`
	Spoiler bool   `json:"spoiler"`
	Rating  int    `json:"rating"`
}

// GetReviews retrieves reviews (all or user-specific)
func GetReviews(c *gin.Context) {
	userID := c.GetString("userID")

	limit := c.DefaultQuery("limit", "20")
	offset := c.DefaultQuery("offset", "0")
	filterUserID := c.DefaultQuery("user_id", "")

	query := "order=created_at.desc&limit=" + limit + "&offset=" + offset
	if filterUserID != "" {
		query = "user_id=eq." + filterUserID + "&" + query
	} else if userID != "" {
		query = "user_id=eq." + userID + "&" + query
	}

	db := supabase.NewClient()
	result, err := db.Select("reviews", query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var reviews []map[string]interface{}
	json.Unmarshal(result, &reviews)

	c.JSON(http.StatusOK, gin.H{
		"data":  reviews,
		"count": len(reviews),
	})
}

// GetReviewByID retrieves a single review
func GetReviewByID(c *gin.Context) {
	reviewID := c.Param("reviewId")

	db := supabase.NewClient()
	result, err := db.Select("reviews", "id=eq."+reviewID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var reviews []ReviewResponse
	if err := json.Unmarshal(result, &reviews); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to parse response"})
		return
	}

	if len(reviews) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "review not found"})
		return
	}

	c.JSON(http.StatusOK, reviews[0])
}

// CreateReview creates a new review (upsert)
func CreateReview(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req CreateReviewRequest
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	if req.TMDBID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "tmdb_id is required"})
		return
	}
	if req.Title == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "title is required"})
		return
	}
	if req.Content == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "content is required"})
		return
	}

	data := map[string]interface{}{
		"user_id": userID,
		"tmdb_id": req.TMDBID,
		"title":   req.Title,
		"content": req.Content,
		"spoiler": req.Spoiler,
		"rating":  req.Rating,
	}

	db := supabase.NewClient()
	result, err := db.Upsert("reviews", data)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var reviews []ReviewResponse
	if err := json.Unmarshal(result, &reviews); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to parse response"})
		return
	}

	if len(reviews) == 0 {
		c.JSON(http.StatusCreated, gin.H{"success": true})
		return
	}

	c.JSON(http.StatusCreated, reviews[0])
}

// UpdateReview updates a review
func UpdateReview(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	reviewID := c.Param("reviewId")

	var req CreateReviewRequest
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	// Verify ownership
	db := supabase.NewClient()
	result, err := db.Select("reviews", "id=eq."+reviewID+"&user_id=eq."+userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var reviews []ReviewResponse
	json.Unmarshal(result, &reviews)
	if len(reviews) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "review not found or not owned by user"})
		return
	}

	// Update
	data := map[string]interface{}{
		"title":   req.Title,
		"content": req.Content,
		"spoiler": req.Spoiler,
		"rating":  req.Rating,
	}

	result, err = db.Update("reviews", data, "id=eq."+reviewID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var updatedReviews []ReviewResponse
	if err := json.Unmarshal(result, &updatedReviews); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to parse response"})
		return
	}

	if len(updatedReviews) == 0 {
		c.JSON(http.StatusOK, gin.H{"success": true})
		return
	}

	c.JSON(http.StatusOK, updatedReviews[0])
}

// DeleteReview deletes a review
func DeleteReview(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	reviewID := c.Param("reviewId")

	// Verify ownership
	db := supabase.NewClient()
	result, err := db.Select("reviews", "id=eq."+reviewID+"&user_id=eq."+userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var reviews []ReviewResponse
	json.Unmarshal(result, &reviews)
	if len(reviews) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "review not found or not owned by user"})
		return
	}

	// Delete
	_, err = db.Delete("reviews", "id=eq."+reviewID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// GetReviewsByTMDB retrieves all reviews for a specific content
func GetReviewsByTMDB(c *gin.Context) {
	tmdbID := c.Param("tmdbId")

	limit := c.DefaultQuery("limit", "20")
	offset := c.DefaultQuery("offset", "0")
	query := "tmdb_id=eq." + tmdbID + "&order=created_at.desc&limit=" + limit + "&offset=" + offset

	db := supabase.NewClient()
	result, err := db.Select("reviews", query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var reviews []ReviewResponse
	json.Unmarshal(result, &reviews)

	c.JSON(http.StatusOK, gin.H{
		"data":  reviews,
		"count": len(reviews),
	})
}
