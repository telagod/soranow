package services

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"sora2api-go/internal/database"
	"sora2api-go/internal/models"
)

// GenerationConfig holds configuration for generation
type GenerationConfig struct {
	ImageTimeout     int
	VideoTimeout     int
	PollInterval     time.Duration
	WatermarkFree    bool
	CacheEnabled     bool
	CacheBaseURL     string
}

// GenerationHandler handles image and video generation
type GenerationHandler struct {
	db           *database.DB
	soraClient   *SoraClient
	loadBalancer *LoadBalancer
	tokenManager *TokenManager
	config       *GenerationConfig
}

// NewGenerationHandler creates a new generation handler
func NewGenerationHandler(db *database.DB, lb *LoadBalancer, tm *TokenManager, cfg *GenerationConfig) *GenerationHandler {
	if cfg == nil {
		cfg = &GenerationConfig{
			ImageTimeout: 300,
			VideoTimeout: 3000,
			PollInterval: 2500 * time.Millisecond,
		}
	}
	return &GenerationHandler{
		db:           db,
		soraClient:   NewSoraClient("", 120, nil),
		loadBalancer: lb,
		tokenManager: tm,
		config:       cfg,
	}
}

// GenerationResult represents the result of a generation
type GenerationResult struct {
	TaskID   string   `json:"task_id"`
	Status   string   `json:"status"`
	Progress float64  `json:"progress"`
	URLs     []string `json:"urls,omitempty"`
	Error    string   `json:"error,omitempty"`
}

// StreamEvent represents a streaming event
type StreamEvent struct {
	Type     string  `json:"type"` // progress, content, done, error
	Progress float64 `json:"progress,omitempty"`
	Content  string  `json:"content,omitempty"`
	Error    string  `json:"error,omitempty"`
}

// ModelConfig represents model configuration
type ModelConfig struct {
	IsVideo     bool
	Orientation string // landscape, portrait
	NFrames     int    // 300=10s, 450=15s, 750=25s
	Model       string // sy_8 (standard), sy_ore (pro)
	Size        string // small, large
	Width       int
	Height      int
}

// ParseModel parses model string and returns configuration
func ParseModel(model string) *ModelConfig {
	cfg := &ModelConfig{
		IsVideo:     false,
		Orientation: "landscape",
		NFrames:     450,
		Model:       "sy_8",
		Size:        "small",
		Width:       1024,
		Height:      1024,
	}

	model = strings.ToLower(model)

	// Image models
	if strings.Contains(model, "image") || model == "gpt-image" || model == "gpt-image-1" {
		cfg.IsVideo = false
		if strings.Contains(model, "landscape") {
			cfg.Width = 1792
			cfg.Height = 1024
		} else if strings.Contains(model, "portrait") {
			cfg.Width = 1024
			cfg.Height = 1792
		}
		return cfg
	}

	// Video models
	cfg.IsVideo = true

	// Orientation
	if strings.Contains(model, "portrait") {
		cfg.Orientation = "portrait"
	} else {
		cfg.Orientation = "landscape"
	}

	// Duration (frames)
	if strings.Contains(model, "10s") {
		cfg.NFrames = 300
	} else if strings.Contains(model, "15s") {
		cfg.NFrames = 450
	} else if strings.Contains(model, "25s") || strings.Contains(model, "20s") {
		cfg.NFrames = 750
	}

	// Pro model
	if strings.Contains(model, "pro") {
		cfg.Model = "sy_ore"
	}

	// HD size
	if strings.Contains(model, "hd") {
		cfg.Size = "large"
	}

	return cfg
}

