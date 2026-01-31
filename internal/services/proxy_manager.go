package services

import (
	"bufio"
	"fmt"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"sync"
)

// ProxyManager manages proxy pool with rotation support
type ProxyManager struct {
	mu            sync.RWMutex
	proxyPool     []string
	poolIndex     int
	proxyFilePath string
	enabled       bool
	poolEnabled   bool
	singleProxy   string
}

// NewProxyManager creates a new proxy manager
func NewProxyManager(dataDir string) *ProxyManager {
	pm := &ProxyManager{
		proxyPool:     make([]string, 0),
		poolIndex:     0,
		proxyFilePath: filepath.Join(dataDir, "proxy.txt"),
	}
	return pm
}

// SetEnabled enables or disables proxy
func (pm *ProxyManager) SetEnabled(enabled bool) {
	pm.mu.Lock()
	defer pm.mu.Unlock()
	pm.enabled = enabled
}

// SetPoolEnabled enables or disables proxy pool rotation
func (pm *ProxyManager) SetPoolEnabled(enabled bool) {
	pm.mu.Lock()
	defer pm.mu.Unlock()
	pm.poolEnabled = enabled
	if enabled {
		pm.loadProxyPool()
	}
}

// SetSingleProxy sets a single proxy URL
func (pm *ProxyManager) SetSingleProxy(proxyURL string) {
	pm.mu.Lock()
	defer pm.mu.Unlock()
	pm.singleProxy = proxyURL
}

// GetProxyURL returns the next proxy URL based on configuration
func (pm *ProxyManager) GetProxyURL() string {
	pm.mu.Lock()
	defer pm.mu.Unlock()

	if !pm.enabled {
		return ""
	}

	if pm.poolEnabled && len(pm.proxyPool) > 0 {
		proxy := pm.proxyPool[pm.poolIndex]
		pm.poolIndex = (pm.poolIndex + 1) % len(pm.proxyPool)
		return proxy
	}

	return pm.singleProxy
}

// ReloadPool reloads the proxy pool from file
func (pm *ProxyManager) ReloadPool() (int, error) {
	pm.mu.Lock()
	defer pm.mu.Unlock()
	return pm.loadProxyPool()
}

// GetPoolCount returns the number of proxies in the pool
func (pm *ProxyManager) GetPoolCount() int {
	pm.mu.RLock()
	defer pm.mu.RUnlock()
	return len(pm.proxyPool)
}

// loadProxyPool loads proxies from file (must be called with lock held)
func (pm *ProxyManager) loadProxyPool() (int, error) {
	pm.proxyPool = make([]string, 0)
	pm.poolIndex = 0

	file, err := os.Open(pm.proxyFilePath)
	if err != nil {
		if os.IsNotExist(err) {
			return 0, nil
		}
		return 0, fmt.Errorf("failed to open proxy file: %w", err)
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		proxyURL := pm.parseProxyLine(line)
		if proxyURL != "" {
			pm.proxyPool = append(pm.proxyPool, proxyURL)
		}
	}

	if err := scanner.Err(); err != nil {
		return 0, fmt.Errorf("error reading proxy file: %w", err)
	}

	return len(pm.proxyPool), nil
}

// parseProxyLine parses a proxy line and converts to standard URL format
// Supported formats:
// - http://host:port
// - http://user:pass@host:port
// - socks5://host:port
// - socks5://user:pass@host:port
// - host:port (assumes http)
// - host:port:user:pass (IP:端口:用户名:密码 format)
func (pm *ProxyManager) parseProxyLine(line string) string {
	line = strings.TrimSpace(line)
	if line == "" {
		return ""
	}

	// Already a URL format
	if strings.HasPrefix(line, "http://") ||
		strings.HasPrefix(line, "https://") ||
		strings.HasPrefix(line, "socks5://") {
		return line
	}

	parts := strings.Split(line, ":")

	// Format: host:port
	if len(parts) == 2 {
		host, port := parts[0], parts[1]
		return fmt.Sprintf("http://%s:%s", host, port)
	}

	// Format: host:port:user:pass
	if len(parts) == 4 {
		host, port, user, pass := parts[0], parts[1], parts[2], parts[3]
		return fmt.Sprintf("http://%s:%s@%s:%s",
			url.QueryEscape(user), url.QueryEscape(pass), host, port)
	}

	// Unknown format, return as-is
	return line
}

// IsEnabled returns whether proxy is enabled
func (pm *ProxyManager) IsEnabled() bool {
	pm.mu.RLock()
	defer pm.mu.RUnlock()
	return pm.enabled
}

// IsPoolEnabled returns whether proxy pool is enabled
func (pm *ProxyManager) IsPoolEnabled() bool {
	pm.mu.RLock()
	defer pm.mu.RUnlock()
	return pm.poolEnabled
}

// GetConfig returns current proxy configuration
func (pm *ProxyManager) GetConfig() (enabled bool, poolEnabled bool, singleProxy string, poolCount int) {
	pm.mu.RLock()
	defer pm.mu.RUnlock()
	return pm.enabled, pm.poolEnabled, pm.singleProxy, len(pm.proxyPool)
}
