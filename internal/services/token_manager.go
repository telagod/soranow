package services

import (
	"time"

	"sora2api-go/internal/database"
)

// TokenManager manages token lifecycle and statistics
type TokenManager struct {
	db           *database.DB
	loadBalancer *LoadBalancer
	concurrency  *ConcurrencyManager
}

// NewTokenManager creates a new token manager
func NewTokenManager(db *database.DB, lb *LoadBalancer, cm *ConcurrencyManager) *TokenManager {
	return &TokenManager{
		db:           db,
		loadBalancer: lb,
		concurrency:  cm,
	}
}

// RecordUsage records a successful usage of a token
func (m *TokenManager) RecordUsage(tokenID int64, isVideo bool) error {
	token, err := m.db.GetTokenByID(tokenID)
	if err != nil {
		return err
	}

	today := time.Now().Format("2006-01-02")

	// Reset daily counters if new day
	if token.TodayDate != today {
		token.TodayDate = today
		token.TodayImageCount = 0
		token.TodayVideoCount = 0
		token.TodayErrorCount = 0
	}

	if isVideo {
		token.TotalVideoCount++
		token.TodayVideoCount++
	} else {
		token.TotalImageCount++
		token.TodayImageCount++
	}

	now := time.Now()
	token.LastUsedAt = &now

	return m.db.UpdateToken(token)
}

// RecordError records an error for a token
func (m *TokenManager) RecordError(tokenID int64) error {
	token, err := m.db.GetTokenByID(tokenID)
	if err != nil {
		return err
	}

	today := time.Now().Format("2006-01-02")

	// Reset daily counters if new day
	if token.TodayDate != today {
		token.TodayDate = today
		token.TodayImageCount = 0
		token.TodayVideoCount = 0
		token.TodayErrorCount = 0
	}

	token.TotalErrorCount++
	token.TodayErrorCount++
	token.ConsecutiveErrors++

	now := time.Now()
	token.LastErrorAt = &now

	return m.db.UpdateToken(token)
}

// RecordSuccess records a successful operation and resets consecutive errors
func (m *TokenManager) RecordSuccess(tokenID int64, isVideo bool) error {
	token, err := m.db.GetTokenByID(tokenID)
	if err != nil {
		return err
	}

	token.ConsecutiveErrors = 0

	return m.db.UpdateToken(token)
}

// DisableToken disables a token
func (m *TokenManager) DisableToken(tokenID int64) error {
	token, err := m.db.GetTokenByID(tokenID)
	if err != nil {
		return err
	}

	token.IsActive = false

	if err := m.db.UpdateToken(token); err != nil {
		return err
	}

	// Refresh load balancer
	m.RefreshLoadBalancer()

	return nil
}

// EnableToken enables a token
func (m *TokenManager) EnableToken(tokenID int64) error {
	token, err := m.db.GetTokenByID(tokenID)
	if err != nil {
		return err
	}

	token.IsActive = true
	token.ConsecutiveErrors = 0

	if err := m.db.UpdateToken(token); err != nil {
		return err
	}

	// Refresh load balancer
	m.RefreshLoadBalancer()

	return nil
}

// CooldownToken sets a cooldown period for a token
func (m *TokenManager) CooldownToken(tokenID int64, duration time.Duration) error {
	token, err := m.db.GetTokenByID(tokenID)
	if err != nil {
		return err
	}

	cooldownUntil := time.Now().Add(duration)
	token.CooledUntil = &cooldownUntil

	if err := m.db.UpdateToken(token); err != nil {
		return err
	}

	// Refresh load balancer
	m.RefreshLoadBalancer()

	return nil
}

// ClearCooldown clears the cooldown for a token
func (m *TokenManager) ClearCooldown(tokenID int64) error {
	token, err := m.db.GetTokenByID(tokenID)
	if err != nil {
		return err
	}

	token.CooledUntil = nil

	if err := m.db.UpdateToken(token); err != nil {
		return err
	}

	// Refresh load balancer
	m.RefreshLoadBalancer()

	return nil
}

// RefreshLoadBalancer refreshes the load balancer with current active tokens
func (m *TokenManager) RefreshLoadBalancer() {
	if m.loadBalancer == nil {
		return
	}

	tokens, err := m.db.GetActiveTokens()
	if err != nil {
		return
	}

	m.loadBalancer.SetTokens(tokens)

	// Update concurrency limits
	if m.concurrency != nil {
		for _, token := range tokens {
			if token.ImageConcurrency > 0 {
				m.concurrency.SetLimit(token.ID, true, token.ImageConcurrency)
			}
			if token.VideoConcurrency > 0 {
				m.concurrency.SetLimit(token.ID, false, token.VideoConcurrency)
			}
		}
	}
}

// CheckAndDisableErrorTokens checks tokens with too many consecutive errors and disables them
func (m *TokenManager) CheckAndDisableErrorTokens(threshold int) (int, error) {
	tokens, err := m.db.GetAllTokens()
	if err != nil {
		return 0, err
	}

	disabled := 0
	for _, token := range tokens {
		if token.IsActive && token.ConsecutiveErrors >= threshold {
			token.IsActive = false
			if err := m.db.UpdateToken(token); err == nil {
				disabled++
			}
		}
	}

	if disabled > 0 {
		m.RefreshLoadBalancer()
	}

	return disabled, nil
}

// ClearExpiredCooldowns clears cooldowns that have expired
func (m *TokenManager) ClearExpiredCooldowns() (int, error) {
	tokens, err := m.db.GetAllTokens()
	if err != nil {
		return 0, err
	}

	cleared := 0
	now := time.Now()

	for _, token := range tokens {
		if token.CooledUntil != nil && token.CooledUntil.Before(now) {
			token.CooledUntil = nil
			if err := m.db.UpdateToken(token); err == nil {
				cleared++
			}
		}
	}

	if cleared > 0 {
		m.RefreshLoadBalancer()
	}

	return cleared, nil
}

// GetTokenStats returns statistics for all tokens
func (m *TokenManager) GetTokenStats() (map[string]interface{}, error) {
	tokens, err := m.db.GetAllTokens()
	if err != nil {
		return nil, err
	}

	var totalImages, totalVideos, totalErrors int
	var activeCount, expiredCount, cooledCount int

	for _, token := range tokens {
		totalImages += token.TotalImageCount
		totalVideos += token.TotalVideoCount
		totalErrors += token.TotalErrorCount

		if token.IsActive {
			activeCount++
		}
		if token.IsExpired {
			expiredCount++
		}
		if token.CooledUntil != nil && token.CooledUntil.After(time.Now()) {
			cooledCount++
		}
	}

	return map[string]interface{}{
		"total_tokens":   len(tokens),
		"active_tokens":  activeCount,
		"expired_tokens": expiredCount,
		"cooled_tokens":  cooledCount,
		"total_images":   totalImages,
		"total_videos":   totalVideos,
		"total_errors":   totalErrors,
	}, nil
}