// Generate starts a generation task and returns the result
func (h *GenerationHandler) Generate(ctx context.Context, prompt, model string, stream bool, eventChan chan<- StreamEvent) (*GenerationResult, error) {
	// Parse model configuration
	modelCfg := ParseModel(model)

	// Get a token from load balancer
	token := h.loadBalancer.GetNextToken(!modelCfg.IsVideo, modelCfg.IsVideo)
	if token == nil {
		return nil, fmt.Errorf("no available token")
	}

	// Get proxy URL from config
	proxyURL := ""
	if cfg, err := h.db.GetSystemConfig(); err == nil && cfg.ProxyEnabled {
		proxyURL = cfg.ProxyURL
	}
	if token.ProxyURL != "" {
		proxyURL = token.ProxyURL
	}

	var taskID string
	var err error

	if modelCfg.IsVideo {
		taskID, err = h.soraClient.GenerateVideo(
			prompt, token.Token, modelCfg.Orientation, "",
			modelCfg.NFrames, "", modelCfg.Model, modelCfg.Size, proxyURL,
		)
	} else {
		taskID, err = h.soraClient.GenerateImage(
			prompt, token.Token, modelCfg.Width, modelCfg.Height, "", proxyURL,
		)
	}

	if err != nil {
		h.tokenManager.RecordError(token.ID)
		return nil, fmt.Errorf("failed to start generation: %v", err)
	}

	// Create task record
	task := &models.Task{
		TaskID:  taskID,
		TokenID: token.ID,
		Model:   model,
		Prompt:  prompt,
		Status:  models.TaskStatusProcessing,
	}
	h.db.CreateTask(task)

	// Send initial progress
	if stream && eventChan != nil {
		eventChan <- StreamEvent{Type: "progress", Progress: 0, Content: "任务已创建，开始生成..."}
	}

	// Poll for result
	timeout := time.Duration(h.config.ImageTimeout) * time.Second
	if modelCfg.IsVideo {
		timeout = time.Duration(h.config.VideoTimeout) * time.Second
	}

	result, err := h.pollTaskResult(ctx, taskID, token.Token, modelCfg.IsVideo, proxyURL, timeout, stream, eventChan)
	if err != nil {
		h.tokenManager.RecordError(token.ID)
		task.Status = models.TaskStatusFailed
		task.ErrorMessage = err.Error()
		h.db.UpdateTask(task)
		return nil, err
	}

	// Record success
	h.tokenManager.RecordUsage(token.ID, modelCfg.IsVideo)
	h.tokenManager.RecordSuccess(token.ID, modelCfg.IsVideo)

	// Update task
	task.Status = models.TaskStatusCompleted
	if len(result.URLs) > 0 {
		urlsJSON, _ := json.Marshal(result.URLs)
		task.ResultURLs = string(urlsJSON)
	}
	now := time.Now()
	task.CompletedAt = &now
	h.db.UpdateTask(task)

	return result, nil
}

// pollTaskResult polls for task completion
func (h *GenerationHandler) pollTaskResult(ctx context.Context, taskID, token string, isVideo bool, proxyURL string, timeout time.Duration, stream bool, eventChan chan<- StreamEvent) (*GenerationResult, error) {
	startTime := time.Now()
	pollInterval := h.config.PollInterval
	if pollInterval == 0 {
		pollInterval = 2500 * time.Millisecond
	}

	lastProgress := float64(0)

	for {
		select {
		case <-ctx.Done():
			return nil, ctx.Err()
		default:
		}

		// Check timeout
		if time.Since(startTime) > timeout {
			return nil, fmt.Errorf("generation timeout after %v", timeout)
		}

		// Wait before polling
		time.Sleep(pollInterval)

		// Check if task is still pending
		pendingTask, err := h.soraClient.FindTaskInPending(taskID, token, proxyURL)
		if err != nil {
			continue // Retry on error
		}

		if pendingTask != nil {
			// Task is still processing
			progress := pendingTask.ProgressPct * 100
			if progress > lastProgress {
				lastProgress = progress
				if stream && eventChan != nil {
					eventChan <- StreamEvent{
						Type:     "progress",
						Progress: progress,
						Content:  fmt.Sprintf("生成进度: %.0f%%", progress),
					}
				}
			}
			continue
		}

		// Task not in pending, check if completed
		if isVideo {
			draft, err := h.soraClient.FindTaskInVideoDrafts(taskID, token, proxyURL)
			if err != nil {
				continue
			}
			if draft != nil && draft.VideoURL != "" {
				videoURL := draft.VideoURL

				// Try to get watermark-free URL
				if h.config.WatermarkFree {
					postID, wfURL, err := h.soraClient.PublishVideo(draft.ID, token, proxyURL)
					if err == nil && wfURL != "" {
						videoURL = wfURL
						// Delete the post after getting URL
						h.soraClient.DeletePost(postID, token, proxyURL)
					}
				}

				if stream && eventChan != nil {
					eventChan <- StreamEvent{Type: "done", Progress: 100}
				}

				return &GenerationResult{
					TaskID:   taskID,
					Status:   "completed",
					Progress: 100,
					URLs:     []string{videoURL},
				}, nil
			}
		} else {
			imageTask, err := h.soraClient.FindTaskInImageTasks(taskID, token, proxyURL)
			if err != nil {
				continue
			}
			if imageTask != nil {
				urls := ExtractImageURLs(imageTask)
				if len(urls) > 0 {
					if stream && eventChan != nil {
						eventChan <- StreamEvent{Type: "done", Progress: 100}
					}

					return &GenerationResult{
						TaskID:   taskID,
						Status:   "completed",
						Progress: 100,
						URLs:     urls,
					}, nil
				}
			}
		}
	}
}

// FormatResultAsMarkdown formats the generation result as markdown
func FormatResultAsMarkdown(result *GenerationResult, isVideo bool) string {
	if len(result.URLs) == 0 {
		return "生成失败，未获取到结果"
	}

	var sb strings.Builder
	for i, url := range result.URLs {
		if isVideo {
			sb.WriteString(fmt.Sprintf("![Generated Video %d](%s)\n", i+1, url))
		} else {
			sb.WriteString(fmt.Sprintf("![Generated Image %d](%s)\n", i+1, url))
		}
	}
	return sb.String()
}
