package api

import (
	"net/http"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"soranow/internal/database"
	"soranow/internal/services"
)

// SetupRouter creates and configures the Gin router
func SetupRouter(db *database.DB, lb *services.LoadBalancer, cm *services.ConcurrencyManager) *gin.Engine {
	router := gin.New()
	router.Use(gin.Recovery())
	router.Use(CORSMiddleware())

	handler := NewHandler(db, lb, cm)
	adminHandler := NewAdminHandler(db, lb, cm)

	// Create SoraClient for character operations
	soraClient := services.NewSoraClient("", 120, nil)
	characterHandler := NewCharacterHandler(db, soraClient)
	generateHandler := NewGenerateHandler(db)

	// Health check (no auth required)
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
		})
	})

	// Static files
	router.Static("/assets", "./static/dist/assets")
	router.Static("/cache", "./data/cache")
	router.Static("/static/js", "./static/js")
	router.StaticFile("/generate", "./static/generate.html")

	// Serve React SPA for frontend routes
	serveReactApp := func(c *gin.Context) {
		c.File("./static/dist/index.html")
	}

	router.GET("/", serveReactApp)
	router.GET("/login", serveReactApp)
	router.GET("/manage", serveReactApp)

	// API v1 routes (auth required)
	v1 := router.Group("/v1")
	v1.Use(AuthMiddleware(db))
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
			protected.POST("/tokens/:id/test", adminHandler.HandleTestToken)

			// Token batch operations
			protected.POST("/tokens/batch/test-update", adminHandler.HandleBatchTestUpdate)
			protected.POST("/tokens/batch/enable-all", adminHandler.HandleBatchEnableAll)
			protected.POST("/tokens/batch/disable-selected", adminHandler.HandleBatchDisableSelected)
			protected.POST("/tokens/batch/delete-disabled", adminHandler.HandleBatchDeleteDisabled)
			protected.POST("/tokens/batch/delete-selected", adminHandler.HandleBatchDeleteSelected)
			protected.POST("/tokens/batch/update-proxy", adminHandler.HandleBatchUpdateProxy)

			// Token import/export
			protected.POST("/tokens/import", adminHandler.HandleImportTokens)

			// Token conversion
			protected.POST("/tokens/st2at", adminHandler.HandleConvertST2AT)
			protected.POST("/tokens/rt2at", adminHandler.HandleConvertRT2AT)

			// System configuration
			protected.GET("/config", adminHandler.HandleGetConfig)
			protected.PUT("/config", adminHandler.HandleUpdateConfig)

			// Statistics
			protected.GET("/stats", adminHandler.HandleGetStats)

			// Token refresh configuration
			protected.GET("/token-refresh/config", adminHandler.HandleGetTokenRefreshConfig)
			protected.PUT("/token-refresh/config", adminHandler.HandleUpdateTokenRefreshConfig)

			// Logs
			protected.GET("/logs", adminHandler.HandleGetLogs)
			protected.DELETE("/logs", adminHandler.HandleClearLogs)

			// Task management
			protected.POST("/tasks/:task_id/cancel", adminHandler.HandleCancelTask)

			// Admin password and API key
			protected.POST("/admin/password", adminHandler.HandleUpdatePassword)
			protected.POST("/admin/apikey", adminHandler.HandleUpdateAPIKey)

			// Proxy test
			protected.POST("/proxy/test", adminHandler.HandleTestProxy)

			// Character management
			protected.GET("/characters", characterHandler.HandleGetCharacters)
			protected.GET("/characters/:id", characterHandler.HandleGetCharacter)
			protected.POST("/characters/upload", characterHandler.HandleUploadCharacterVideo)
			protected.GET("/characters/:id/status", characterHandler.HandleGetCameoStatus)
			protected.GET("/characters/username/check", characterHandler.HandleCheckUsername)
			protected.POST("/characters/finalize", characterHandler.HandleFinalizeCharacter)
			protected.DELETE("/characters/:id", characterHandler.HandleDeleteCharacter)
			protected.GET("/characters/search", characterHandler.HandleSearchCharacters)
			protected.POST("/characters/sync", characterHandler.HandleSyncCharacters)

			// Generation
			protected.POST("/generate/video", generateHandler.HandleGenerateVideo)
			protected.POST("/generate/image", generateHandler.HandleGenerateImage)
			protected.GET("/generate/:id/status", generateHandler.HandleGetGenerationStatus)
		}
	}

	// Catch-all for SPA routing (must be last)
	router.NoRoute(func(c *gin.Context) {
		path := c.Request.URL.Path
		// Check if it's a static file request
		staticPath := filepath.Join("./static/dist", path)
		if _, err := os.Stat(staticPath); err == nil {
			c.File(staticPath)
			return
		}
		// Otherwise serve the React app
		serveReactApp(c)
	})

	return router
}
