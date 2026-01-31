package services

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"soranow/internal/database"
	"soranow/internal/models"
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

// Predefined model configurations (aligned with Python version)
var modelConfigs = map[string]*ModelConfig{
	// Image models
	"sora-image": {
		IsVideo: false,
		Width:   360,
		Height:  360,
	},
	"sora-image-landscape": {
		IsVideo: false,
		Width:   540,
		Height:  360,
	},
	"sora-image-portrait": {
		IsVideo: false,
		Width:   360,
		Height:  540,
	},
	// Video models with 10s duration (300 frames)
	"sora-video-10s": {
		IsVideo:     true,
		Orientation: "landscape",
		NFrames:     300,
	},
	"sora-video-landscape-10s": {
		IsVideo:     true,
		Orientation: "landscape",
		NFrames:     300,
	},
	"sora-video-portrait-10s": {
		IsVideo:     true,
		Orientation: "portrait",
		NFrames:     300,
	},
	// Video models with 15s duration (450 frames)
	"sora-video-15s": {
		IsVideo:     true,
		Orientation: "landscape",
		NFrames:     450,
	},
	"sora-video-landscape-15s": {
		IsVideo:     true,
		Orientation: "landscape",
		NFrames:     450,
	},
	"sora-video-portrait-15s": {
		IsVideo:     true,
		Orientation: "portrait",
		NFrames:     450,
	},
	// Video models with 25s duration (750 frames)
	"sora-video-25s": {
		IsVideo:     true,
		Orientation: "landscape",
		NFrames:     750,
		Model:       "sy_8",
		Size:        "small",
	},
	"sora-video-landscape-25s": {
		IsVideo:     true,
		Orientation: "landscape",
		NFrames:     750,
		Model:       "sy_8",
		Size:        "small",
	},
	"sora-video-portrait-25s": {
		IsVideo:     true,
		Orientation: "portrait",
		NFrames:     750,
		Model:       "sy_8",
		Size:        "small",
	},
}

// ParseModel parses model string and returns configuration
func ParseModel(model string) *ModelConfig {
	modelLower := strings.ToLower(model)

	// Check predefined configs first
	if cfg, ok := modelConfigs[modelLower]; ok {
		// Return a copy with defaults filled in
		result := &ModelConfig{
			IsVideo:     cfg.IsVideo,
			Orientation: cfg.Orientation,
			NFrames:     cfg.NFrames,
			Model:       cfg.Model,
			Size:        cfg.Size,
			Width:       cfg.Width,
			Height:      cfg.Height,
		}
		// Fill defaults for video
		if result.IsVideo {
			if result.Model == "" {
				result.Model = "sy_8"
			}
			if result.Size == "" {
				result.Size = "small"
			}
			if result.Orientation == "" {
				result.Orientation = "landscape"
			}
		}
		return result
	}

	// Fallback: parse model string dynamically
	cfg := &ModelConfig{
		IsVideo:     false,
		Orientation: "landscape",
		NFrames:     450,
		Model:       "sy_8",
		Size:        "small",
		Width:       360,
		Height:      360,
	}

	// Image models
	if strings.Contains(modelLower, "image") || modelLower == "gpt-image" || modelLower == "gpt-image-1" {
		cfg.IsVideo = false
		if strings.Contains(modelLower, "landscape") {
			cfg.Width = 540
			cfg.Height = 360
		} else if strings.Contains(modelLower, "portrait") {
			cfg.Width = 360
			cfg.Height = 540
		}
		return cfg
	}

	// Video models
	cfg.IsVideo = true

	// Orientation
	if strings.Contains(modelLower, "portrait") {
		cfg.Orientation = "portrait"
	} else {
		cfg.Orientation = "landscape"
	}

	// Duration (frames)
	if strings.Contains(modelLower, "10s") {
		cfg.NFrames = 300
	} else if strings.Contains(modelLower, "15s") {
		cfg.NFrames = 450
	} else if strings.Contains(modelLower, "25s") || strings.Contains(modelLower, "20s") {
		cfg.NFrames = 750
	}

	// Pro model
	if strings.Contains(modelLower, "pro") {
		cfg.Model = "sy_ore"
	}

	// HD size
	if strings.Contains(modelLower, "hd") {
		cfg.Size = "large"
	}

	return cfg
}

// Generate starts a generation task and returns the result
func (h *GenerationHandler) Generate(ctx context.Context, prompt, model string, stream bool, eventChan chan<- StreamEvent) (*GenerationResult, error) {
	return h.GenerateWithMedia(ctx, prompt, model, "", "", "", stream, eventChan)
}

