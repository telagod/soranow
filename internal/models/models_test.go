package models

import (
	"encoding/json"
	"testing"
	"time"
)

func TestToken_JSONSerialization(t *testing.T) {
	now := time.Now().UTC().Truncate(time.Second)
	token := Token{
		ID:               1,
		Token:            "test_token_123",
		Email:            "test@example.com",
		Name:             "Test Token",
		IsActive:         true,
		IsExpired:        false,
		ImageEnabled:     true,
		VideoEnabled:     true,
		ImageConcurrency: 2,
		VideoConcurrency: 1,
		Sora2Supported:   true,
		CreatedAt:        now,
	}

	// Test JSON marshaling
	data, err := json.Marshal(token)
	if err != nil {
		t.Fatalf("Failed to marshal token: %v", err)
	}

	// Test JSON unmarshaling
	var decoded Token
	if err := json.Unmarshal(data, &decoded); err != nil {
		t.Fatalf("Failed to unmarshal token: %v", err)
	}

	if decoded.ID != token.ID {
		t.Errorf("Expected ID %d, got %d", token.ID, decoded.ID)
	}
	if decoded.Token != token.Token {
		t.Errorf("Expected Token '%s', got '%s'", token.Token, decoded.Token)
	}
	if decoded.Email != token.Email {
		t.Errorf("Expected Email '%s', got '%s'", token.Email, decoded.Email)
	}
	if decoded.IsActive != token.IsActive {
		t.Errorf("Expected IsActive %v, got %v", token.IsActive, decoded.IsActive)
	}
}

func TestTask_StatusTransitions(t *testing.T) {
	task := Task{
		ID:      1,
		TaskID:  "task_abc123",
		TokenID: 1,
		Model:   "sora-image",
		Prompt:  "a beautiful sunset",
		Status:  TaskStatusProcessing,
	}

	if task.Status != TaskStatusProcessing {
		t.Errorf("Expected status '%s', got '%s'", TaskStatusProcessing, task.Status)
	}

	// Transition to completed
	task.Status = TaskStatusCompleted
	if task.Status != TaskStatusCompleted {
		t.Errorf("Expected status '%s', got '%s'", TaskStatusCompleted, task.Status)
	}
}

func TestSystemConfig_Defaults(t *testing.T) {
	cfg := SystemConfig{
		ID:              1,
		AdminUsername:   "admin",
		AdminPasswordHash: "hashed_password",
		APIKey:          "han1234",
	}

	if cfg.AdminUsername != "admin" {
		t.Errorf("Expected AdminUsername 'admin', got '%s'", cfg.AdminUsername)
	}
	if cfg.APIKey != "han1234" {
		t.Errorf("Expected APIKey 'han1234', got '%s'", cfg.APIKey)
	}
}

func TestRequestLog_Creation(t *testing.T) {
	now := time.Now().UTC()
	log := RequestLog{
		ID:          1,
		TokenID:     intPtr(1),
		TaskID:      stringPtr("task_123"),
		Operation:   "generate_image",
		RequestBody: `{"prompt": "test"}`,
		StatusCode:  200,
		DurationMs:  150,
		CreatedAt:   now,
	}

	if log.Operation != "generate_image" {
		t.Errorf("Expected Operation 'generate_image', got '%s'", log.Operation)
	}
	if log.StatusCode != 200 {
		t.Errorf("Expected StatusCode 200, got %d", log.StatusCode)
	}
	if *log.TokenID != 1 {
		t.Errorf("Expected TokenID 1, got %d", *log.TokenID)
	}
}

// Helper functions for pointer creation
func intPtr(i int64) *int64 {
	return &i
}

func stringPtr(s string) *string {
	return &s
}
