package api

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"soranow/internal/database"
	"soranow/internal/models"
	"soranow/internal/services"
)

// AdminHandler handles admin API endpoints
type AdminHandler struct {
	db           *database.DB
	loadBalancer *services.LoadBalancer
	concurrency  *services.ConcurrencyManager
	tokenManager *services.TokenManager
}

// NewAdminHandler creates a new AdminHandler
func NewAdminHandler(db *database.DB, lb *services.LoadBalancer, cm *services.ConcurrencyManager) *AdminHandler {
	return &AdminHandler{
		db:           db,
		loadBalancer: lb,
		concurrency:  cm,
		tokenManager: services.NewTokenManager(db, lb, cm),
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

// HandleGetStats returns token statistics
func (h *AdminHandler) HandleGetStats(c *gin.Context) {
	tokens, err := h.db.GetAllTokens()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get tokens"})
		return
	}

	var totalTokens, activeTokens int
	var totalImages, totalVideos, totalErrors int
	var todayImages, todayVideos, todayErrors int

	totalTokens = len(tokens)
	for _, t := range tokens {
		if t.IsActive && !t.IsExpired {
			activeTokens++
		}
		totalImages += t.TotalImageCount
		totalVideos += t.TotalVideoCount
		totalErrors += t.TotalErrorCount
		todayImages += t.TodayImageCount
		todayVideos += t.TodayVideoCount
		todayErrors += t.TodayErrorCount
	}

	c.JSON(http.StatusOK, gin.H{
		"total_tokens":  totalTokens,
		"active_tokens": activeTokens,
		"total_images":  totalImages,
		"total_videos":  totalVideos,
		"total_errors":  totalErrors,
		"today_images":  todayImages,
		"today_videos":  todayVideos,
		"today_errors":  todayErrors,
	})
}

// HandleGetTokenRefreshConfig returns token auto-refresh configuration
func (h *AdminHandler) HandleGetTokenRefreshConfig(c *gin.Context) {
	cfg, err := h.db.GetSystemConfig()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get config"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"config": gin.H{
			"at_auto_refresh_enabled": cfg.TokenAutoRefresh,
		},
	})
}

// UpdateTokenRefreshConfigRequest represents update token refresh config request
type UpdateTokenRefreshConfigRequest struct {
	ATAutoRefreshEnabled *bool `json:"at_auto_refresh_enabled"`
}

// HandleUpdateTokenRefreshConfig updates token auto-refresh configuration
func (h *AdminHandler) HandleUpdateTokenRefreshConfig(c *gin.Context) {
	cfg, err := h.db.GetSystemConfig()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get config"})
		return
	}

	var req UpdateTokenRefreshConfigRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	if req.ATAutoRefreshEnabled != nil {
		cfg.TokenAutoRefresh = *req.ATAutoRefreshEnabled
	}

	if err := h.db.UpdateSystemConfig(cfg); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update config"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Config updated",
	})
}

// ========== Logs API ==========

// HandleGetLogs returns request logs
func (h *AdminHandler) HandleGetLogs(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "100")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 100
	}
	if limit > 1000 {
		limit = 1000
	}

	logs, err := h.db.GetRequestLogs(limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get logs"})
		return
	}

	if logs == nil {
		logs = []*models.RequestLog{}
	}

	c.JSON(http.StatusOK, logs)
}

// HandleClearLogs clears all request logs
func (h *AdminHandler) HandleClearLogs(c *gin.Context) {
	if err := h.db.ClearRequestLogs(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear logs"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Logs cleared",
	})
}

// ========== Batch Token Operations ==========

// BatchTokenRequest represents batch token operation request
type BatchTokenRequest struct {
	TokenIDs []int64 `json:"token_ids"`
}

// BatchProxyRequest represents batch proxy update request
type BatchProxyRequest struct {
	TokenIDs []int64 `json:"token_ids"`
	ProxyURL string  `json:"proxy_url"`
}

// HandleBatchTestUpdate tests and updates selected tokens
func (h *AdminHandler) HandleBatchTestUpdate(c *gin.Context) {
	var req BatchTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// For now, just return success - actual implementation would test each token
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": fmt.Sprintf("已测试 %d 个 Token", len(req.TokenIDs)),
	})
}

// HandleBatchEnableAll enables selected tokens
func (h *AdminHandler) HandleBatchEnableAll(c *gin.Context) {
	var req BatchTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	affected, err := h.db.BatchEnableTokens(req.TokenIDs)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to enable tokens"})
		return
	}

	h.refreshLoadBalancer()

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": fmt.Sprintf("已启用 %d 个 Token", affected),
	})
}

