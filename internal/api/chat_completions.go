package api

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"soranow/internal/services"
)

// Image models
var imageModels = map[string]bool{
	"sora-image":           true,
	"gpt-image-1":          true,
	"gpt-image":            true,
	"gpt-image-landscape":  true,
	"gpt-image-portrait":   true,
}

// Video models
var videoModels = map[string]bool{
	"sora":                    true,
	"sora-video":              true,
	"sora2-landscape-10s":     true,
	"sora2-landscape-15s":     true,
	"sora2-landscape-25s":     true,
	"sora2-portrait-10s":      true,
	"sora2-portrait-15s":      true,
	"sora2-portrait-25s":      true,
	"sora2pro-landscape-10s":  true,
	"sora2pro-landscape-15s":  true,
	"sora2pro-landscape-25s":  true,
	"sora2pro-portrait-10s":   true,
	"sora2pro-portrait-15s":   true,
	"sora2pro-portrait-25s":   true,
	"sora2pro-hd-landscape-10s": true,
	"sora2pro-hd-landscape-15s": true,
	"sora2pro-hd-portrait-10s":  true,
	"sora2pro-hd-portrait-15s":  true,
}

// IsImageModel checks if the model is an image generation model
func IsImageModel(model string) bool {
	return imageModels[strings.ToLower(model)]
}

// IsVideoModel checks if the model is a video generation model
func IsVideoModel(model string) bool {
	return videoModels[strings.ToLower(model)]
}

// IsValidModel checks if the model is valid
func IsValidModel(model string) bool {
	return IsImageModel(model) || IsVideoModel(model)
}

// ExtractPromptFromMessages extracts the prompt from chat messages
func ExtractPromptFromMessages(messages []ChatMessage) string {
	parsed := ParseMessagesContent(messages)
	return parsed.Prompt
}

// ParseMessagesContent parses messages and extracts all content types
func ParseMessagesContent(messages []ChatMessage) *ParsedContent {
	result := &ParsedContent{}

	for i := len(messages) - 1; i >= 0; i-- {
		if messages[i].Role != "user" {
			continue
		}

		content := messages[i].Content

		switch v := content.(type) {
		case string:
			if result.Prompt == "" {
				result.Prompt = v
				// Check for remix_target_id in text
				result.RemixTargetID = extractRemixTargetID(v)
			}

		case []interface{}:
			for _, item := range v {
				itemMap, ok := item.(map[string]interface{})
				if !ok {
					continue
				}

				itemType, _ := itemMap["type"].(string)

				switch itemType {
				case "text":
					if text, ok := itemMap["text"].(string); ok && result.Prompt == "" {
						result.Prompt = text
						result.RemixTargetID = extractRemixTargetID(text)
					}

				case "image_url":
					if imageURL, ok := itemMap["image_url"].(map[string]interface{}); ok {
						if url, ok := imageURL["url"].(string); ok {
							if strings.HasPrefix(url, "data:image") && strings.Contains(url, "base64,") {
								parts := strings.SplitN(url, "base64,", 2)
								if len(parts) == 2 {
									result.ImageData = parts[1]
								}
							}
						}
					}

				case "video_url":
					if videoURL, ok := itemMap["video_url"].(map[string]interface{}); ok {
						if url, ok := videoURL["url"].(string); ok {
							if strings.Contains(url, "base64,") {
								parts := strings.SplitN(url, "base64,", 2)
								if len(parts) == 2 {
									result.VideoData = parts[1]
								}
							}
						}
					}
				}
			}
		}

		// Found user message, stop searching
		if result.Prompt != "" {
			break
		}
	}

	return result
}

// extractRemixTargetID extracts remix_target_id from text
// Supports formats: remix_target_id:xxx or remix:xxx (colon required, no space)
var remixPattern = regexp.MustCompile(`(?:remix_target_id|remix):([a-zA-Z0-9_-]+)`)

func extractRemixTargetID(text string) string {
	matches := remixPattern.FindStringSubmatch(text)
	if len(matches) >= 2 {
		return matches[1]
	}
	return ""
}

