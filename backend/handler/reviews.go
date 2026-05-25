package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/chs98412/prototype/backend/db"
)

type ReviewItem struct {
	ID        string      `json:"id"`
	UserID    string      `json:"user_id"`
	TmdbID    int         `json:"tmdb_id"`
	MediaType string      `json:"media_type"`
	Content   string      `json:"content"`
	IsSpoiler bool        `json:"is_spoiler"`
	CreatedAt string      `json:"created_at"`
	UpdatedAt string      `json:"updated_at"`
	LikeCount int         `json:"like_count"`
	UserLiked bool        `json:"user_liked"`
	User      *Profile    `json:"user_profiles"`
}

func GetReviews(c *gin.Context) {
	userID := c.GetString("userID")
	limit := 20
	offset := 0

	if l := c.Query("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil {
			limit = parsed
		}
	}
	if o := c.Query("offset"); o != "" {
		if parsed, err := strconv.Atoi(o); err == nil {
			offset = parsed
		}
	}

	query := `
	SELECT r.id, r.user_id, r.tmdb_id, r.media_type, r.content, r.is_spoiler, r.created_at, r.updated_at,
		COUNT(DISTINCT l.user_id) as like_count,
		p.user_id, p.display_name, p.avatar_url
	FROM reviews r
	LEFT JOIN review_likes l ON l.review_id = r.id
	LEFT JOIN user_profiles p ON p.user_id = r.user_id
	WHERE r.user_id = $1
	GROUP BY r.id, p.user_id, p.display_name, p.avatar_url
	ORDER BY r.created_at DESC
	LIMIT $2 OFFSET $3
	`

	rows, err := db.DB.Query(query, userID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch reviews"})
		return
	}
	defer rows.Close()

	var reviews []ReviewItem
	for rows.Next() {
		var review ReviewItem
		var userID *string
		var displayName *string
		var avatarURL *string

		err := rows.Scan(
			&review.ID, &review.UserID, &review.TmdbID, &review.MediaType, &review.Content, &review.IsSpoiler,
			&review.CreatedAt, &review.UpdatedAt, &review.LikeCount,
			&userID, &displayName, &avatarURL,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan reviews"})
			return
		}

		if userID != nil {
			review.User = &Profile{
				UserID:      *userID,
				DisplayName: displayName,
				AvatarURL:   avatarURL,
			}
		}

		reviews = append(reviews, review)
	}

	c.JSON(http.StatusOK, reviews)
}

func GetReviewByID(c *gin.Context) {
	reviewID := c.Param("id")
	currentUserID := c.GetString("userID")

	query := `
	SELECT r.id, r.user_id, r.tmdb_id, r.media_type, r.content, r.is_spoiler, r.created_at, r.updated_at,
		COUNT(DISTINCT l.user_id) as like_count,
		CASE WHEN EXISTS(SELECT 1 FROM review_likes WHERE review_id = r.id AND user_id = $2) THEN true ELSE false END as user_liked,
		p.user_id, p.display_name, p.avatar_url
	FROM reviews r
	LEFT JOIN review_likes l ON l.review_id = r.id
	LEFT JOIN user_profiles p ON p.user_id = r.user_id
	WHERE r.id = $1
	GROUP BY r.id, p.user_id, p.display_name, p.avatar_url
	`

	var review ReviewItem
	var userID *string
	var displayName *string
	var avatarURL *string

	err := db.DB.QueryRow(query, reviewID, currentUserID).Scan(
		&review.ID, &review.UserID, &review.TmdbID, &review.MediaType, &review.Content, &review.IsSpoiler,
		&review.CreatedAt, &review.UpdatedAt, &review.LikeCount, &review.UserLiked,
		&userID, &displayName, &avatarURL,
	)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Review not found"})
		return
	}

	if userID != nil {
		review.User = &Profile{
			UserID:      *userID,
			DisplayName: displayName,
			AvatarURL:   avatarURL,
		}
	}

	c.JSON(http.StatusOK, review)
}

