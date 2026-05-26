package handler

import (
	"github.com/gin-gonic/gin"
)

// OpenAPIHandler returns OpenAPI/Swagger specification
func OpenAPIHandler(c *gin.Context) {
	spec := map[string]interface{}{
		"openapi": "3.0.0",
		"info": map[string]interface{}{
			"title":       "BMad API",
			"description": "Music & Movie Rating Platform API",
			"version":     "1.0.0",
			"contact": map[string]interface{}{
				"name": "BMad Team",
			},
		},
		"servers": []map[string]interface{}{
			{
				"url": "/v1",
				"description": "API v1",
			},
		},
		"paths": map[string]interface{}{
			"/me": map[string]interface{}{
				"get": map[string]interface{}{
					"summary":     "Get current user",
					"tags":        []string{"Auth"},
					"security":    []map[string][]string{{"Bearer": {}}},
					"responses": map[string]interface{}{
						"200": map[string]interface{}{
							"description": "Current user",
						},
					},
				},
			},
			"/profile": map[string]interface{}{
				"get": map[string]interface{}{
					"summary":  "Get user profile",
					"tags":     []string{"Profile"},
					"security": []map[string][]string{{"Bearer": {}}},
					"responses": map[string]interface{}{
						"200": map[string]interface{}{
							"description": "User profile",
						},
					},
				},
				"put": map[string]interface{}{
					"summary":  "Update user profile",
					"tags":     []string{"Profile"},
					"security": []map[string][]string{{"Bearer": {}}},
					"responses": map[string]interface{}{
						"200": map[string]interface{}{
							"description": "Updated profile",
						},
					},
				},
			},
			"/profile/{userId}": map[string]interface{}{
				"get": map[string]interface{}{
					"summary": "Get user profile by ID",
					"tags":    []string{"Profile"},
					"parameters": []map[string]interface{}{
						{
							"name":     "userId",
							"in":       "path",
							"required": true,
							"schema": map[string]interface{}{
								"type": "string",
							},
						},
					},
					"responses": map[string]interface{}{
						"200": map[string]interface{}{
							"description": "User profile",
						},
					},
				},
			},
			"/records": map[string]interface{}{
				"get": map[string]interface{}{
					"summary":  "Get watch records",
					"tags":     []string{"Records"},
					"security": []map[string][]string{{"Bearer": {}}},
					"responses": map[string]interface{}{
						"200": map[string]interface{}{
							"description": "Watch records",
						},
					},
				},
				"post": map[string]interface{}{
					"summary":  "Create watch record",
					"tags":     []string{"Records"},
					"security": []map[string][]string{{"Bearer": {}}},
					"responses": map[string]interface{}{
						"201": map[string]interface{}{
							"description": "Record created",
						},
					},
				},
			},
			"/reviews": map[string]interface{}{
				"get": map[string]interface{}{
					"summary":  "Get reviews",
					"tags":     []string{"Reviews"},
					"security": []map[string][]string{{"Bearer": {}}},
					"responses": map[string]interface{}{
						"200": map[string]interface{}{
							"description": "Reviews list",
						},
					},
				},
				"post": map[string]interface{}{
					"summary":  "Create review",
					"tags":     []string{"Reviews"},
					"security": []map[string][]string{{"Bearer": {}}},
					"responses": map[string]interface{}{
						"201": map[string]interface{}{
							"description": "Review created",
						},
					},
				},
			},
			"/follow/{userId}": map[string]interface{}{
				"post": map[string]interface{}{
					"summary":  "Follow user",
					"tags":     []string{"Social"},
					"security": []map[string][]string{{"Bearer": {}}},
					"parameters": []map[string]interface{}{
						{
							"name":     "userId",
							"in":       "path",
							"required": true,
							"schema": map[string]interface{}{
								"type": "string",
							},
						},
					},
					"responses": map[string]interface{}{
						"200": map[string]interface{}{
							"description": "User followed",
						},
					},
				},
			},
			"/feed": map[string]interface{}{
				"get": map[string]interface{}{
					"summary":  "Get friend feed",
					"tags":     []string{"Feed"},
					"security": []map[string][]string{{"Bearer": {}}},
					"responses": map[string]interface{}{
						"200": map[string]interface{}{
							"description": "Friend feed",
						},
					},
				},
			},
			"/streaks/log": map[string]interface{}{
				"post": map[string]interface{}{
					"summary":  "Log streak",
					"tags":     []string{"Gamification"},
					"security": []map[string][]string{{"Bearer": {}}},
					"responses": map[string]interface{}{
						"200": map[string]interface{}{
							"description": "Streak logged",
						},
					},
				},
			},
			"/challenges": map[string]interface{}{
				"get": map[string]interface{}{
					"summary":  "Get challenges",
					"tags":     []string{"Gamification"},
					"security": []map[string][]string{{"Bearer": {}}},
					"responses": map[string]interface{}{
						"200": map[string]interface{}{
							"description": "Challenges list",
						},
					},
				},
			},
		},
		"components": map[string]interface{}{
			"securitySchemes": map[string]interface{}{
				"Bearer": map[string]interface{}{
					"type":   "http",
					"scheme": "bearer",
					"bearerFormat": "JWT",
				},
			},
		},
	}
	c.JSON(200, spec)
}
