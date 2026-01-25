package services

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestSoraClient_NewClient(t *testing.T) {
	client := NewSoraClient("https://sora.chatgpt.com/backend", 120, nil)
	
	if client == nil {
		t.Fatal("Expected non-nil client")
	}
	if client.baseURL != "https://sora.chatgpt.com/backend" {
		t.Errorf("Expected baseURL, got %s", client.baseURL)
	}
}

func TestSoraClient_GetPowParseTime(t *testing.T) {
	timeStr := GetPowParseTime()
	
	if timeStr == "" {
		t.Error("Expected non-empty time string")
	}
	
	// Should contain GMT-0500
	if len(timeStr) < 20 {
		t.Errorf("Time string too short: %s", timeStr)
	}
}

func TestSoraClient_BuildImagePayload(t *testing.T) {
	client := NewSoraClient("https://example.com", 120, nil)
	
	payload := client.BuildImagePayload("a beautiful sunset", 360, 360, "")
	
	if payload["type"] != "image_gen" {
		t.Errorf("Expected type 'image_gen', got %v", payload["type"])
	}
	if payload["prompt"] != "a beautiful sunset" {
		t.Errorf("Expected prompt, got %v", payload["prompt"])
	}
	if payload["width"] != 360 {
		t.Errorf("Expected width 360, got %v", payload["width"])
	}
	if payload["operation"] != "simple_compose" {
		t.Errorf("Expected operation 'simple_compose', got %v", payload["operation"])
	}
}

func TestSoraClient_BuildImagePayload_WithMediaID(t *testing.T) {
	client := NewSoraClient("https://example.com", 120, nil)
	
	payload := client.BuildImagePayload("remix this", 360, 360, "media_123")
	
	if payload["operation"] != "remix" {
		t.Errorf("Expected operation 'remix', got %v", payload["operation"])
	}
	
	inpaintItems := payload["inpaint_items"].([]map[string]interface{})
	if len(inpaintItems) != 1 {
		t.Errorf("Expected 1 inpaint item, got %d", len(inpaintItems))
	}
}

func TestSoraClient_BuildVideoPayload(t *testing.T) {
	client := NewSoraClient("https://example.com", 120, nil)
	
	payload := client.BuildVideoPayload("a cat walking", "landscape", "", 450, "", "sy_8", "small")
	
	if payload["kind"] != "video" {
		t.Errorf("Expected kind 'video', got %v", payload["kind"])
	}
	if payload["prompt"] != "a cat walking" {
		t.Errorf("Expected prompt, got %v", payload["prompt"])
	}
	if payload["orientation"] != "landscape" {
		t.Errorf("Expected orientation 'landscape', got %v", payload["orientation"])
	}
	if payload["n_frames"] != 450 {
		t.Errorf("Expected n_frames 450, got %v", payload["n_frames"])
	}
}

func TestSoraClient_ParseTaskResponse(t *testing.T) {
	responseBody := `{"id": "task_abc123", "status": "pending"}`
	
	taskID, err := ParseTaskResponse([]byte(responseBody))
	if err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}
	if taskID != "task_abc123" {
		t.Errorf("Expected task ID 'task_abc123', got '%s'", taskID)
	}
}

func TestSoraClient_ParseTaskResponse_Error(t *testing.T) {
	responseBody := `{"error": "something went wrong"}`
	
	_, err := ParseTaskResponse([]byte(responseBody))
	if err == nil {
		t.Error("Expected error for response without ID")
	}
}

func TestSoraClient_MockGenerateImage(t *testing.T) {
	// Create mock server
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/video_gen" {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]string{"id": "img_task_123"})
			return
		}
		http.NotFound(w, r)
	}))
	defer server.Close()

	client := NewSoraClient(server.URL, 30, nil)
	
	taskID, err := client.GenerateImage("test prompt", "fake_token", 360, 360, "", 0)
	if err != nil {
		t.Fatalf("GenerateImage failed: %v", err)
	}
	if taskID != "img_task_123" {
		t.Errorf("Expected task ID 'img_task_123', got '%s'", taskID)
	}
}

func TestSoraClient_GetTaskStatus(t *testing.T) {
	// Create mock server
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"id":       "task_123",
			"status":   "completed",
			"progress": 100.0,
			"result": map[string]interface{}{
				"url": "https://example.com/result.png",
			},
		})
	}))
	defer server.Close()

	client := NewSoraClient(server.URL, 30, nil)
	
	status, err := client.GetTaskStatus("task_123", "fake_token", true, 0)
	if err != nil {
		t.Fatalf("GetTaskStatus failed: %v", err)
	}
	if status.Status != "completed" {
		t.Errorf("Expected status 'completed', got '%s'", status.Status)
	}
}
