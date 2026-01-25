package api

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"sora2api-go/internal/database"
	"sora2api-go/internal/models"
	"sora2api-go/internal/services"
)

// AdminHandler handles admin API endpoints
type AdminHandler struct {
	db           *database.DB
	loadBalancer *services.LoadBalancer
	concurrency  *services.ConcurrencyManager
}

// NewAdminHandler creates a new AdminHandler
func NewAdminHandler(db *database.DB, lb *services.LoadBalancer, cm *services.ConcurrencyManager) *AdminHandler {
	return &AdminHandler{
		db:           db,
		loadBalancer: lb,
		concurrency:  cm,
	}
}

// LoginRequest represents login request body
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password"`
}

// AddTokenRequest represents add token request body
type AddTokenRequest struct {
	Token string `json:"token" binding:"required"`
	Email string `json:"email" binding:"required"`
	Name  string `json:"name"`
}

// UpdateTokenRequest represents update token request body
type UpdateTokenRequest struct {
	IsActive         *bool `json:"is_active"`
	ImageEnabled     *bool `json:"image_enabled"`
	VideoEnabled     *bool `json:"video_enabled"`
	ImageConcurrency *int  `json:"image_concurrency"`
	VideoConcurrency *int  `json:"video_concurrency"`
}

// UpdateConfigRequest represents update config request body
type UpdateConfigRequest struct {
	APIKey               *string `json:"api_key"`
	AdminUsername        *string `json:"admin_username"`
	AdminPassword        *string `json:"admin_password"`
	ProxyEnabled         *bool   `json:"proxy_enabled"`
	ProxyURL             *string `json:"proxy_url"`
	CacheEnabled         *bool   `json:"cache_enabled"`
	CacheTimeout         *int    `json:"cache_timeout"`
	CacheBaseURL         *string `json:"cache_base_url"`
	ImageTimeout         *int    `json:"image_timeout"`
	VideoTimeout         *int    `json:"video_timeout"`
	ErrorBanThreshold    *int    `json:"error_ban_threshold"`
	TaskRetryEnabled     *bool   `json:"task_retry_enabled"`
	TaskMaxRetries       *int    `json:"task_max_retries"`
	AutoDisable401       *bool   `json:"auto_disable_401"`
	WatermarkFreeEnabled *bool   `json:"watermark_free_enabled"`
	WatermarkParseMethod *string `json:"watermark_parse_method"`
	WatermarkFallback    *bool   `json:"watermark_fallback"`
	CallMode             *string `json:"call_mode"`
}

// HandleLogin handles admin login
func (h *AdminHandler) HandleLogin(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	cfg, err := h.db.GetSystemConfig()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get config"})
		return
	}

	// Check credentials
	if req.Username != cfg.AdminUsername {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Check password (empty password hash means empty password is valid)
	if cfg.AdminPasswordHash != "" && req.Password != cfg.AdminPasswordHash {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}
	if cfg.AdminPasswordHash == "" && req.Password != "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token":    cfg.APIKey,
		"username": cfg.AdminUsername,
	})
}

// HandleGetTokens returns all tokens
func (h *AdminHandler) HandleGetTokens(c *gin.Context) {
	tokens, err := h.db.GetAllTokens()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get tokens"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"tokens": tokens})
}

// HandleAddToken adds a new token
func (h *AdminHandler) HandleAddToken(c *gin.Context) {
	var req AddTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	token := &models.Token{
		Token:            req.Token,
		Email:            req.Email,
		Name:             req.Name,
		IsActive:         true,
		ImageEnabled:     true,
		VideoEnabled:     true,
		ImageConcurrency: -1,
		VideoConcurrency: -1,
	}

	id, err := h.db.CreateToken(token)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create token: " + err.Error()})
		return
	}

	token.ID = id

	// Refresh load balancer
	h.refreshLoadBalancer()

	c.JSON(http.StatusOK, gin.H{"token": token})
}

// HandleDeleteToken deletes a token
func (h *AdminHandler) HandleDeleteToken(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid token ID"})
		return
	}

	if err := h.db.DeleteToken(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete token"})
		return
	}

	// Refresh load balancer
	h.refreshLoadBalancer()

	c.JSON(http.StatusOK, gin.H{"message": "Token deleted"})
}

// HandleUpdateToken updates a token
func (h *AdminHandler) HandleUpdateToken(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid token ID"})
		return
	}

	token, err := h.db.GetTokenByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Token not found"})
		return
	}

	var req UpdateTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Update fields if provided
	if req.IsActive != nil {
		token.IsActive = *req.IsActive
	}
	if req.ImageEnabled != nil {
		token.ImageEnabled = *req.ImageEnabled
	}
	if req.VideoEnabled != nil {
		token.VideoEnabled = *req.VideoEnabled
	}
	if req.ImageConcurrency != nil {
		token.ImageConcurrency = *req.ImageConcurrency
	}
	if req.VideoConcurrency != nil {
		token.VideoConcurrency = *req.VideoConcurrency
	}

	if err := h.db.UpdateToken(token); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update token"})
		return
	}

	// Refresh load balancer
	h.refreshLoadBalancer()

	c.JSON(http.StatusOK, gin.H{"token": token})
}

