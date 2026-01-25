package services

import (
	"sync"
	"sync/atomic"

	"sora2api-go/internal/models"
)

// LoadBalancer implements round-robin load balancing for tokens
type LoadBalancer struct {
	tokens  []*models.Token
	counter uint64
	mu      sync.RWMutex
}

// NewLoadBalancer creates a new load balancer instance
func NewLoadBalancer() *LoadBalancer {
	return &LoadBalancer{
		tokens: make([]*models.Token, 0),
	}
}

// SetTokens updates the token list
func (lb *LoadBalancer) SetTokens(tokens []*models.Token) {
	lb.mu.Lock()
	defer lb.mu.Unlock()
	lb.tokens = tokens
}

// GetNextToken returns the next available token using round-robin
// forImage: filter tokens that support image generation
// forVideo: filter tokens that support video generation
func (lb *LoadBalancer) GetNextToken(forImage, forVideo bool) *models.Token {
	lb.mu.RLock()
	defer lb.mu.RUnlock()

	if len(lb.tokens) == 0 {
		return nil
	}

	// Filter tokens based on capability
	var eligible []*models.Token
	for _, t := range lb.tokens {
		if !t.IsActive || t.IsExpired {
			continue
		}
		if forImage && !t.ImageEnabled {
			continue
		}
		if forVideo && !t.VideoEnabled {
			continue
		}
		eligible = append(eligible, t)
	}

	if len(eligible) == 0 {
		return nil
	}

	// Atomic increment for lock-free round-robin
	idx := atomic.AddUint64(&lb.counter, 1) - 1
	return eligible[idx%uint64(len(eligible))]
}

// GetTokenCount returns the number of tokens
func (lb *LoadBalancer) GetTokenCount() int {
	lb.mu.RLock()
	defer lb.mu.RUnlock()
	return len(lb.tokens)
}

// GetTokenByID returns a token by its ID
func (lb *LoadBalancer) GetTokenByID(id int64) *models.Token {
	lb.mu.RLock()
	defer lb.mu.RUnlock()

	for _, t := range lb.tokens {
		if t.ID == id {
			return t
		}
	}
	return nil
}
