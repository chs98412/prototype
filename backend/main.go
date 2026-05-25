package main

import (
	"log"
	"os"
	"strings"

	"github.com/chs98412/prototype/backend/handler"
	"github.com/chs98412/prototype/backend/infrastructure/repository"
	"github.com/chs98412/prototype/backend/middleware"
	"github.com/chs98412/prototype/backend/pkg/supabase"
	"github.com/chs98412/prototype/backend/service"
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

	allowOrigins := []string{
		"http://localhost:3000",
		"https://prototype-eta-ruby.vercel.app",
	}
	if o := os.Getenv("ALLOWED_ORIGINS"); o != "" {
		allowOrigins = append(allowOrigins, strings.Split(o, ",")...)
	}

	r.Use(cors.New(cors.Config{
		AllowOrigins:     allowOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	// Dependency Injection
	db := supabase.NewClient()

	profileRepo := repository.NewProfileRepository(db)
	profileService := service.NewProfileService(profileRepo)
	profileHandler := handler.NewProfileHandler(profileService)

	authService := service.NewAuthService()
	authHandler := handler.NewAuthHandler(authService, profileService)

	recordRepo := repository.NewRecordRepository(db)
	recordService := service.NewRecordService(recordRepo)
	recordHandler := handler.NewRecordHandler(recordService)

	reviewRepo := repository.NewReviewRepository(db)
	reviewService := service.NewReviewService(reviewRepo)
	reviewHandler := handler.NewReviewHandler(reviewService)

	followRepo := repository.NewFollowRepository(db)
	followService := service.NewFollowService(followRepo)
	followHandler := handler.NewFollowHandler(followService)

	challengeRepo := repository.NewChallengeRepository(db)
	challengeService := service.NewChallengeService(challengeRepo)
	challengeHandler := handler.NewChallengeHandler(challengeService)

	goalRepo := repository.NewGoalRepository(db)
	goalService := service.NewGoalService(goalRepo)
	goalHandler := handler.NewGoalHandler(goalService)

	reviewLikeRepo := repository.NewReviewLikeRepository(db)
	reviewLikeService := service.NewReviewLikeService(reviewLikeRepo)
	reviewLikeHandler := handler.NewReviewLikeHandler(reviewLikeService)

	trackRatingRepo := repository.NewTrackRatingRepository(db)
	trackRatingService := service.NewTrackRatingService(trackRatingRepo)
	trackRatingHandler := handler.NewTrackRatingHandler(trackRatingService)

	albumReviewRepo := repository.NewAlbumReviewRepository(db)
	albumReviewService := service.NewAlbumReviewService(albumReviewRepo)
	albumReviewHandler := handler.NewAlbumReviewHandler(albumReviewService)

	analyticsRepo := repository.NewAnalyticsRepository(db)
	analyticsService := service.NewAnalyticsService(analyticsRepo)
	analyticsHandler := handler.NewAnalyticsHandler(analyticsService)

	streakRepo := repository.NewStreakRepository(db)
	streakService := service.NewStreakService(streakRepo)
	streakHandler := handler.NewStreakHandler(streakService)

	feedRepo := repository.NewFeedRepository(db)
	feedService := service.NewFeedService(feedRepo)
	notifRepo := repository.NewNotificationRepository(db)
	notifService := service.NewNotificationService(notifRepo)
	socialHandler := handler.NewSocialHandler(feedService, notifService)

	// Public endpoints
	r.GET("/health", authHandler.Health)
	r.POST("/v1/auth/callback", authHandler.HandleOAuthCallback)
	r.POST("/v1/auth/logout", authHandler.Logout)
	r.POST("/v1/music/search", handler.SearchAlbums)
	r.GET("/v1/music/albums/:id", handler.GetAlbumDetail)

	v1 := r.Group("/v1")
	v1.Use(middleware.Auth())
	{
		// User
		v1.GET("/me", authHandler.GetMe)

		// Profile
		v1.GET("/profile", profileHandler.GetProfile)
		v1.GET("/profile/:userId", profileHandler.GetUserProfile)
		v1.PUT("/profile", profileHandler.UpdateProfile)

		// Records (Watch History)
		v1.GET("/records", recordHandler.GetRecords)
		v1.POST("/records", recordHandler.CreateRecord)
		v1.DELETE("/records/:recordId", recordHandler.DeleteRecord)
		v1.DELETE("/records/tmdb/:tmdbId", recordHandler.DeleteRecordByTMDB)
		v1.GET("/records/stats", recordHandler.GetRecordStats)

		// Reviews
		v1.GET("/reviews", reviewHandler.GetReviews)
		v1.GET("/reviews/:reviewId", reviewHandler.GetReviewByID)
		v1.POST("/reviews", reviewHandler.CreateReview)
		v1.PUT("/reviews/:reviewId", reviewHandler.UpdateReview)
		v1.DELETE("/reviews/:reviewId", reviewHandler.DeleteReview)
		v1.GET("/tmdb/:tmdbId/reviews", reviewHandler.GetReviewsByTMDB)

		// Review Likes
		v1.GET("/reviews/:reviewId/likes", reviewLikeHandler.GetLikes)
		v1.GET("/reviews/:reviewId/like/status", reviewLikeHandler.CheckLike)
		v1.POST("/reviews/:reviewId/like", reviewLikeHandler.Like)
		v1.DELETE("/reviews/:reviewId/like", reviewLikeHandler.Unlike)

		// Social - Follow
		v1.GET("/follows", followHandler.GetFollows)
		v1.GET("/followers", followHandler.GetFollowers)
		v1.POST("/follow/:userId", followHandler.Follow)
		v1.DELETE("/follow/:userId", followHandler.Unfollow)
		v1.GET("/follow/:userId/status", followHandler.IsFollowing)

		// Feed & Notifications
		v1.GET("/feed", socialHandler.GetFeed)
		v1.GET("/notifications", socialHandler.GetNotifications)

		// Goals & Challenges
		v1.GET("/goals", goalHandler.GetGoal)
		v1.PUT("/goals", goalHandler.UpdateGoal)
		v1.GET("/challenges", challengeHandler.GetChallenges)
		v1.GET("/user-challenges", challengeHandler.GetUserChallenges)
		v1.POST("/challenges/:challengeId/start", challengeHandler.StartChallenge)
		v1.DELETE("/challenges/:progressId/abandon", challengeHandler.AbandonChallenge)

		// Analytics
		v1.GET("/heatmap", analyticsHandler.GetHeatmap)
		v1.GET("/genres/ratings", analyticsHandler.GetGenreRatings)
		v1.GET("/taste-match/:userId", analyticsHandler.GetTasteMatch)
		v1.GET("/taste-match/:userId/common", analyticsHandler.GetCommonWorks)

		// Gamification
		v1.POST("/streaks/log", streakHandler.LogStreak)
		v1.POST("/challenges/progress", challengeHandler.UpdateChallengeProgress)

		// 음악 API (인증 필요)
		v1.POST("/music/ratings", trackRatingHandler.RateTrack)
		v1.POST("/music/reviews", albumReviewHandler.SaveReview)
		v1.PUT("/music/reviews/:id", albumReviewHandler.UpdateReview)
		v1.DELETE("/music/reviews/:id", albumReviewHandler.DeleteReview)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	r.Run(":" + port)
}
