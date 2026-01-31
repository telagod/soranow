package api

import (
	"testing"
)

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

func TestParseMessagesContent_Multimodal(t *testing.T) {
	tests := []struct {
		name     string
		messages []ChatMessage
		want     *ParsedContent
	}{
		{
			name: "simple text message",
			messages: []ChatMessage{
				{Role: "user", Content: "a beautiful sunset"},
			},
			want: &ParsedContent{Prompt: "a beautiful sunset"},
		},
		{
			name: "text with remix target",
			messages: []ChatMessage{
				{Role: "user", Content: "remix this video remix:abc123"},
			},
			want: &ParsedContent{Prompt: "remix this video remix:abc123", RemixTargetID: "abc123"},
		},
		{
			name: "multimodal with image",
			messages: []ChatMessage{
				{Role: "user", Content: []interface{}{
					map[string]interface{}{
						"type": "text",
						"text": "describe this image",
					},
					map[string]interface{}{
						"type": "image_url",
						"image_url": map[string]interface{}{
							"url": "data:image/png;base64,iVBORw0KGgo=",
						},
					},
				}},
			},
			want: &ParsedContent{Prompt: "describe this image", ImageData: "iVBORw0KGgo="},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := ParseMessagesContent(tt.messages)
			if got.Prompt != tt.want.Prompt {
				t.Errorf("Prompt = %v, want %v", got.Prompt, tt.want.Prompt)
			}
			if got.RemixTargetID != tt.want.RemixTargetID {
				t.Errorf("RemixTargetID = %v, want %v", got.RemixTargetID, tt.want.RemixTargetID)
			}
			if got.ImageData != tt.want.ImageData {
				t.Errorf("ImageData = %v, want %v", got.ImageData, tt.want.ImageData)
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
		{"sora2-landscape-10s", true},
		{"sora2pro-portrait-15s", true},
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

func TestIsValidModel(t *testing.T) {
	tests := []struct {
		model string
		want  bool
	}{
		{"sora-image", true},
		{"sora", true},
		{"sora-video", true},
		{"gpt-image-1", true},
		{"sora2-landscape-10s", true},
		{"gpt-4", false},
		{"invalid-model", false},
	}

	for _, tt := range tests {
		t.Run(tt.model, func(t *testing.T) {
			if got := IsValidModel(tt.model); got != tt.want {
				t.Errorf("IsValidModel(%s) = %v, want %v", tt.model, got, tt.want)
			}
		})
	}
}

func TestExtractRemixTargetID(t *testing.T) {
	tests := []struct {
		text string
		want string
	}{
		{"remix:abc123", "abc123"},
		{"remix_target_id:xyz789", "xyz789"},
		{"please remix this remix:task_001", "task_001"},
		{"no remix here", ""},
		{"", ""},
	}

	for _, tt := range tests {
		t.Run(tt.text, func(t *testing.T) {
			if got := extractRemixTargetID(tt.text); got != tt.want {
				t.Errorf("extractRemixTargetID(%s) = %v, want %v", tt.text, got, tt.want)
			}
		})
	}
}
