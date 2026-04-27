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

	v1 := r.Group("/v1")
	v1.Use(middleware.Auth())
	{
		v1.GET("/me", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"user_id": c.GetString("userID")})
		})
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	r.Run(":" + port)
}
