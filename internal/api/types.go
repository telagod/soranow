package api

// ChatCompletionRequest represents the OpenAI-compatible chat completion request
type ChatCompletionRequest struct {
	Model       string          `json:"model" binding:"required"`
	Messages    []ChatMessage   `json:"messages" binding:"required"`
	Stream      bool            `json:"stream"`
	MaxTokens   int             `json:"max_tokens,omitempty"`
	Temperature float64         `json:"temperature,omitempty"`
	// Sora-specific fields
	Size        string          `json:"size,omitempty"`        // e.g., "1920x1080"
	Duration    int             `json:"duration,omitempty"`    // video duration in seconds
	AspectRatio string          `json:"aspect_ratio,omitempty"` // e.g., "16:9"
	Style       string          `json:"style,omitempty"`
}

// ChatMessage represents a message in the chat
type ChatMessage struct {
	Role    string      `json:"role" binding:"required"`
	Content interface{} `json:"content" binding:"required"`
}

// ContentPart represents a part of multimodal content
type ContentPart struct {
	Type     string    `json:"type"`
	Text     string    `json:"text,omitempty"`
	ImageURL *MediaURL `json:"image_url,omitempty"`
	VideoURL *MediaURL `json:"video_url,omitempty"`
}

// MediaURL represents a URL reference for image or video
type MediaURL struct {
	URL    string `json:"url"`
	Detail string `json:"detail,omitempty"`
}

// ParsedContent holds the extracted content from messages
type ParsedContent struct {
	Prompt        string
	ImageData     string // Base64 encoded image data
	VideoData     string // Base64 encoded video data
	RemixTargetID string // ID for remix operations
}

// ChatCompletionResponse represents the OpenAI-compatible chat completion response
type ChatCompletionResponse struct {
	ID      string   `json:"id"`
	Object  string   `json:"object"`
	Created int64    `json:"created"`
	Model   string   `json:"model"`
	Choices []Choice `json:"choices"`
	Usage   *Usage   `json:"usage,omitempty"`
}

// Choice represents a completion choice
type Choice struct {
	Index        int          `json:"index"`
	Message      *ChatMessage `json:"message,omitempty"`
	Delta        *ChatMessage `json:"delta,omitempty"`
	FinishReason string       `json:"finish_reason,omitempty"`
}

// Usage represents token usage
type Usage struct {
	PromptTokens     int `json:"prompt_tokens"`
	CompletionTokens int `json:"completion_tokens"`
	TotalTokens      int `json:"total_tokens"`
}

// StreamEvent represents a server-sent event for streaming
type StreamEvent struct {
	ID    string `json:"id,omitempty"`
	Event string `json:"event,omitempty"`
	Data  string `json:"data"`
}

// ErrorResponse represents an API error
type ErrorResponse struct {
	Error ErrorDetail `json:"error"`
}

// ErrorDetail contains error details
type ErrorDetail struct {
	Message string `json:"message"`
	Type    string `json:"type"`
	Code    string `json:"code,omitempty"`
}

// GenerationResult represents the result of a generation task
type GenerationResult struct {
	URLs     []string `json:"urls"`
	Progress float64  `json:"progress"`
	Status   string   `json:"status"`
	Error    string   `json:"error,omitempty"`
}
