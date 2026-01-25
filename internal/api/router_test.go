package api

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestSetupRouter(t *testing.T) {
	gin.SetMode(gin.TestMode)

	router := SetupRouter("test_api_key", nil, nil, nil)

	if router == nil {
		t.Fatal("Expected non-nil router")
	}
}

func TestRouter_ModelsEndpoint(t *testing.T) {
	gin.SetMode(gin.TestMode)

	router := SetupRouter("test_api_key", nil, nil, nil)

	req := httptest.NewRequest("GET", "/v1/models", nil)
	req.Header.Set("Authorization", "Bearer test_api_key")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}
}

func TestRouter_ModelsEndpoint_Unauthorized(t *testing.T) {
	gin.SetMode(gin.TestMode)

	router := SetupRouter("test_api_key", nil, nil, nil)

	req := httptest.NewRequest("GET", "/v1/models", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("Expected status 401, got %d", w.Code)
	}
}

func TestRouter_HealthEndpoint(t *testing.T) {
	gin.SetMode(gin.TestMode)

	router := SetupRouter("test_api_key", nil, nil, nil)

	req := httptest.NewRequest("GET", "/health", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}
}

func TestRouter_CORSHeaders(t *testing.T) {
	gin.SetMode(gin.TestMode)

	router := SetupRouter("test_api_key", nil, nil, nil)

	req := httptest.NewRequest("OPTIONS", "/v1/models", nil)
	req.Header.Set("Origin", "http://example.com")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Header().Get("Access-Control-Allow-Origin") != "*" {
		t.Error("Expected CORS headers")
	}
}
