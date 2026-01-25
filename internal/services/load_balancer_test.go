package services

import (
	"sync"
	"testing"

	"sora2api-go/internal/models"
)

func TestLoadBalancer_RoundRobin(t *testing.T) {
	lb := NewLoadBalancer()

	tokens := []*models.Token{
		{ID: 1, Token: "token1", IsActive: true, ImageEnabled: true},
		{ID: 2, Token: "token2", IsActive: true, ImageEnabled: true},
		{ID: 3, Token: "token3", IsActive: true, ImageEnabled: true},
	}
	lb.SetTokens(tokens)

	// Get tokens in round-robin order
	t1 := lb.GetNextToken(true, false)
	t2 := lb.GetNextToken(true, false)
	t3 := lb.GetNextToken(true, false)
	t4 := lb.GetNextToken(true, false)

	if t1.ID != 1 {
		t.Errorf("Expected first token ID 1, got %d", t1.ID)
	}
	if t2.ID != 2 {
		t.Errorf("Expected second token ID 2, got %d", t2.ID)
	}
	if t3.ID != 3 {
		t.Errorf("Expected third token ID 3, got %d", t3.ID)
	}
	if t4.ID != 1 {
		t.Errorf("Expected fourth token ID 1 (wrap around), got %d", t4.ID)
	}
}

func TestLoadBalancer_EmptyTokens(t *testing.T) {
	lb := NewLoadBalancer()

	token := lb.GetNextToken(true, false)
	if token != nil {
		t.Error("Expected nil token when no tokens available")
	}
}

func TestLoadBalancer_FilterByCapability(t *testing.T) {
	lb := NewLoadBalancer()

	tokens := []*models.Token{
		{ID: 1, Token: "token1", IsActive: true, ImageEnabled: true, VideoEnabled: false},
		{ID: 2, Token: "token2", IsActive: true, ImageEnabled: false, VideoEnabled: true},
		{ID: 3, Token: "token3", IsActive: true, ImageEnabled: true, VideoEnabled: true},
	}
	lb.SetTokens(tokens)

	// Get image-capable token
	imgToken := lb.GetNextToken(true, false)
	if imgToken == nil {
		t.Fatal("Expected image-capable token")
	}
	if !imgToken.ImageEnabled {
		t.Error("Expected token with ImageEnabled=true")
	}

	// Get video-capable token
	vidToken := lb.GetNextToken(false, true)
	if vidToken == nil {
		t.Fatal("Expected video-capable token")
	}
	if !vidToken.VideoEnabled {
		t.Error("Expected token with VideoEnabled=true")
	}
}

func TestLoadBalancer_ConcurrentAccess(t *testing.T) {
	lb := NewLoadBalancer()

	tokens := []*models.Token{
		{ID: 1, Token: "token1", IsActive: true, ImageEnabled: true},
		{ID: 2, Token: "token2", IsActive: true, ImageEnabled: true},
	}
	lb.SetTokens(tokens)

	var wg sync.WaitGroup
	results := make(chan int64, 100)

	// Concurrent access
	for i := 0; i < 100; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			token := lb.GetNextToken(true, false)
			if token != nil {
				results <- token.ID
			}
		}()
	}

	wg.Wait()
	close(results)

	count := 0
	for range results {
		count++
	}

	if count != 100 {
		t.Errorf("Expected 100 results, got %d", count)
	}
}

func TestLoadBalancer_UpdateTokens(t *testing.T) {
	lb := NewLoadBalancer()

	tokens1 := []*models.Token{
		{ID: 1, Token: "token1", IsActive: true, ImageEnabled: true},
	}
	lb.SetTokens(tokens1)

	t1 := lb.GetNextToken(true, false)
	if t1.ID != 1 {
		t.Errorf("Expected token ID 1, got %d", t1.ID)
	}

	// Update tokens
	tokens2 := []*models.Token{
		{ID: 2, Token: "token2", IsActive: true, ImageEnabled: true},
		{ID: 3, Token: "token3", IsActive: true, ImageEnabled: true},
	}
	lb.SetTokens(tokens2)

	t2 := lb.GetNextToken(true, false)
	if t2.ID != 2 && t2.ID != 3 {
		t.Errorf("Expected token ID 2 or 3, got %d", t2.ID)
	}
}

func TestLoadBalancer_GetTokenCount(t *testing.T) {
	lb := NewLoadBalancer()

	if lb.GetTokenCount() != 0 {
		t.Errorf("Expected 0 tokens, got %d", lb.GetTokenCount())
	}

	tokens := []*models.Token{
		{ID: 1, Token: "token1", IsActive: true},
		{ID: 2, Token: "token2", IsActive: true},
	}
	lb.SetTokens(tokens)

	if lb.GetTokenCount() != 2 {
		t.Errorf("Expected 2 tokens, got %d", lb.GetTokenCount())
	}
}