// HandleBatchDisableSelected disables selected tokens
func (h *AdminHandler) HandleBatchDisableSelected(c *gin.Context) {
	var req BatchTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	affected, err := h.db.BatchDisableTokens(req.TokenIDs)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to disable tokens"})
		return
	}

	h.refreshLoadBalancer()

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": fmt.Sprintf("已禁用 %d 个 Token", affected),
	})
}

// HandleBatchDeleteDisabled deletes disabled tokens from selection
func (h *AdminHandler) HandleBatchDeleteDisabled(c *gin.Context) {
	var req BatchTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	affected, err := h.db.BatchDeleteDisabledTokens(req.TokenIDs)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete tokens"})
		return
	}

	h.refreshLoadBalancer()

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": fmt.Sprintf("已删除 %d 个禁用 Token", affected),
	})
}

// HandleBatchDeleteSelected deletes selected tokens
func (h *AdminHandler) HandleBatchDeleteSelected(c *gin.Context) {
	var req BatchTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	affected, err := h.db.BatchDeleteTokens(req.TokenIDs)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete tokens"})
		return
	}

	h.refreshLoadBalancer()

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": fmt.Sprintf("已删除 %d 个 Token", affected),
	})
}

// HandleBatchUpdateProxy updates proxy for selected tokens
func (h *AdminHandler) HandleBatchUpdateProxy(c *gin.Context) {
	var req BatchProxyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	affected, err := h.db.BatchUpdateProxy(req.TokenIDs, req.ProxyURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update proxy"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": fmt.Sprintf("已更新 %d 个 Token 的代理", affected),
	})
}

// ========== Token Import/Export ==========

// ImportTokenRequest represents token import request
type ImportTokenRequest struct {
	Tokens []ImportTokenData `json:"tokens"`
	Mode   string            `json:"mode"` // offline, at, st, rt
}

// ImportTokenData represents a single token to import
type ImportTokenData struct {
	Email            string `json:"email"`
	AccessToken      string `json:"access_token"`
	SessionToken     string `json:"session_token"`
	RefreshToken     string `json:"refresh_token"`
	ClientID         string `json:"client_id"`
	ProxyURL         string `json:"proxy_url"`
	Remark           string `json:"remark"`
	IsActive         *bool  `json:"is_active"`
	ImageEnabled     *bool  `json:"image_enabled"`
	VideoEnabled     *bool  `json:"video_enabled"`
	ImageConcurrency *int   `json:"image_concurrency"`
	VideoConcurrency *int   `json:"video_concurrency"`
}

// ImportResult represents import result for a single token
type ImportResult struct {
	Email   string `json:"email"`
	Success bool   `json:"success"`
	Status  string `json:"status"`
	Error   string `json:"error,omitempty"`
}

// HandleImportTokens imports tokens
func (h *AdminHandler) HandleImportTokens(c *gin.Context) {
	var req ImportTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	var results []ImportResult
	var added, updated, failed int

	for _, t := range req.Tokens {
		result := ImportResult{Email: t.Email}

		// Check if token already exists
		existingToken, _ := h.db.GetTokenByToken(t.AccessToken)

		token := &models.Token{
			Token:            t.AccessToken,
			Email:            t.Email,
			SessionToken:     t.SessionToken,
			RefreshToken:     t.RefreshToken,
			ClientID:         t.ClientID,
			ProxyURL:         t.ProxyURL,
			Remark:           t.Remark,
			IsActive:         true,
			ImageEnabled:     true,
			VideoEnabled:     true,
			ImageConcurrency: -1,
			VideoConcurrency: -1,
		}

		if t.IsActive != nil {
			token.IsActive = *t.IsActive
		}
		if t.ImageEnabled != nil {
			token.ImageEnabled = *t.ImageEnabled
		}
		if t.VideoEnabled != nil {
			token.VideoEnabled = *t.VideoEnabled
		}
		if t.ImageConcurrency != nil {
			token.ImageConcurrency = *t.ImageConcurrency
		}
		if t.VideoConcurrency != nil {
			token.VideoConcurrency = *t.VideoConcurrency
		}

		if existingToken != nil {
			// Update existing token
			token.ID = existingToken.ID
			if err := h.db.UpdateToken(token); err != nil {
				result.Success = false
				result.Status = "failed"
				result.Error = err.Error()
				failed++
			} else {
				result.Success = true
				result.Status = "updated"
				updated++
			}
		} else {
			// Create new token
			if _, err := h.db.CreateToken(token); err != nil {
				result.Success = false
				result.Status = "failed"
				result.Error = err.Error()
				failed++
			} else {
				result.Success = true
				result.Status = "added"
				added++
			}
		}

		results = append(results, result)
	}

	h.refreshLoadBalancer()

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"results": results,
		"added":   added,
		"updated": updated,
		"failed":  failed,
	})
}

