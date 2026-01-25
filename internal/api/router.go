package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"sora2api-go/internal/database"
	"sora2api-go/internal/services"
)

// SetupRouter creates and configures the Gin router
func SetupRouter(apiKey string, db *database.DB, lb *services.LoadBalancer, cm *services.ConcurrencyManager) *gin.Engine {
	router := gin.New()
	router.Use(gin.Recovery())
	router.Use(CORSMiddleware())

	handler := NewHandler(db, lb, cm)
	adminHandler := NewAdminHandler(db, lb, cm)

	// Health check (no auth required)
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
		})
	})

	// Static files for admin UI
	router.Static("/static", "./static")
	router.Static("/cache", "./data/cache")
	router.StaticFile("/", "./static/login.html")
	router.StaticFile("/login", "./static/login.html")
	router.StaticFile("/manage", "./static/manage.html")
	router.StaticFile("/generate", "./static/generate.html")

	// API v1 routes (auth required)
	v1 := router.Group("/v1")
	v1.Use(AuthMiddleware(apiKey))
	{
		v1.GET("/models", handler.HandleModels)
		v1.POST("/chat/completions", handler.HandleChatCompletions)
	}

	// Admin API routes
	api := router.Group("/api")
	{
		// Login (no auth required)
		api.POST("/login", adminHandler.HandleLogin)

		// Protected admin routes
		protected := api.Group("")
		protected.Use(AdminAuthMiddleware(db))
		{
			// Token management
			protected.GET("/tokens", adminHandler.HandleGetTokens)
			protected.POST("/tokens", adminHandler.HandleAddToken)
			protected.PUT("/tokens/:id", adminHandler.HandleUpdateToken)
			protected.DELETE("/tokens/:id", adminHandler.HandleDeleteToken)

			// System configuration
			protected.GET("/config", adminHandler.HandleGetConfig)
			protected.PUT("/config", adminHandler.HandleUpdateConfig)
		}
	}

	return router
}
