package api

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestChatCompletionRequest_Validation(t *testing.T) {
	gin.SetMode(gin.TestMode)

	handler := NewHandler(nil, nil, nil)
	router := gin.New()
	router.POST("/v1/chat/completions", handler.HandleChatCompletions)

	tests := []struct {
		name       string
		body       interface{}
		wantStatus int
	}{
		{
			name: "valid request",
			body: ChatCompletionRequest{
				Model: "sora-image",
				Messages: []ChatMessage{
					{Role: "user", Content: "a beautiful sunset"},
				},
			},
			wantStatus: http.StatusOK,
		},
		{
			name: "missing model",
			body: map[string]interface{}{
				"messages": []map[string]string{
					{"role": "user", "content": "test"},
				},
			},
			wantStatus: http.StatusBadRequest,
		},
		{
			name: "missing messages",
			body: map[string]interface{}{
				"model": "sora-image",
			},
			wantStatus: http.StatusBadRequest,
		},
		{
			name:       "empty body",
			body:       map[string]interface{}{},
			wantStatus: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			body, _ := json.Marshal(tt.body)
			req := httptest.NewRequest("POST", "/v1/chat/completions", bytes.NewReader(body))
			req.Header.Set("Content-Type", "application/json")
			w := httptest.NewRecorder()

			router.ServeHTTP(w, req)

			if w.Code != tt.wantStatus {
				t.Errorf("Expected status %d, got %d. Body: %s", tt.wantStatus, w.Code, w.Body.String())
			}
		})
	}
}

func TestChatCompletionResponse_Format(t *testing.T) {
	gin.SetMode(gin.TestMode)

	handler := NewHandler(nil, nil, nil)
	router := gin.New()
	router.POST("/v1/chat/completions", handler.HandleChatCompletions)

	body, _ := json.Marshal(ChatCompletionRequest{
		Model: "sora-image",
		Messages: []ChatMessage{
			{Role: "user", Content: "a cat"},
		},
	})

	req := httptest.NewRequest("POST", "/v1/chat/completions", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected status 200, got %d", w.Code)
	}

	var resp ChatCompletionResponse
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if resp.Object != "chat.completion" {
		t.Errorf("Expected object 'chat.completion', got '%s'", resp.Object)
	}

	if len(resp.Choices) == 0 {
		t.Error("Expected at least one choice")
	}

	if resp.ID == "" {
		t.Error("Expected non-empty ID")
	}
}

func TestExtractPromptFromMessages(t *testing.T) {
	tests := []struct {
		name     string
		messages []ChatMessage
		want     string
	}{
		{
			name: "single user message",
			messages: []ChatMessage{
				{Role: "user", Content: "a beautiful sunset"},
			},
			want: "a beautiful sunset",
		},
		{
			name: "multiple messages - use last user",
			messages: []ChatMessage{
				{Role: "system", Content: "You are helpful"},
				{Role: "user", Content: "first prompt"},
				{Role: "assistant", Content: "response"},
				{Role: "user", Content: "second prompt"},
			},
			want: "second prompt",
		},
		{
			name:     "empty messages",
			messages: []ChatMessage{},
			want:     "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := ExtractPromptFromMessages(tt.messages)
			if got != tt.want {
				t.Errorf("ExtractPromptFromMessages() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestIsImageModel(t *testing.T) {
	tests := []struct {
		model string
		want  bool
	}{
		{"sora-image", true},
		{"gpt-image-1", true},
		{"gpt-image", true},
		{"sora", false},
		{"sora-video", false},
		{"gpt-4", false},
	}

	for _, tt := range tests {
		t.Run(tt.model, func(t *testing.T) {
			if got := IsImageModel(tt.model); got != tt.want {
				t.Errorf("IsImageModel(%s) = %v, want %v", tt.model, got, tt.want)
			}
		})
	}
}

func TestIsVideoModel(t *testing.T) {
	tests := []struct {
		model string
		want  bool
	}{
		{"sora", true},
		{"sora-video", true},
		{"sora-image", false},
		{"gpt-image-1", false},
		{"gpt-4", false},
	}

	for _, tt := range tests {
		t.Run(tt.model, func(t *testing.T) {
			if got := IsVideoModel(tt.model); got != tt.want {
				t.Errorf("IsVideoModel(%s) = %v, want %v", tt.model, got, tt.want)
			}
		})
	}
}