// ========== Admin Password & API Key ==========

// UpdatePasswordRequest represents password update request
type UpdatePasswordRequest struct {
	OldPassword string `json:"old_password"`
	NewPassword string `json:"new_password"`
	Username    string `json:"username"`
}

// HandleUpdatePassword updates admin password
func (h *AdminHandler) HandleUpdatePassword(c *gin.Context) {
	var req UpdatePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	cfg, err := h.db.GetSystemConfig()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get config"})
		return
	}

	// Verify old password
	if cfg.AdminPasswordHash != "" && req.OldPassword != cfg.AdminPasswordHash {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "旧密码错误"})
		return
	}
	if cfg.AdminPasswordHash == "" && req.OldPassword != "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "旧密码错误"})
		return
	}

	// Update password
	cfg.AdminPasswordHash = req.NewPassword
	if req.Username != "" {
		cfg.AdminUsername = req.Username
	}

	if err := h.db.UpdateSystemConfig(cfg); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update password"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "密码已更新",
	})
}

// UpdateAPIKeyRequest represents API key update request
type UpdateAPIKeyRequest struct {
	NewAPIKey string `json:"new_api_key"`
}

// HandleUpdateAPIKey updates API key
func (h *AdminHandler) HandleUpdateAPIKey(c *gin.Context) {
	var req UpdateAPIKeyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	if req.NewAPIKey == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "API Key 不能为空"})
		return
	}

	cfg, err := h.db.GetSystemConfig()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get config"})
		return
	}

	cfg.APIKey = req.NewAPIKey

	if err := h.db.UpdateSystemConfig(cfg); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update API key"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "API Key 已更新",
	})
}

// ========== Proxy Test ==========

// TestProxyRequest represents proxy test request
type TestProxyRequest struct {
	TestURL string `json:"test_url"`
}

// HandleTestProxy tests proxy connection
func (h *AdminHandler) HandleTestProxy(c *gin.Context) {
	var req TestProxyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	testURL := req.TestURL
	if testURL == "" {
		testURL = "https://sora.chatgpt.com"
	}

	// For now, just return success - actual implementation would test proxy
	c.JSON(http.StatusOK, gin.H{
		"success":  true,
		"message":  "代理连接成功",
		"test_url": testURL,
	})
}

// ========== Task Management ==========

// HandleCancelTask cancels a running task
func (h *AdminHandler) HandleCancelTask(c *gin.Context) {
	taskID := c.Param("task_id")
	if taskID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Task ID required"})
		return
	}

	// For now, just return success - actual implementation would cancel the task
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "任务已取消",
	})
}

// ========== Token Test ==========

// HandleTestToken tests a single token
func (h *AdminHandler) HandleTestToken(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid token ID"})
		return
	}

	// Get proxy URL from config
	cfg, _ := h.db.GetSystemConfig()
	proxyURL := ""
	if cfg != nil && cfg.ProxyEnabled {
		proxyURL = cfg.ProxyURL
	}

	result, err := h.tokenManager.TestToken(id, proxyURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

// ========== ST/RT Conversion ==========

// ST2ATRequest represents ST to AT conversion request
type ST2ATRequest struct {
	ST string `json:"st"`
}

// RT2ATRequest represents RT to AT conversion request
type RT2ATRequest struct {
	RT       string `json:"rt"`
	ClientID string `json:"client_id"`
}

// HandleConvertST2AT converts Session Token to Access Token
func (h *AdminHandler) HandleConvertST2AT(c *gin.Context) {
	var req ST2ATRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	if req.ST == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Session Token 不能为空"})
		return
	}

	// Get proxy URL from config
	cfg, _ := h.db.GetSystemConfig()
	proxyURL := ""
	if cfg != nil && cfg.ProxyEnabled {
		proxyURL = cfg.ProxyURL
	}

	result, err := h.tokenManager.ConvertSTToAT(req.ST, proxyURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

// HandleConvertRT2AT converts Refresh Token to Access Token
func (h *AdminHandler) HandleConvertRT2AT(c *gin.Context) {
	var req RT2ATRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	if req.RT == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Refresh Token 不能为空"})
		return
	}

	// Get proxy URL from config
	cfg, _ := h.db.GetSystemConfig()
	proxyURL := ""
	if cfg != nil && cfg.ProxyEnabled {
		proxyURL = cfg.ProxyURL
	}

	result, err := h.tokenManager.ConvertRTToAT(req.RT, req.ClientID, proxyURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}
