package main

import (
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/chs98412/prototype/backend/handler"
	"github.com/chs98412/prototype/backend/middleware"
	"github.com/chs98412/prototype/backend/pkg/supabase"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize database connection
	if err := supabase.Init(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer supabase.Close()

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

	v1 := r.Group("/v1")
	v1.Use(middleware.Auth())
	{
		// User
		v1.GET("/me", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"user_id": c.GetString("userID")})
		})

		// Profile
		v1.GET("/profile", handler.GetProfile)
		v1.GET("/profile/:userId", handler.GetUserProfile)
		v1.PUT("/profile", handler.UpdateProfile)

		// Records (Watch History)
		v1.GET("/records", handler.GetRecords)
		v1.POST("/records", handler.CreateRecord)
		v1.DELETE("/records/:recordId", handler.DeleteRecord)
		v1.DELETE("/records/tmdb/:tmdbId", handler.DeleteRecordByTMDB)
		v1.GET("/records/stats", handler.GetRecordStats)

		// Reviews
		v1.GET("/reviews", handler.GetReviews)
		v1.GET("/reviews/:reviewId", handler.GetReviewByID)
		v1.POST("/reviews", handler.CreateReview)
		v1.PUT("/reviews/:reviewId", handler.UpdateReview)
		v1.DELETE("/reviews/:reviewId", handler.DeleteReview)
		v1.GET("/tmdb/:tmdbId/reviews", handler.GetReviewsByTMDB)

		// Review Likes
		v1.GET("/reviews/:reviewId/likes", handler.GetReviewLikes)
		v1.GET("/reviews/:reviewId/like/status", handler.CheckReviewLike)
		v1.POST("/reviews/:reviewId/like", handler.LikeReview)
		v1.DELETE("/reviews/:reviewId/like", handler.UnlikeReview)

		// Social
		v1.GET("/follows", handler.GetFollows)
		v1.GET("/followers", handler.GetFollowers)
		v1.POST("/follow/:userId", handler.Follow)
		v1.DELETE("/follow/:userId", handler.Unfollow)
		v1.GET("/follow/:userId/status", handler.IsFollowing)

		// Feed & Notifications
		v1.GET("/feed", handler.GetFeed)
		v1.GET("/notifications", handler.GetNotifications)

		// Goals & Challenges
		v1.GET("/goals", handler.GetGoal)
		v1.PUT("/goals", handler.UpdateGoal)
		v1.GET("/challenges", handler.GetChallenges)
		v1.GET("/user-challenges", handler.GetUserChallenges)
		v1.POST("/challenges/:challengeId/start", handler.StartChallenge)
		v1.DELETE("/challenges/:progressId/abandon", handler.AbandonChallenge)

		// Analytics
		v1.GET("/heatmap", handler.GetHeatmap)
		v1.GET("/genres/ratings", handler.GetGenreRatings)
		v1.GET("/taste-match/:userId", handler.GetTasteMatch)

		// Gamification
		v1.POST("/streaks/log", handler.LogStreak)
		v1.POST("/challenges/progress", handler.UpdateChallengeProgress)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	r.Run(":" + port)
}
