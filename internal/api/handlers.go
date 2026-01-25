package api

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"soranow/internal/database"
	"soranow/internal/services"
)

// Handler holds dependencies for API handlers
type Handler struct {
	db                *database.DB
	loadBalancer      *services.LoadBalancer
	concurrency       *services.ConcurrencyManager
	tokenManager      *services.TokenManager
	generationHandler *services.GenerationHandler
}

// NewHandler creates a new Handler instance
func NewHandler(db *database.DB, lb *services.LoadBalancer, cm *services.ConcurrencyManager) *Handler {
	tm := services.NewTokenManager(db, lb, cm)

	// Get config for generation handler
	var genCfg *services.GenerationConfig
	if cfg, err := db.GetSystemConfig(); err == nil {
		genCfg = &services.GenerationConfig{
			ImageTimeout:  cfg.ImageTimeout,
			VideoTimeout:  cfg.VideoTimeout,
			PollInterval:  2500 * time.Millisecond,
			WatermarkFree: cfg.WatermarkFreeEnabled,
			CacheEnabled:  cfg.CacheEnabled,
			CacheBaseURL:  cfg.CacheBaseURL,
		}
	}

	return &Handler{
		db:                db,
		loadBalancer:      lb,
		concurrency:       cm,
		tokenManager:      tm,
		generationHandler: services.NewGenerationHandler(db, lb, tm, genCfg),
	}
}

// Model represents an OpenAI-compatible model
type Model struct {
	ID      string `json:"id"`
	Object  string `json:"object"`
	Created int64  `json:"created"`
	OwnedBy string `json:"owned_by"`
}

// ModelsResponse represents the /v1/models response
type ModelsResponse struct {
	Object string  `json:"object"`
	Data   []Model `json:"data"`
}

// Available models
var availableModels = []Model{
	{ID: "sora", Object: "model", Created: time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC).Unix(), OwnedBy: "openai"},
	{ID: "sora-image", Object: "model", Created: time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC).Unix(), OwnedBy: "openai"},
	{ID: "gpt-image-1", Object: "model", Created: time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC).Unix(), OwnedBy: "openai"},
	{ID: "gpt-image", Object: "model", Created: time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC).Unix(), OwnedBy: "openai"},
	{ID: "sora-video", Object: "model", Created: time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC).Unix(), OwnedBy: "openai"},
}

// HandleModels returns the list of available models
func (h *Handler) HandleModels(c *gin.Context) {
	c.JSON(http.StatusOK, ModelsResponse{
		Object: "list",
		Data:   availableModels,
	})
}
