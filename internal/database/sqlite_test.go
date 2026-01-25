package database

import (
	"testing"

	"sora2api-go/internal/models"
)

func TestNewDB_InMemory(t *testing.T) {
	db, err := NewDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to create in-memory database: %v", err)
	}
	defer db.Close()

	if db == nil {
		t.Fatal("Expected non-nil database")
	}
}

func TestDB_InitSchema(t *testing.T) {
	db, err := NewDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to create database: %v", err)
	}
	defer db.Close()

	if err := db.InitSchema(); err != nil {
		t.Fatalf("Failed to initialize schema: %v", err)
	}
}

func TestDB_TokenCRUD(t *testing.T) {
	db, err := NewDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to create database: %v", err)
	}
	defer db.Close()

	if err := db.InitSchema(); err != nil {
		t.Fatalf("Failed to initialize schema: %v", err)
	}

	// Create token
	token := &models.Token{
		Token:            "test_token_abc123",
		Email:            "test@example.com",
		Name:             "Test Token",
		IsActive:         true,
		ImageEnabled:     true,
		VideoEnabled:     true,
		ImageConcurrency: 2,
		VideoConcurrency: 1,
	}

	id, err := db.CreateToken(token)
	if err != nil {
		t.Fatalf("Failed to create token: %v", err)
	}
	if id <= 0 {
		t.Errorf("Expected positive ID, got %d", id)
	}

	// Read token by ID
	retrieved, err := db.GetTokenByID(id)
	if err != nil {
		t.Fatalf("Failed to get token by ID: %v", err)
	}
	if retrieved.Token != token.Token {
		t.Errorf("Expected token '%s', got '%s'", token.Token, retrieved.Token)
	}
	if retrieved.Email != token.Email {
		t.Errorf("Expected email '%s', got '%s'", token.Email, retrieved.Email)
	}

	// Read token by token string
	retrieved2, err := db.GetTokenByToken(token.Token)
	if err != nil {
		t.Fatalf("Failed to get token by token string: %v", err)
	}
	if retrieved2.ID != id {
		t.Errorf("Expected ID %d, got %d", id, retrieved2.ID)
	}

	// Update token
	retrieved.Name = "Updated Name"
	retrieved.IsActive = false
	if err := db.UpdateToken(retrieved); err != nil {
		t.Fatalf("Failed to update token: %v", err)
	}

	updated, err := db.GetTokenByID(id)
	if err != nil {
		t.Fatalf("Failed to get updated token: %v", err)
	}
	if updated.Name != "Updated Name" {
		t.Errorf("Expected name 'Updated Name', got '%s'", updated.Name)
	}
	if updated.IsActive != false {
		t.Error("Expected IsActive false")
	}

	// List active tokens
	tokens, err := db.GetActiveTokens()
	if err != nil {
		t.Fatalf("Failed to get active tokens: %v", err)
	}
	if len(tokens) != 0 {
		t.Errorf("Expected 0 active tokens, got %d", len(tokens))
	}

	// Reactivate and list again
	updated.IsActive = true
	if err := db.UpdateToken(updated); err != nil {
		t.Fatalf("Failed to reactivate token: %v", err)
	}

	tokens, err = db.GetActiveTokens()
	if err != nil {
		t.Fatalf("Failed to get active tokens: %v", err)
	}
	if len(tokens) != 1 {
		t.Errorf("Expected 1 active token, got %d", len(tokens))
	}

	// Delete token
	if err := db.DeleteToken(id); err != nil {
		t.Fatalf("Failed to delete token: %v", err)
	}

	_, err = db.GetTokenByID(id)
	if err == nil {
		t.Error("Expected error when getting deleted token")
	}
}