// GetContentString returns the content as string for response
func GetContentString(content interface{}) string {
	switch v := content.(type) {
	case string:
		return v
	default:
		return ""
	}
}

// HandleChatCompletions handles the /v1/chat/completions endpoint
func (h *Handler) HandleChatCompletions(c *gin.Context) {
	var req ChatCompletionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error: ErrorDetail{
				Message: fmt.Sprintf("Invalid request: %v", err),
				Type:    "invalid_request_error",
			},
		})
		return
	}

	// Validate model
	if !IsValidModel(req.Model) {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error: ErrorDetail{
				Message: fmt.Sprintf("Unknown model: %s. Available models: sora, sora-video, sora-image, gpt-image, gpt-image-1, sora2-landscape-10s/15s/25s, sora2-portrait-10s/15s/25s, sora2pro-*", req.Model),
				Type:    "invalid_request_error",
			},
		})
		return
	}

	// Parse multimodal content
	parsed := ParseMessagesContent(req.Messages)
	if parsed.Prompt == "" {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error: ErrorDetail{
				Message: "No user message found in messages",
				Type:    "invalid_request_error",
			},
		})
		return
	}

	// Generate response ID
	responseID := fmt.Sprintf("chatcmpl-%d", time.Now().UnixNano())

	if req.Stream {
		h.handleStreamingResponse(c, req, parsed, responseID)
	} else {
		h.handleNonStreamingResponse(c, req, parsed, responseID)
	}
}

// handleNonStreamingResponse handles non-streaming chat completion
func (h *Handler) handleNonStreamingResponse(c *gin.Context, req ChatCompletionRequest, parsed *ParsedContent, responseID string) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 30*time.Minute)
	defer cancel()

	isVideo := IsVideoModel(req.Model)

	// Start generation with multimodal support
	result, err := h.generationHandler.GenerateWithMedia(
		ctx, parsed.Prompt, req.Model,
		parsed.ImageData, parsed.VideoData, parsed.RemixTargetID,
		false, nil,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error: ErrorDetail{
				Message: fmt.Sprintf("Generation failed: %v", err),
				Type:    "server_error",
			},
		})
		return
	}

	// Format result as markdown
	content := services.FormatResultAsMarkdown(result, isVideo)

	response := ChatCompletionResponse{
		ID:      responseID,
		Object:  "chat.completion",
		Created: time.Now().Unix(),
		Model:   req.Model,
		Choices: []Choice{
			{
				Index: 0,
				Message: &ChatMessage{
					Role:    "assistant",
					Content: content,
				},
				FinishReason: "stop",
			},
		},
		Usage: &Usage{
			PromptTokens:     len(strings.Fields(parsed.Prompt)),
			CompletionTokens: len(strings.Fields(content)),
			TotalTokens:      len(strings.Fields(parsed.Prompt)) + len(strings.Fields(content)),
		},
	}

	c.JSON(http.StatusOK, response)
}

