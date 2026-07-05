package middleware

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
)

const slowRequestThreshold = 200 * time.Millisecond

// RequestLogger logs API request/response times, warning on slow requests
func RequestLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		startTime := time.Now()

		c.Next()

		duration := time.Since(startTime)
		statusCode := c.Writer.Status()
		method := c.Request.Method
		path := c.Request.URL.Path

		if duration >= slowRequestThreshold {
			log.Printf("[SLOW] %s %s - %d (%dms) ⚠️", method, path, statusCode, duration.Milliseconds())
		} else {
			log.Printf("[API] %s %s - %d (%dms)", method, path, statusCode, duration.Milliseconds())
		}
	}
}