func TestDB_GetAllTokens(t *testing.T) {
	db, err := NewDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to create database: %v", err)
	}
	defer db.Close()

	if err := db.InitSchema(); err != nil {
		t.Fatalf("Failed to initialize schema: %v", err)
	}

	// Create multiple tokens
	for i := 0; i < 3; i++ {
		token := &models.Token{
			Token:        "token_" + string(rune('a'+i)),
			Email:        "test@example.com",
			IsActive:     true,
			ImageEnabled: true,
			VideoEnabled: true,
		}
		if _, err := db.CreateToken(token); err != nil {
			t.Fatalf("Failed to create token %d: %v", i, err)
		}
	}

	tokens, err := db.GetAllTokens()
	if err != nil {
		t.Fatalf("Failed to get all tokens: %v", err)
	}
	if len(tokens) != 3 {
		t.Errorf("Expected 3 tokens, got %d", len(tokens))
	}
}

func TestDB_SystemConfig(t *testing.T) {
	db, err := NewDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to create database: %v", err)
	}
	defer db.Close()

	if err := db.InitSchema(); err != nil {
		t.Fatalf("Failed to initialize schema: %v", err)
	}

	// Get default config
	cfg, err := db.GetSystemConfig()
	if err != nil {
		t.Fatalf("Failed to get system config: %v", err)
	}
	if cfg.AdminUsername != "admin" {
		t.Errorf("Expected default admin username 'admin', got '%s'", cfg.AdminUsername)
	}
	if cfg.APIKey != "han1234" {
		t.Errorf("Expected default API key 'han1234', got '%s'", cfg.APIKey)
	}

	// Update config
	cfg.APIKey = "new_api_key"
	cfg.CacheEnabled = true
	if err := db.UpdateSystemConfig(cfg); err != nil {
		t.Fatalf("Failed to update system config: %v", err)
	}

	updated, err := db.GetSystemConfig()
	if err != nil {
		t.Fatalf("Failed to get updated config: %v", err)
	}
	if updated.APIKey != "new_api_key" {
		t.Errorf("Expected API key 'new_api_key', got '%s'", updated.APIKey)
	}
	if !updated.CacheEnabled {
		t.Error("Expected CacheEnabled true")
	}
}

func TestDB_TaskCRUD(t *testing.T) {
	db, err := NewDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to create database: %v", err)
	}
	defer db.Close()

	if err := db.InitSchema(); err != nil {
		t.Fatalf("Failed to initialize schema: %v", err)
	}

	// Create a token first (for foreign key)
	token := &models.Token{
		Token:    "test_token",
		Email:    "test@example.com",
		IsActive: true,
	}
	tokenID, err := db.CreateToken(token)
	if err != nil {
		t.Fatalf("Failed to create token: %v", err)
	}

	// Create task
	task := &models.Task{
		TaskID:  "task_123",
		TokenID: tokenID,
		Model:   "sora-image",
		Prompt:  "a beautiful sunset",
		Status:  models.TaskStatusProcessing,
	}

	id, err := db.CreateTask(task)
	if err != nil {
		t.Fatalf("Failed to create task: %v", err)
	}
	if id <= 0 {
		t.Errorf("Expected positive ID, got %d", id)
	}

	// Get task by task_id
	retrieved, err := db.GetTaskByTaskID("task_123")
	if err != nil {
		t.Fatalf("Failed to get task: %v", err)
	}
	if retrieved.Prompt != task.Prompt {
		t.Errorf("Expected prompt '%s', got '%s'", task.Prompt, retrieved.Prompt)
	}

	// Update task status
	retrieved.Status = models.TaskStatusCompleted
	retrieved.Progress = 100.0
	if err := db.UpdateTask(retrieved); err != nil {
		t.Fatalf("Failed to update task: %v", err)
	}

	updated, err := db.GetTaskByTaskID("task_123")
	if err != nil {
		t.Fatalf("Failed to get updated task: %v", err)
	}
	if updated.Status != models.TaskStatusCompleted {
		t.Errorf("Expected status '%s', got '%s'", models.TaskStatusCompleted, updated.Status)
	}
}
