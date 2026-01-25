package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// Image models
var imageModels = map[string]bool{
	"sora-image":  true,
	"gpt-image-1": true,
	"gpt-image":   true,
}

// Video models
var videoModels = map[string]bool{
	"sora":       true,
	"sora-video": true,
}

// IsImageModel checks if the model is an image generation model
func IsImageModel(model string) bool {
	return imageModels[model]
}

// IsVideoModel checks if the model is a video generation model
func IsVideoModel(model string) bool {
	return videoModels[model]
}

// ExtractPromptFromMessages extracts the prompt from chat messages
// Returns the content of the last user message
func ExtractPromptFromMessages(messages []ChatMessage) string {
	for i := len(messages) - 1; i >= 0; i-- {
		if messages[i].Role == "user" {
			return messages[i].Content
		}
	}
	return ""
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
	if !IsImageModel(req.Model) && !IsVideoModel(req.Model) {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error: ErrorDetail{
				Message: fmt.Sprintf("Unknown model: %s", req.Model),
				Type:    "invalid_request_error",
			},
		})
		return
	}

	// Extract prompt
	prompt := ExtractPromptFromMessages(req.Messages)
	if prompt == "" {
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
		h.handleStreamingResponse(c, req, prompt, responseID)
	} else {
		h.handleNonStreamingResponse(c, req, prompt, responseID)
	}
}

// handleNonStreamingResponse handles non-streaming chat completion
func (h *Handler) handleNonStreamingResponse(c *gin.Context, req ChatCompletionRequest, prompt, responseID string) {
	// For now, return a mock response
	// TODO: Integrate with actual Sora API client
	
	isImage := IsImageModel(req.Model)
	var content string
	
	if isImage {
		// Mock image URL response
		content = "![Generated Image](https://example.com/generated-image.png)\n\nGenerated image for: " + prompt
	} else {
		// Mock video URL response
		content = "![Generated Video](https://example.com/generated-video.mp4)\n\nGenerated video for: " + prompt
	}

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
			PromptTokens:     len(strings.Fields(prompt)),
			CompletionTokens: len(strings.Fields(content)),
			TotalTokens:      len(strings.Fields(prompt)) + len(strings.Fields(content)),
		},
	}

	c.JSON(http.StatusOK, response)
}

// handleStreamingResponse handles streaming chat completion (SSE)
func (h *Handler) handleStreamingResponse(c *gin.Context, req ChatCompletionRequest, prompt, responseID string) {
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

	// Send initial chunk
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

	// TODO: Integrate with actual Sora API client for real streaming
	// For now, send mock progress updates
	
	isImage := IsImageModel(req.Model)
	var content string
	if isImage {
		content = "![Generated Image](https://example.com/generated-image.png)"
	} else {
		content = "![Generated Video](https://example.com/generated-video.mp4)"
	}

	// Send content chunk
	contentChunk := ChatCompletionResponse{
		ID:      responseID,
		Object:  "chat.completion.chunk",
		Created: time.Now().Unix(),
		Model:   req.Model,
		Choices: []Choice{
			{
				Index: 0,
				Delta: &ChatMessage{
					Content: content,
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
}

// sendSSEEvent sends a server-sent event
func (h *Handler) sendSSEEvent(w http.ResponseWriter, flusher http.Flusher, data interface{}) {
	jsonData, _ := json.Marshal(data)
	fmt.Fprintf(w, "data: %s\n\n", jsonData)
	flusher.Flush()
}
