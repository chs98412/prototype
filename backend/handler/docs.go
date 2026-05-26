package handler

import (
	"github.com/gin-gonic/gin"
)

// DocsHandler returns API documentation
func DocsHandler(c *gin.Context) {
	c.HTML(200, "docs.html", nil)
}
