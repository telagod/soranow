package services

import (
	"fmt"
	"os"
	"path/filepath"
	"sync"
	"time"
)

// FileCache manages file caching for generated content
type FileCache struct {
	baseDir  string
	timeout  int // seconds
	baseURL  string
	mu       sync.RWMutex
	files    map[string]time.Time // filename -> creation time
}

// NewFileCache creates a new file cache
func NewFileCache(baseDir string, timeout int, baseURL string) *FileCache {
	// Create base directory if not exists
	os.MkdirAll(baseDir, 0755)

	cache := &FileCache{
		baseDir: baseDir,
		timeout: timeout,
		baseURL: baseURL,
		files:   make(map[string]time.Time),
	}

	// Load existing files
	cache.loadExistingFiles()

	return cache
}

// loadExistingFiles loads existing files from disk
func (c *FileCache) loadExistingFiles() {
	filepath.Walk(c.baseDir, func(path string, info os.FileInfo, err error) error {
		if err != nil || info.IsDir() {
			return nil
		}
		relPath, _ := filepath.Rel(c.baseDir, path)
		c.files[relPath] = info.ModTime()
		return nil
	})
}

// Save saves content to cache and returns the URL
func (c *FileCache) Save(filename string, content []byte) (string, error) {
	c.mu.Lock()
	defer c.mu.Unlock()

	filePath := filepath.Join(c.baseDir, filename)

	// Create directory if needed
	dir := filepath.Dir(filePath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return "", fmt.Errorf("failed to create directory: %w", err)
	}

	// Write file
	if err := os.WriteFile(filePath, content, 0644); err != nil {
		return "", fmt.Errorf("failed to write file: %w", err)
	}

	c.files[filename] = time.Now()

	return c.GetURL(filename), nil
}

// Get retrieves content from cache
func (c *FileCache) Get(filename string) ([]byte, error) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	filePath := filepath.Join(c.baseDir, filename)
	content, err := os.ReadFile(filePath)
	if err != nil {
		return nil, fmt.Errorf("file not found: %w", err)
	}

	return content, nil
}

// Delete removes a file from cache
func (c *FileCache) Delete(filename string) error {
	c.mu.Lock()
	defer c.mu.Unlock()

	filePath := filepath.Join(c.baseDir, filename)
	if err := os.Remove(filePath); err != nil {
		return fmt.Errorf("failed to delete file: %w", err)
	}

	delete(c.files, filename)
	return nil
}

// GetURL returns the URL for a cached file
func (c *FileCache) GetURL(filename string) string {
	return fmt.Sprintf("%s/cache/%s", c.baseURL, filename)
}

// Exists checks if a file exists in cache
func (c *FileCache) Exists(filename string) bool {
	c.mu.RLock()
	defer c.mu.RUnlock()

	_, exists := c.files[filename]
	return exists
}

// List returns all cached files
func (c *FileCache) List() ([]string, error) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	files := make([]string, 0, len(c.files))
	for filename := range c.files {
		files = append(files, filename)
	}
	return files, nil
}

// Cleanup removes expired files and returns the count of removed files
func (c *FileCache) Cleanup() int {
	c.mu.Lock()
	defer c.mu.Unlock()

	now := time.Now()
	expiry := time.Duration(c.timeout) * time.Second
	cleaned := 0

	for filename, createdAt := range c.files {
		if now.Sub(createdAt) > expiry {
			filePath := filepath.Join(c.baseDir, filename)
			if err := os.Remove(filePath); err == nil {
				delete(c.files, filename)
				cleaned++
			}
		}
	}

	return cleaned
}

// StartCleanupRoutine starts a background goroutine to periodically clean up expired files
func (c *FileCache) StartCleanupRoutine(interval time.Duration) {
	go func() {
		ticker := time.NewTicker(interval)
		defer ticker.Stop()

		for range ticker.C {
			c.Cleanup()
		}
	}()
}

// GetStats returns cache statistics
func (c *FileCache) GetStats() map[string]interface{} {
	c.mu.RLock()
	defer c.mu.RUnlock()

	var totalSize int64
	for filename := range c.files {
		filePath := filepath.Join(c.baseDir, filename)
		if info, err := os.Stat(filePath); err == nil {
			totalSize += info.Size()
		}
	}

	return map[string]interface{}{
		"file_count": len(c.files),
		"total_size": totalSize,
		"base_dir":   c.baseDir,
		"timeout":    c.timeout,
	}
}
