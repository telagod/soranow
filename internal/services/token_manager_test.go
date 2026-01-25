package services

import (
	"testing"
	"time"

	"soranow/internal/database"
	"soranow/internal/models"
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

func TestTokenManager_NewManager(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	lb := NewLoadBalancer()
	cm := NewConcurrencyManager()

	manager := NewTokenManager(db, lb, cm)

	if manager == nil {
		t.Fatal("Expected non-nil manager")
	}
}

func TestTokenManager_RecordUsage(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	lb := NewLoadBalancer()
	cm := NewConcurrencyManager()
	manager := NewTokenManager(db, lb, cm)

	// Create a token
	token := &models.Token{
		Token:    "test_token",
		Email:    "test@example.com",
		IsActive: true,
	}
	id, _ := db.CreateToken(token)

	// Record image usage
	err := manager.RecordUsage(id, false)
	if err != nil {
		t.Fatalf("RecordUsage failed: %v", err)
	}

	// Verify usage was recorded
	updated, _ := db.GetTokenByID(id)
	if updated.TotalImageCount != 1 {
		t.Errorf("Expected TotalImageCount 1, got %d", updated.TotalImageCount)
	}

	// Record video usage
	err = manager.RecordUsage(id, true)
	if err != nil {
		t.Fatalf("RecordUsage failed: %v", err)
	}

	updated, _ = db.GetTokenByID(id)
	if updated.TotalVideoCount != 1 {
		t.Errorf("Expected TotalVideoCount 1, got %d", updated.TotalVideoCount)
	}
}

func TestTokenManager_RecordError(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	lb := NewLoadBalancer()
	cm := NewConcurrencyManager()
	manager := NewTokenManager(db, lb, cm)

	// Create a token
	token := &models.Token{
		Token:    "test_token",
		Email:    "test@example.com",
		IsActive: true,
	}
	id, _ := db.CreateToken(token)

	// Record error
	err := manager.RecordError(id)
	if err != nil {
		t.Fatalf("RecordError failed: %v", err)
	}

	// Verify error was recorded
	updated, _ := db.GetTokenByID(id)
	if updated.TotalErrorCount != 1 {
		t.Errorf("Expected TotalErrorCount 1, got %d", updated.TotalErrorCount)
	}
	if updated.ConsecutiveErrors != 1 {
		t.Errorf("Expected ConsecutiveErrors 1, got %d", updated.ConsecutiveErrors)
	}
}

func TestTokenManager_RecordSuccess(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	lb := NewLoadBalancer()
	cm := NewConcurrencyManager()
	manager := NewTokenManager(db, lb, cm)

	// Create a token with some errors
	token := &models.Token{
		Token:             "test_token",
		Email:             "test@example.com",
		IsActive:          true,
		ConsecutiveErrors: 3,
	}
	id, _ := db.CreateToken(token)

	// Record success
	err := manager.RecordSuccess(id, false)
	if err != nil {
		t.Fatalf("RecordSuccess failed: %v", err)
	}

	// Verify consecutive errors was reset
	updated, _ := db.GetTokenByID(id)
	if updated.ConsecutiveErrors != 0 {
		t.Errorf("Expected ConsecutiveErrors 0, got %d", updated.ConsecutiveErrors)
	}
}

func TestTokenManager_DisableToken(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	lb := NewLoadBalancer()
	cm := NewConcurrencyManager()
	manager := NewTokenManager(db, lb, cm)

	// Create a token
	token := &models.Token{
		Token:    "test_token",
		Email:    "test@example.com",
		IsActive: true,
	}
	id, _ := db.CreateToken(token)

	// Disable token
	err := manager.DisableToken(id)
	if err != nil {
		t.Fatalf("DisableToken failed: %v", err)
	}

	// Verify token was disabled
	updated, _ := db.GetTokenByID(id)
	if updated.IsActive {
		t.Error("Expected token to be disabled")
	}
}

func TestTokenManager_CooldownToken(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	lb := NewLoadBalancer()
	cm := NewConcurrencyManager()
	manager := NewTokenManager(db, lb, cm)

	// Create a token
	token := &models.Token{
		Token:    "test_token",
		Email:    "test@example.com",
		IsActive: true,
	}
	id, _ := db.CreateToken(token)

	// Set cooldown
	duration := 5 * time.Minute
	err := manager.CooldownToken(id, duration)
	if err != nil {
		t.Fatalf("CooldownToken failed: %v", err)
	}

	// Verify cooldown was set
	updated, _ := db.GetTokenByID(id)
	if updated.CooledUntil == nil {
		t.Error("Expected CooledUntil to be set")
	}
}

func TestTokenManager_RefreshLoadBalancer(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	lb := NewLoadBalancer()
	cm := NewConcurrencyManager()
	manager := NewTokenManager(db, lb, cm)

	// Create tokens
	db.CreateToken(&models.Token{Token: "token1", Email: "test1@example.com", IsActive: true})
	db.CreateToken(&models.Token{Token: "token2", Email: "test2@example.com", IsActive: true})
	db.CreateToken(&models.Token{Token: "token3", Email: "test3@example.com", IsActive: false})

	// Refresh load balancer
	manager.RefreshLoadBalancer()

	// Verify only active tokens are loaded
	if lb.GetTokenCount() != 2 {
		t.Errorf("Expected 2 active tokens in load balancer, got %d", lb.GetTokenCount())
	}
}
