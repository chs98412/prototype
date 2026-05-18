package handler

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/chs98412/prototype/backend/db"
)

type FeedItem struct {
	TmdbID      int    `json:"tmdb_id"`
	MediaType   string `json:"media_type"`
	Status      string `json:"status"`
	Rating      *int   `json:"rating"`
	Title       *string `json:"title"`
	PosterPath  *string `json:"poster_path"`
	UpdatedAt   string `json:"updated_at"`
	FriendID    string `json:"friend_id"`
	DisplayName *string `json:"display_name"`
	AvatarURL   *string `json:"avatar_url"`
}

type Profile struct {
	UserID      string `json:"user_id"`
	DisplayName *string `json:"display_name"`
	Bio         *string `json:"bio"`
	AvatarURL   *string `json:"avatar_url"`
	CreatedAt   string `json:"created_at"`
}

func GetFeed(c *gin.Context) {
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
	SELECT
		r.tmdb_id,
		r.media_type,
		r.status,
		r.rating,
		r.title,
		r.poster_path,
		r.updated_at,
		r.user_id as friend_id,
		p.display_name,
		p.avatar_url
	FROM user_records r
	JOIN user_follows f ON f.following_id = r.user_id
	LEFT JOIN user_profiles p ON p.user_id = r.user_id
	WHERE f.user_id = $1
	ORDER BY r.updated_at DESC
	LIMIT $2 OFFSET $3
	`

	rows, err := db.DB.Query(query, userID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch feed"})
		return
	}
	defer rows.Close()

	var items []FeedItem
	for rows.Next() {
		var item FeedItem
		err := rows.Scan(
			&item.TmdbID,
			&item.MediaType,
			&item.Status,
			&item.Rating,
			&item.Title,
			&item.PosterPath,
			&item.UpdatedAt,
			&item.FriendID,
			&item.DisplayName,
			&item.AvatarURL,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan feed item"})
			return
		}
		items = append(items, item)
	}

	c.JSON(http.StatusOK, items)
}

func Follow(c *gin.Context) {
	userID := c.GetString("userID")
	followingID := c.Param("userId")

	if followingID == userID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot follow yourself"})
		return
	}

	query := `
	INSERT INTO user_follows (user_id, following_id)
	VALUES ($1, $2)
	ON CONFLICT DO NOTHING
	`

	_, err := db.DB.Exec(query, userID, followingID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to follow user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

func Unfollow(c *gin.Context) {
	userID := c.GetString("userID")
	followingID := c.Param("userId")

	query := `DELETE FROM user_follows WHERE user_id = $1 AND following_id = $2`

	_, err := db.DB.Exec(query, userID, followingID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unfollow user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

func IsFollowing(c *gin.Context) {
	userID := c.GetString("userID")
	targetUserID := c.Param("userId")

	query := `SELECT COUNT(*) FROM user_follows WHERE user_id = $1 AND following_id = $2`

	var count int
	err := db.DB.QueryRow(query, userID, targetUserID).Scan(&count)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check follow status"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"following": count > 0})
}

func GetFollows(c *gin.Context) {
	userID := c.GetString("userID")
	limit := 50

	if l := c.Query("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil {
			limit = parsed
		}
	}

	query := `
	SELECT p.user_id, p.display_name, p.bio, p.avatar_url, p.created_at
	FROM user_profiles p
	JOIN user_follows f ON f.following_id = p.user_id
	WHERE f.user_id = $1
	LIMIT $2
	`

	rows, err := db.DB.Query(query, userID, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch follows"})
		return
	}
	defer rows.Close()

	var profiles []Profile
	for rows.Next() {
		var p Profile
		err := rows.Scan(&p.UserID, &p.DisplayName, &p.Bio, &p.AvatarURL, &p.CreatedAt)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan profile"})
			return
		}
		profiles = append(profiles, p)
	}

	c.JSON(http.StatusOK, profiles)
}

func GetFollowers(c *gin.Context) {
	userID := c.GetString("userID")
	limit := 50

	if l := c.Query("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil {
			limit = parsed
		}
	}

	query := `
	SELECT p.user_id, p.display_name, p.bio, p.avatar_url, p.created_at
	FROM user_profiles p
	JOIN user_follows f ON f.user_id = p.user_id
	WHERE f.following_id = $1
	LIMIT $2
	`

	rows, err := db.DB.Query(query, userID, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch followers"})
		return
	}
	defer rows.Close()

	var profiles []Profile
	for rows.Next() {
		var p Profile
		err := rows.Scan(&p.UserID, &p.DisplayName, &p.Bio, &p.AvatarURL, &p.CreatedAt)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan profile"})
			return
		}
		profiles = append(profiles, p)
	}

	c.JSON(http.StatusOK, profiles)
}

func GetProfile(c *gin.Context) {
	userID := c.GetString("userID")

	query := `
	SELECT user_id, display_name, bio, avatar_url, created_at
	FROM user_profiles
	WHERE user_id = $1
	`

	var p Profile
	err := db.DB.QueryRow(query, userID).Scan(&p.UserID, &p.DisplayName, &p.Bio, &p.AvatarURL, &p.CreatedAt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch profile"})
		return
	}

	c.JSON(http.StatusOK, p)
}

func GetUserProfile(c *gin.Context) {
	userID := c.Param("userId")

	query := `
	SELECT user_id, display_name, bio, avatar_url, created_at
	FROM user_profiles
	WHERE user_id = $1
	`

	var p Profile
	err := db.DB.QueryRow(query, userID).Scan(&p.UserID, &p.DisplayName, &p.Bio, &p.AvatarURL, &p.CreatedAt)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Profile not found"})
		return
	}

	c.JSON(http.StatusOK, p)
}

func UpdateProfile(c *gin.Context) {
	userID := c.GetString("userID")

	var body struct {
		DisplayName *string `json:"display_name"`
		Bio         *string `json:"bio"`
		AvatarURL   *string `json:"avatar_url"`
	}

	if err := c.BindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	query := `
	UPDATE user_profiles
	SET display_name = COALESCE($2, display_name),
		bio = COALESCE($3, bio),
		avatar_url = COALESCE($4, avatar_url)
	WHERE user_id = $1
	RETURNING user_id, display_name, bio, avatar_url, created_at
	`

	var p Profile
	err := db.DB.QueryRow(query, userID, body.DisplayName, body.Bio, body.AvatarURL).
		Scan(&p.UserID, &p.DisplayName, &p.Bio, &p.AvatarURL, &p.CreatedAt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}

	c.JSON(http.StatusOK, p)
}