// handleStreamingResponse handles streaming chat completion (SSE)
func (h *Handler) handleStreamingResponse(c *gin.Context, req ChatCompletionRequest, parsed *ParsedContent, responseID string) {
	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Header("Transfer-Encoding", "chunked")

	flusher, ok := c.Writer.(http.Flusher)
	if !ok {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error: ErrorDetail{
				Message: "Streaming not supported",
				Type:    "server_error",
			},
		})
		return
	}

	// Send initial chunk with role
	initialChunk := ChatCompletionResponse{
		ID:      responseID,
		Object:  "chat.completion.chunk",
		Created: time.Now().Unix(),
		Model:   req.Model,
		Choices: []Choice{
			{
				Index: 0,
				Delta: &ChatMessage{
					Role: "assistant",
				},
			},
		},
	}
	h.sendSSEEvent(c.Writer, flusher, initialChunk)

	ctx, cancel := context.WithTimeout(c.Request.Context(), 30*time.Minute)
	defer cancel()

	isVideo := IsVideoModel(req.Model)

	// Create event channel for streaming updates
	eventChan := make(chan services.StreamEvent, 100)
	defer close(eventChan)

	// Start generation in goroutine
	resultChan := make(chan *services.GenerationResult, 1)
	errChan := make(chan error, 1)

	go func() {
		result, err := h.generationHandler.GenerateWithMedia(
			ctx, parsed.Prompt, req.Model,
			parsed.ImageData, parsed.VideoData, parsed.RemixTargetID,
			true, eventChan,
		)
		if err != nil {
			errChan <- err
		} else {
			resultChan <- result
		}
	}()

	// Process events
	lastProgress := float64(0)
	for {
		select {
		case <-ctx.Done():
			h.sendErrorChunk(c.Writer, flusher, responseID, req.Model, "Request timeout")
			return

		case event, ok := <-eventChan:
			if !ok {
				continue
			}

			switch event.Type {
			case "progress":
				// Send progress update (only if significant change)
				if event.Progress-lastProgress >= 10 || event.Progress >= 100 {
					lastProgress = event.Progress
					progressChunk := ChatCompletionResponse{
						ID:      responseID,
						Object:  "chat.completion.chunk",
						Created: time.Now().Unix(),
						Model:   req.Model,
						Choices: []Choice{
							{
								Index: 0,
								Delta: &ChatMessage{
									Content: fmt.Sprintf("\n**生成进度**: %.0f%%\n", event.Progress),
								},
							},
						},
					}
					h.sendSSEEvent(c.Writer, flusher, progressChunk)
				}

			case "error":
				h.sendErrorChunk(c.Writer, flusher, responseID, req.Model, event.Error)
				return
			}

		case err := <-errChan:
			h.sendErrorChunk(c.Writer, flusher, responseID, req.Model, err.Error())
			return

		case result := <-resultChan:
			// Send final content
			content := services.FormatResultAsMarkdown(result, isVideo)
			contentChunk := ChatCompletionResponse{
				ID:      responseID,
				Object:  "chat.completion.chunk",
				Created: time.Now().Unix(),
				Model:   req.Model,
				Choices: []Choice{
					{
						Index: 0,
						Delta: &ChatMessage{
							Content: "\n\n" + content,
						},
					},
				},
			}
			h.sendSSEEvent(c.Writer, flusher, contentChunk)

			// Send final chunk
			finalChunk := ChatCompletionResponse{
				ID:      responseID,
				Object:  "chat.completion.chunk",
				Created: time.Now().Unix(),
				Model:   req.Model,
				Choices: []Choice{
					{
						Index:        0,
						Delta:        &ChatMessage{},
						FinishReason: "stop",
					},
				},
			}
			h.sendSSEEvent(c.Writer, flusher, finalChunk)

			// Send [DONE] marker
			fmt.Fprintf(c.Writer, "data: [DONE]\n\n")
			flusher.Flush()
			return
		}
	}
}

// sendSSEEvent sends a server-sent event
func (h *Handler) sendSSEEvent(w http.ResponseWriter, flusher http.Flusher, data interface{}) {
	jsonData, _ := json.Marshal(data)
	fmt.Fprintf(w, "data: %s\n\n", jsonData)
	flusher.Flush()
}

// sendErrorChunk sends an error as SSE chunk
func (h *Handler) sendErrorChunk(w http.ResponseWriter, flusher http.Flusher, responseID, model, errMsg string) {
	errorChunk := ChatCompletionResponse{
		ID:      responseID,
		Object:  "chat.completion.chunk",
		Created: time.Now().Unix(),
		Model:   model,
		Choices: []Choice{
			{
				Index: 0,
				Delta: &ChatMessage{
					Content: fmt.Sprintf("\n\n**错误**: %s\n", errMsg),
				},
				FinishReason: "stop",
			},
		},
	}
	h.sendSSEEvent(w, flusher, errorChunk)
	fmt.Fprintf(w, "data: [DONE]\n\n")
	flusher.Flush()
}
