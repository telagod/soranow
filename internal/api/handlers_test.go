package api

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestHandleModels(t *testing.T) {
	gin.SetMode(gin.TestMode)

	handler := NewHandler(nil, nil, nil)

	router := gin.New()
	router.GET("/v1/models", handler.HandleModels)

	req := httptest.NewRequest("GET", "/v1/models", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var response ModelsResponse
	if err := json.Unmarshal(w.Body.Bytes(), &response); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if response.Object != "list" {
		t.Errorf("Expected object 'list', got '%s'", response.Object)
	}

	if len(response.Data) == 0 {
		t.Error("Expected at least one model")
	}

	// Check for expected models
	modelIDs := make(map[string]bool)
	for _, m := range response.Data {
		modelIDs[m.ID] = true
	}

	expectedModels := []string{"sora", "sora-image", "gpt-image-1"}
	for _, expected := range expectedModels {
		if !modelIDs[expected] {
			t.Errorf("Expected model '%s' not found", expected)
		}
	}
}

func TestHandleModels_ResponseFormat(t *testing.T) {
	gin.SetMode(gin.TestMode)

	handler := NewHandler(nil, nil, nil)

	router := gin.New()
	router.GET("/v1/models", handler.HandleModels)

	req := httptest.NewRequest("GET", "/v1/models", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	var response ModelsResponse
	if err := json.Unmarshal(w.Body.Bytes(), &response); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	// Check model structure
	for _, m := range response.Data {
		if m.Object != "model" {
			t.Errorf("Expected model object 'model', got '%s'", m.Object)
		}
		if m.OwnedBy == "" {
			t.Error("Expected non-empty owned_by")
		}
		if m.Created == 0 {
			t.Error("Expected non-zero created timestamp")
		}
	}
}
