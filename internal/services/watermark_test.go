package services

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestWatermarkRemover_NewRemover(t *testing.T) {
	remover := NewWatermarkRemover("third_party", "http://example.com/parse", "token123", true)

	if remover == nil {
		t.Fatal("Expected non-nil remover")
	}
	if remover.parseMethod != "third_party" {
		t.Errorf("Expected parseMethod 'third_party', got '%s'", remover.parseMethod)
	}
}

func TestWatermarkRemover_IsEnabled(t *testing.T) {
	remover := NewWatermarkRemover("third_party", "http://example.com/parse", "token123", true)

	if !remover.IsEnabled() {
		t.Error("Expected remover to be enabled")
	}

	disabledRemover := NewWatermarkRemover("", "", "", true)
	if disabledRemover.IsEnabled() {
		t.Error("Expected remover to be disabled when no method set")
	}
}

func TestWatermarkRemover_RemoveWatermark_ThirdParty(t *testing.T) {
	// Create mock server
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Verify request
		if r.Header.Get("Authorization") != "Bearer test_token" {
			t.Error("Expected Authorization header")
		}

		var req map[string]string
		json.NewDecoder(r.Body).Decode(&req)

		if req["url"] != "http://example.com/video.mp4" {
			t.Errorf("Expected URL in request, got %v", req)
		}

		// Return mock response
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"url": "http://example.com/video_no_watermark.mp4",
		})
	}))
	defer server.Close()

	remover := NewWatermarkRemover("third_party", server.URL, "test_token", true)

	result, err := remover.RemoveWatermark("http://example.com/video.mp4")
	if err != nil {
		t.Fatalf("RemoveWatermark failed: %v", err)
	}

	if result != "http://example.com/video_no_watermark.mp4" {
		t.Errorf("Expected cleaned URL, got '%s'", result)
	}
}

func TestWatermarkRemover_RemoveWatermark_Fallback(t *testing.T) {
	// Create mock server that returns error
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
	}))
	defer server.Close()

	remover := NewWatermarkRemover("third_party", server.URL, "test_token", true)

	// With fallback enabled, should return original URL
	result, err := remover.RemoveWatermark("http://example.com/video.mp4")
	if err != nil {
		t.Fatalf("Expected fallback to work, got error: %v", err)
	}

	if result != "http://example.com/video.mp4" {
		t.Errorf("Expected original URL as fallback, got '%s'", result)
	}
}

func TestWatermarkRemover_RemoveWatermark_NoFallback(t *testing.T) {
	// Create mock server that returns error
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
	}))
	defer server.Close()

	remover := NewWatermarkRemover("third_party", server.URL, "test_token", false)

	// Without fallback, should return error
	_, err := remover.RemoveWatermark("http://example.com/video.mp4")
	if err == nil {
		t.Error("Expected error when fallback is disabled")
	}
}

func TestWatermarkRemover_ParseVideoURL(t *testing.T) {
	tests := []struct {
		name     string
		url      string
		expected string
	}{
		{
			name:     "normal URL",
			url:      "http://example.com/video.mp4",
			expected: "http://example.com/video.mp4",
		},
		{
			name:     "URL with query params",
			url:      "http://example.com/video.mp4?token=abc",
			expected: "http://example.com/video.mp4?token=abc",
		},
	}

	remover := NewWatermarkRemover("third_party", "", "", true)

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := remover.ParseVideoURL(tt.url)
			if result != tt.expected {
				t.Errorf("Expected '%s', got '%s'", tt.expected, result)
			}
		})
	}
}