// HandleGetConfig returns system configuration
func (h *AdminHandler) HandleGetConfig(c *gin.Context) {
	cfg, err := h.db.GetSystemConfig()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get config"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"api_key":                cfg.APIKey,
		"admin_username":         cfg.AdminUsername,
		"proxy_enabled":          cfg.ProxyEnabled,
		"proxy_url":              cfg.ProxyURL,
		"cache_enabled":          cfg.CacheEnabled,
		"cache_timeout":          cfg.CacheTimeout,
		"cache_base_url":         cfg.CacheBaseURL,
		"image_timeout":          cfg.ImageTimeout,
		"video_timeout":          cfg.VideoTimeout,
		"error_ban_threshold":    cfg.ErrorBanThreshold,
		"task_retry_enabled":     cfg.TaskRetryEnabled,
		"task_max_retries":       cfg.TaskMaxRetries,
		"auto_disable_401":       cfg.AutoDisable401,
		"watermark_free_enabled": cfg.WatermarkFreeEnabled,
		"watermark_parse_method": cfg.WatermarkParseMethod,
		"watermark_fallback":     cfg.WatermarkFallback,
		"call_mode":              cfg.CallMode,
	})
}

// HandleUpdateConfig updates system configuration
func (h *AdminHandler) HandleUpdateConfig(c *gin.Context) {
	cfg, err := h.db.GetSystemConfig()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get config"})
		return
	}

	var req UpdateConfigRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Update fields if provided
	if req.APIKey != nil {
		cfg.APIKey = *req.APIKey
	}
	if req.AdminUsername != nil {
		cfg.AdminUsername = *req.AdminUsername
	}
	if req.AdminPassword != nil {
		cfg.AdminPasswordHash = *req.AdminPassword // TODO: hash password
	}
	if req.ProxyEnabled != nil {
		cfg.ProxyEnabled = *req.ProxyEnabled
	}
	if req.ProxyURL != nil {
		cfg.ProxyURL = *req.ProxyURL
	}
	if req.CacheEnabled != nil {
		cfg.CacheEnabled = *req.CacheEnabled
	}
	if req.CacheTimeout != nil {
		cfg.CacheTimeout = *req.CacheTimeout
	}
	if req.CacheBaseURL != nil {
		cfg.CacheBaseURL = *req.CacheBaseURL
	}
	if req.ImageTimeout != nil {
		cfg.ImageTimeout = *req.ImageTimeout
	}
	if req.VideoTimeout != nil {
		cfg.VideoTimeout = *req.VideoTimeout
	}
	if req.ErrorBanThreshold != nil {
		cfg.ErrorBanThreshold = *req.ErrorBanThreshold
	}
	if req.TaskRetryEnabled != nil {
		cfg.TaskRetryEnabled = *req.TaskRetryEnabled
	}
	if req.TaskMaxRetries != nil {
		cfg.TaskMaxRetries = *req.TaskMaxRetries
	}
	if req.AutoDisable401 != nil {
		cfg.AutoDisable401 = *req.AutoDisable401
	}
	if req.WatermarkFreeEnabled != nil {
		cfg.WatermarkFreeEnabled = *req.WatermarkFreeEnabled
	}
	if req.WatermarkParseMethod != nil {
		cfg.WatermarkParseMethod = *req.WatermarkParseMethod
	}
	if req.WatermarkFallback != nil {
		cfg.WatermarkFallback = *req.WatermarkFallback
	}
	if req.CallMode != nil {
		cfg.CallMode = *req.CallMode
	}

	if err := h.db.UpdateSystemConfig(cfg); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update config"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Config updated"})
}

// refreshLoadBalancer refreshes the load balancer with current tokens
func (h *AdminHandler) refreshLoadBalancer() {
	if h.loadBalancer == nil {
		return
	}
	tokens, err := h.db.GetActiveTokens()
	if err != nil {
		return
	}
	h.loadBalancer.SetTokens(tokens)
}

// AdminAuthMiddleware creates middleware for admin API authentication
func AdminAuthMiddleware(db *database.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		auth := c.GetHeader("Authorization")
		if auth == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Missing Authorization header"})
			return
		}

		token := strings.TrimPrefix(auth, "Bearer ")
		if token == auth {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid Authorization format"})
			return
		}

		cfg, err := db.GetSystemConfig()
		if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify token"})
			return
		}

		if token != cfg.APIKey {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			return
		}

		c.Next()
	}
}
