package services

import (
	"sync"
	"time"

	tls_client "github.com/bogdanfinn/tls-client"
	"github.com/bogdanfinn/tls-client/profiles"
)

// SessionManager manages TLS client sessions per token for cookie persistence
type SessionManager struct {
	mu       sync.RWMutex
	sessions map[string]*ManagedSession
	timeout  int
	maxAge   time.Duration
}

// ManagedSession holds a TLS client with metadata
type ManagedSession struct {
	Client    tls_client.HttpClient
	CreatedAt time.Time
	LastUsed  time.Time
	ProxyURL  string
}

// NewSessionManager creates a new session manager
func NewSessionManager(timeout int) *SessionManager {
	sm := &SessionManager{
		sessions: make(map[string]*ManagedSession),
		timeout:  timeout,
		maxAge:   30 * time.Minute,
	}

	// Start cleanup goroutine
	go sm.cleanupLoop()

	return sm
}

// GetSession returns or creates a TLS client for the given token
func (sm *SessionManager) GetSession(token string, proxyURL string) (tls_client.HttpClient, error) {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	session, exists := sm.sessions[token]

	// Reuse existing session if proxy hasn't changed
	if exists && session.ProxyURL == proxyURL {
		session.LastUsed = time.Now()
		return session.Client, nil
	}

	// Create new TLS client
	client, err := sm.createTLSClient(proxyURL)
	if err != nil {
		return nil, err
	}

	sm.sessions[token] = &ManagedSession{
		Client:    client,
		CreatedAt: time.Now(),
		LastUsed:  time.Now(),
		ProxyURL:  proxyURL,
	}

	return client, nil
}

// createTLSClient creates a new TLS client with Firefox profile
func (sm *SessionManager) createTLSClient(proxyURL string) (tls_client.HttpClient, error) {
	jar := tls_client.NewCookieJar()
	options := []tls_client.HttpClientOption{
		tls_client.WithTimeoutSeconds(sm.timeout),
		tls_client.WithClientProfile(profiles.Firefox_132),
		tls_client.WithNotFollowRedirects(),
		tls_client.WithCookieJar(jar),
	}

	client, err := tls_client.NewHttpClient(tls_client.NewNoopLogger(), options...)
	if err != nil {
		return nil, err
	}

	if proxyURL != "" {
		if err := client.SetProxy(proxyURL); err != nil {
			return nil, err
		}
	}

	return client, nil
}

// InvalidateSession removes a session for the given token
func (sm *SessionManager) InvalidateSession(token string) {
	sm.mu.Lock()
	defer sm.mu.Unlock()
	delete(sm.sessions, token)
}

// cleanupLoop periodically removes stale sessions
func (sm *SessionManager) cleanupLoop() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		sm.cleanup()
	}
}

// cleanup removes sessions that haven't been used recently
func (sm *SessionManager) cleanup() {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	now := time.Now()
	for token, session := range sm.sessions {
		if now.Sub(session.LastUsed) > sm.maxAge {
			delete(sm.sessions, token)
		}
	}
}

// GetSessionCount returns the number of active sessions
func (sm *SessionManager) GetSessionCount() int {
	sm.mu.RLock()
	defer sm.mu.RUnlock()
	return len(sm.sessions)
}

// SetMaxAge sets the maximum age for sessions
func (sm *SessionManager) SetMaxAge(maxAge time.Duration) {
	sm.mu.Lock()
	defer sm.mu.Unlock()
	sm.maxAge = maxAge
}
