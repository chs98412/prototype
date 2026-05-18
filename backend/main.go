package main

import (
	"net/http"
	"os"
	"strings"

	"github.com/chs98412/prototype/backend/handler"
	"github.com/chs98412/prototype/backend/middleware"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	allowOrigins := []string{"http://localhost:3000"}
	if o := os.Getenv("ALLOWED_ORIGINS"); o != "" {
		allowOrigins = append(allowOrigins, strings.Split(o, ",")...)
	}

	r.Use(cors.New(cors.Config{
		AllowOrigins:     allowOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	r.GET("/health", handler.Health)

	r.POST("/v1/music/search", handler.SearchAlbums)
	r.GET("/v1/music/albums/:id", handler.GetAlbumDetail)
	r.GET("/v1/profile/:userId", handler.GetUserProfile)

	v1 := r.Group("/v1")
	v1.Use(middleware.Auth())
	{
		v1.GET("/me", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"user_id": c.GetString("userID")})
		})

		// Profile
		v1.GET("/profile", handler.GetProfile)
		v1.PUT("/profile", handler.UpdateProfile)

		// Records
		v1.GET("/records", handler.GetRecords)
		v1.POST("/records", handler.UpsertRecord)
		v1.DELETE("/records/:id", handler.DeleteRecord)
		v1.DELETE("/records/tmdb/:tmdbId", handler.DeleteRecordByTmdbID)
		v1.GET("/records/stats", handler.GetRecordStats)

		// Social
		v1.GET("/feed", handler.GetFeed)
		v1.GET("/follows", handler.GetFollows)
		v1.GET("/followers", handler.GetFollowers)
		v1.POST("/follow/:userId", handler.Follow)
		v1.DELETE("/follow/:userId", handler.Unfollow)
		v1.GET("/follow/:userId/status", handler.IsFollowing)

		// Streaks & Challenges
		v1.POST("/streaks/log", handler.LogStreak)
		v1.POST("/challenges/progress", handler.UpdateChallengeProgress)

		// Music
		v1.POST("/music/ratings", handler.RateTrack)
		v1.POST("/music/reviews", handler.SaveReview)
		v1.PUT("/music/reviews/:id", handler.UpdateReview)
		v1.DELETE("/music/reviews/:id", handler.DeleteReview)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	r.Run(":" + port)
}