func GetReviewsByTmdbID(c *gin.Context) {
	tmdbID := c.Param("tmdbId")
	limit := 20

	if l := c.Query("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil {
			limit = parsed
		}
	}

	query := `
	SELECT r.id, r.user_id, r.tmdb_id, r.media_type, r.content, r.is_spoiler, r.created_at, r.updated_at,
		COUNT(DISTINCT l.user_id) as like_count,
		p.user_id, p.display_name, p.avatar_url
	FROM reviews r
	LEFT JOIN review_likes l ON l.review_id = r.id
	LEFT JOIN user_profiles p ON p.user_id = r.user_id
	WHERE r.tmdb_id = $1
	GROUP BY r.id, p.user_id, p.display_name, p.avatar_url
	ORDER BY r.created_at DESC
	LIMIT $2
	`

	rows, err := db.DB.Query(query, tmdbID, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch reviews"})
		return
	}
	defer rows.Close()

	var reviews []ReviewItem
	for rows.Next() {
		var review ReviewItem
		var userID *string
		var displayName *string
		var avatarURL *string

		err := rows.Scan(
			&review.ID, &review.UserID, &review.TmdbID, &review.MediaType, &review.Content, &review.IsSpoiler,
			&review.CreatedAt, &review.UpdatedAt, &review.LikeCount,
			&userID, &displayName, &avatarURL,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan reviews"})
			return
		}

		if userID != nil {
			review.User = &Profile{
				UserID:      *userID,
				DisplayName: displayName,
				AvatarURL:   avatarURL,
			}
		}

		reviews = append(reviews, review)
	}

	c.JSON(http.StatusOK, reviews)
}

func UpsertReview(c *gin.Context) {
	userID := c.GetString("userID")

	var body struct {
		TmdbID    int     `json:"tmdb_id" binding:"required"`
		Content   string  `json:"content" binding:"required"`
		IsSpoiler *bool   `json:"is_spoiler"`
	}

	if err := c.BindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	isSpoiler := false
	if body.IsSpoiler != nil {
		isSpoiler = *body.IsSpoiler
	}

	query := `
	INSERT INTO reviews (user_id, tmdb_id, content, is_spoiler)
	VALUES ($1, $2, $3, $4)
	ON CONFLICT (user_id, tmdb_id) DO UPDATE SET
		content = $3,
		is_spoiler = $4,
		updated_at = NOW()
	RETURNING id, user_id, tmdb_id, content, is_spoiler, created_at, updated_at
	`

	var review ReviewItem
	err := db.DB.QueryRow(query, userID, body.TmdbID, body.Content, isSpoiler).
		Scan(&review.ID, &review.UserID, &review.TmdbID, &review.Content, &review.IsSpoiler, &review.CreatedAt, &review.UpdatedAt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save review"})
		return
	}

	c.JSON(http.StatusOK, review)
}

func UpdateReviewAPI(c *gin.Context) {
	userID := c.GetString("userID")
	reviewID := c.Param("id")

	var body struct {
		Content   *string `json:"content"`
		IsSpoiler *bool   `json:"is_spoiler"`
	}

	if err := c.BindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	query := `
	UPDATE reviews
	SET content = COALESCE($3, content),
		is_spoiler = COALESCE($4, is_spoiler),
		updated_at = NOW()
	WHERE id = $1 AND user_id = $2
	RETURNING id, user_id, tmdb_id, content, is_spoiler, created_at, updated_at
	`

	var review ReviewItem
	err := db.DB.QueryRow(query, reviewID, userID, body.Content, body.IsSpoiler).
		Scan(&review.ID, &review.UserID, &review.TmdbID, &review.Content, &review.IsSpoiler, &review.CreatedAt, &review.UpdatedAt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update review"})
		return
	}

	c.JSON(http.StatusOK, review)
}

func DeleteReviewAPI(c *gin.Context) {
	userID := c.GetString("userID")
	reviewID := c.Param("id")

	query := `DELETE FROM reviews WHERE id = $1 AND user_id = $2`

	result, err := db.DB.Exec(query, reviewID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete review"})
		return
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Review not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

func LikeReview(c *gin.Context) {
	userID := c.GetString("userID")
	reviewID := c.Param("id")

	query := `
	INSERT INTO review_likes (review_id, user_id)
	VALUES ($1, $2)
	ON CONFLICT DO NOTHING
	`

	_, err := db.DB.Exec(query, reviewID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to like review"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

func UnlikeReview(c *gin.Context) {
	userID := c.GetString("userID")
	reviewID := c.Param("id")

	query := `DELETE FROM review_likes WHERE review_id = $1 AND user_id = $2`

	_, err := db.DB.Exec(query, reviewID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unlike review"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}