// GenerateWithMedia starts a generation task with optional media data
func (h *GenerationHandler) GenerateWithMedia(ctx context.Context, prompt, model, imageData, videoData, remixTargetID string, stream bool, eventChan chan<- StreamEvent) (*GenerationResult, error) {
	// Parse model configuration
	modelCfg := ParseModel(model)

	// Get a token from load balancer
	token := h.loadBalancer.GetNextToken(!modelCfg.IsVideo, modelCfg.IsVideo)
	if token == nil {
		tokenType := "图片"
		if modelCfg.IsVideo {
			tokenType = "视频"
		}
		return nil, fmt.Errorf("没有可用的%s生成 Token，请先导入 Token 并确保已启用", tokenType)
	}

	// Get proxy URL from config
	proxyURL := ""
	if cfg, err := h.db.GetSystemConfig(); err == nil && cfg.ProxyEnabled {
		proxyURL = cfg.ProxyURL
	}
	if token.ProxyURL != "" {
		proxyURL = token.ProxyURL
	}

	// Get the access token to use
	accessToken := token.Token

	// Check if token is a Refresh Token (starts with "rt_") and convert to Access Token
	if strings.HasPrefix(token.Token, "rt_") {
		if stream && eventChan != nil {
			eventChan <- StreamEvent{Type: "progress", Progress: 0, Content: "正在转换 Token..."}
		}

		// Use RefreshToken field if available, otherwise use Token field
		rt := token.RefreshToken
		if rt == "" {
			rt = token.Token
		}

		result, err := h.tokenManager.ConvertRTToAT(rt, token.ClientID, proxyURL)
		if err != nil || !result.Success {
			errMsg := "Token 转换失败"
			if err != nil {
				errMsg = err.Error()
			} else if result.Message != "" {
				errMsg = result.Message
			}
			h.tokenManager.RecordError(token.ID)
			return nil, fmt.Errorf("RT 转换 AT 失败: %s", errMsg)
		}

		accessToken = result.AccessToken

		// Update token in database with new AT
		token.Token = result.AccessToken
		if result.RefreshToken != "" {
			token.RefreshToken = result.RefreshToken
		}
		h.db.UpdateToken(token)
	}

	var taskID string
	var err error

	if modelCfg.IsVideo {
		// Check for remix mode first
		if remixTargetID != "" {
			if stream && eventChan != nil {
				eventChan <- StreamEvent{Type: "progress", Progress: 0, Content: "检测到 Remix 模式..."}
			}
			taskID, err = h.soraClient.RemixVideo(
				prompt, accessToken, modelCfg.Orientation, remixTargetID,
				modelCfg.NFrames, modelCfg.Model, proxyURL,
			)
		} else if IsStoryboardPrompt(prompt) {
			// Check if prompt is in storyboard format
			formattedPrompt := FormatStoryboardPrompt(prompt)
			if stream && eventChan != nil {
				eventChan <- StreamEvent{Type: "progress", Progress: 0, Content: "检测到分镜模式，使用 Storyboard API..."}
			}
			taskID, err = h.soraClient.GenerateStoryboard(
				formattedPrompt, accessToken, modelCfg.Orientation, "",
				modelCfg.NFrames, proxyURL,
			)
		} else {
			taskID, err = h.soraClient.GenerateVideo(
				prompt, accessToken, modelCfg.Orientation, "",
				modelCfg.NFrames, "", modelCfg.Model, modelCfg.Size, proxyURL,
			)
		}
	} else {
		taskID, err = h.soraClient.GenerateImage(
			prompt, accessToken, modelCfg.Width, modelCfg.Height, "", proxyURL,
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

	result, err := h.pollTaskResult(ctx, taskID, accessToken, modelCfg.IsVideo, proxyURL, timeout, stream, eventChan)
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

		// Use recent_tasks for both image and video (more reliable, less Cloudflare issues)
		task, err := h.soraClient.FindTaskInImageTasks(taskID, token, proxyURL)
		if err != nil {
			continue
		}
		if task == nil {
			continue
		}

		// Check task status
		status, _ := task["status"].(string)
		progressPct, _ := task["progress_pct"].(float64)

		// Update progress
		progress := progressPct * 100
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

		// Check if completed
		if status == "succeeded" {
			var urls []string

			if isVideo {
				// Extract video URL from generations
				if gens, ok := task["generations"].([]interface{}); ok && len(gens) > 0 {
					if gen, ok := gens[0].(map[string]interface{}); ok {
						if videoURL, ok := gen["url"].(string); ok && videoURL != "" {
							urls = append(urls, videoURL)
						}
					}
				}
			} else {
				urls = ExtractImageURLs(task)
			}

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
		} else if status == "failed" {
			errMsg := "生成失败"
			if msg, ok := task["error_message"].(string); ok && msg != "" {
				errMsg = msg
			}
			return nil, fmt.Errorf("%s", errMsg)
		}
		// Still processing, continue polling
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
