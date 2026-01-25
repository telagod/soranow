package api

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"sora2api-go/internal/database"
	"sora2api-go/internal/services"
)

// Handler holds dependencies for API handlers
type Handler struct {
	db          *database.DB
	loadBalancer *services.LoadBalancer
	concurrency  *services.ConcurrencyManager
}

// NewHandler creates a new Handler instance
func NewHandler(db *database.DB, lb *services.LoadBalancer, cm *services.ConcurrencyManager) *Handler {
	return &Handler{
		db:          db,
		loadBalancer: lb,
		concurrency:  cm,
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
