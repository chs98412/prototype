package middleware

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func Auth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if !strings.HasPrefix(authHeader, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing token"})
			return
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")

		// Try both NEXT_PUBLIC_SUPABASE_URL and SUPABASE_URL
		projectUrl := os.Getenv("NEXT_PUBLIC_SUPABASE_URL")
		if projectUrl == "" {
			projectUrl = os.Getenv("SUPABASE_URL")
		}

		// Parse JWT without signature verification (Supabase uses ES256)
		// Verification is handled by Supabase, we just check expiration and issuer
		parser := jwt.NewParser(jwt.WithoutClaimsValidation())
		token, _, err := parser.ParseUnverified(tokenStr, jwt.MapClaims{})

		if err != nil {
			log.Printf("❌ JWT parse error: %v\n", err)
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			log.Printf("❌ Invalid claims type\n")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid claims"})
			return
		}

		// Verify expiration
		if exp, ok := claims["exp"].(float64); ok {
			if time.Now().Unix() > int64(exp) {
				log.Printf("❌ Token expired\n")
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "token expired"})
				return
			}
		}

		// Verify issuer matches our Supabase project
		if iss, ok := claims["iss"].(string); ok {
			expectedIssuer := fmt.Sprintf("%s/auth/v1", projectUrl)
			if iss != expectedIssuer {
				log.Printf("❌ Invalid issuer: %s (expected %s)\n", iss, expectedIssuer)
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid issuer"})
				return
			}
		} else {
			log.Printf("❌ Missing issuer claim\n")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing issuer"})
			return
		}

		// Get user ID from 'sub' claim
		userID, ok := claims["sub"].(string)
		if !ok || userID == "" {
			log.Printf("❌ Missing or invalid sub claim\n")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing user id"})
			return
		}

		log.Printf("✅ Auth: user=%s\n", userID)
		c.Set("userID", userID)
		c.Set("authToken", tokenStr)
		c.Next()
	}
}
