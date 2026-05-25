package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/chs98412/prototype/backend/db"
)

type Notification struct {
	ID        string `json:"id"`
	UserID    string `json:"user_id"`
	Type      string `json:"type"`
	Content   string `json:"content"`
	IsRead    bool   `json:"is_read"`
	CreatedAt string `json:"created_at"`
}

func GetNotifications(c *gin.Context) {
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
	SELECT id, user_id, type, content, is_read, created_at
	FROM notifications
	WHERE user_id = $1
	ORDER BY created_at DESC
	LIMIT $2 OFFSET $3
	`

	rows, err := db.DB.Query(query, userID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch notifications"})
		return
	}
	defer rows.Close()

	var notifications []Notification
	for rows.Next() {
		var n Notification
		if err := rows.Scan(&n.ID, &n.UserID, &n.Type, &n.Content, &n.IsRead, &n.CreatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan notifications"})
			return
		}
		notifications = append(notifications, n)
	}

	c.JSON(http.StatusOK, notifications)
}

func DeleteNotification(c *gin.Context) {
	userID := c.GetString("userID")
	notificationID := c.Param("id")

	query := `DELETE FROM notifications WHERE id = $1 AND user_id = $2`
	result, err := db.DB.Exec(query, notificationID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete notification"})
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil || rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Notification not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}
