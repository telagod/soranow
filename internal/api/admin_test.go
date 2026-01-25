package api

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"sora2api-go/internal/database"
	"sora2api-go/internal/models"
	"sora2api-go/internal/services"
)

func setupTestDB(t *testing.T) *database.DB {
	db, err := database.NewDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to create test database: %v", err)
	}
	if err := db.InitSchema(); err != nil {
		t.Fatalf("Failed to init schema: %v", err)
	}
	return db
}

func TestAdminHandler_Login(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupTestDB(t)
	defer db.Close()

	adminHandler := NewAdminHandler(db, nil, nil)
	router := gin.New()
	router.POST("/api/login", adminHandler.HandleLogin)

	tests := []struct {
		name       string
		body       map[string]string
		wantStatus int
	}{
		{
			name:       "valid credentials",
			body:       map[string]string{"username": "admin", "password": ""},
			wantStatus: http.StatusOK,
		},
		{
			name:       "invalid password",
			body:       map[string]string{"username": "admin", "password": "wrong"},
			wantStatus: http.StatusUnauthorized,
		},
		{
			name:       "invalid username",
			body:       map[string]string{"username": "wrong", "password": ""},
			wantStatus: http.StatusUnauthorized,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			body, _ := json.Marshal(tt.body)
			req := httptest.NewRequest("POST", "/api/login", bytes.NewReader(body))
			req.Header.Set("Content-Type", "application/json")
			w := httptest.NewRecorder()

			router.ServeHTTP(w, req)

			if w.Code != tt.wantStatus {
				t.Errorf("Expected status %d, got %d. Body: %s", tt.wantStatus, w.Code, w.Body.String())
			}
		})
	}
}

func TestAdminHandler_GetTokens(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupTestDB(t)
	defer db.Close()

	// Add test tokens
	db.CreateToken(&models.Token{Token: "token1", Email: "test1@example.com", IsActive: true})
	db.CreateToken(&models.Token{Token: "token2", Email: "test2@example.com", IsActive: true})

	adminHandler := NewAdminHandler(db, nil, nil)
	router := gin.New()
	router.GET("/api/tokens", adminHandler.HandleGetTokens)

	req := httptest.NewRequest("GET", "/api/tokens", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)

	tokens, ok := response["tokens"].([]interface{})
	if !ok {
		t.Fatal("Expected tokens array in response")
	}
	if len(tokens) != 2 {
		t.Errorf("Expected 2 tokens, got %d", len(tokens))
	}
}

func TestAdminHandler_AddToken(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupTestDB(t)
	defer db.Close()

	lb := services.NewLoadBalancer()
	adminHandler := NewAdminHandler(db, lb, nil)
	router := gin.New()
	router.POST("/api/tokens", adminHandler.HandleAddToken)

	body, _ := json.Marshal(map[string]string{
		"token": "new_test_token",
		"email": "new@example.com",
	})

	req := httptest.NewRequest("POST", "/api/tokens", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d. Body: %s", w.Code, w.Body.String())
	}

	// Verify token was added
	tokens, _ := db.GetAllTokens()
	if len(tokens) != 1 {
		t.Errorf("Expected 1 token in database, got %d", len(tokens))
	}
}

func TestAdminHandler_DeleteToken(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupTestDB(t)
	defer db.Close()

	// Add a token first
	id, _ := db.CreateToken(&models.Token{Token: "to_delete", Email: "delete@example.com", IsActive: true})

	lb := services.NewLoadBalancer()
	adminHandler := NewAdminHandler(db, lb, nil)
	router := gin.New()
	router.DELETE("/api/tokens/:id", adminHandler.HandleDeleteToken)

	req := httptest.NewRequest("DELETE", "/api/tokens/1", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	// Verify token was deleted
	_, err := db.GetTokenByID(id)
	if err == nil {
		t.Error("Expected token to be deleted")
	}
}

func TestAdminHandler_UpdateToken(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupTestDB(t)
	defer db.Close()

	// Add a token first
	db.CreateToken(&models.Token{Token: "to_update", Email: "update@example.com", IsActive: true})

	lb := services.NewLoadBalancer()
	adminHandler := NewAdminHandler(db, lb, nil)
	router := gin.New()
	router.PUT("/api/tokens/:id", adminHandler.HandleUpdateToken)

	body, _ := json.Marshal(map[string]interface{}{
		"is_active":     false,
		"image_enabled": false,
	})

	req := httptest.NewRequest("PUT", "/api/tokens/1", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d. Body: %s", w.Code, w.Body.String())
	}

	// Verify token was updated
	token, _ := db.GetTokenByID(1)
	if token.IsActive {
		t.Error("Expected IsActive to be false")
	}
}

func TestAdminHandler_GetSystemConfig(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupTestDB(t)
	defer db.Close()

	adminHandler := NewAdminHandler(db, nil, nil)
	router := gin.New()
	router.GET("/api/config", adminHandler.HandleGetConfig)

	req := httptest.NewRequest("GET", "/api/config", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)

	if response["api_key"] != "han1234" {
		t.Errorf("Expected default api_key 'han1234', got %v", response["api_key"])
	}
}

func TestAdminHandler_UpdateConfig(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupTestDB(t)
	defer db.Close()

	adminHandler := NewAdminHandler(db, nil, nil)
	router := gin.New()
	router.PUT("/api/config", adminHandler.HandleUpdateConfig)

	body, _ := json.Marshal(map[string]interface{}{
		"api_key":       "new_api_key",
		"cache_enabled": true,
	})

	req := httptest.NewRequest("PUT", "/api/config", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d. Body: %s", w.Code, w.Body.String())
	}

	// Verify config was updated
	cfg, _ := db.GetSystemConfig()
	if cfg.APIKey != "new_api_key" {
		t.Errorf("Expected api_key 'new_api_key', got '%s'", cfg.APIKey)
	}
	if !cfg.CacheEnabled {
		t.Error("Expected cache_enabled to be true")
	}
}

func TestAdminAuthMiddleware(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupTestDB(t)
	defer db.Close()

	middleware := AdminAuthMiddleware(db)
	router := gin.New()
	router.Use(middleware)
	router.GET("/api/protected", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	tests := []struct {
		name       string
		token      string
		wantStatus int
	}{
		{
			name:       "valid token",
			token:      "han1234",
			wantStatus: http.StatusOK,
		},
		{
			name:       "invalid token",
			token:      "wrong_token",
			wantStatus: http.StatusUnauthorized,
		},
		{
			name:       "missing token",
			token:      "",
			wantStatus: http.StatusUnauthorized,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest("GET", "/api/protected", nil)
			if tt.token != "" {
				req.Header.Set("Authorization", "Bearer "+tt.token)
			}
			w := httptest.NewRecorder()

			router.ServeHTTP(w, req)

			if w.Code != tt.wantStatus {
				t.Errorf("Expected status %d, got %d", tt.wantStatus, w.Code)
			}
		})
	}
}
