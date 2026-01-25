package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// WatermarkRemover handles watermark removal from videos
type WatermarkRemover struct {
	parseMethod      string
	customParseURL   string
	customParseToken string
	fallbackEnabled  bool
	httpClient       *http.Client
}

// NewWatermarkRemover creates a new watermark remover
func NewWatermarkRemover(parseMethod, customParseURL, customParseToken string, fallbackEnabled bool) *WatermarkRemover {
	return &WatermarkRemover{
		parseMethod:      parseMethod,
		customParseURL:   customParseURL,
		customParseToken: customParseToken,
		fallbackEnabled:  fallbackEnabled,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// IsEnabled returns whether watermark removal is enabled
func (w *WatermarkRemover) IsEnabled() bool {
	return w.parseMethod != "" && w.customParseURL != ""
}

// RemoveWatermark removes watermark from a video URL
func (w *WatermarkRemover) RemoveWatermark(videoURL string) (string, error) {
	if !w.IsEnabled() {
		return videoURL, nil
	}

	switch w.parseMethod {
	case "third_party":
		return w.removeWatermarkThirdParty(videoURL)
	default:
		return videoURL, nil
	}
}

// removeWatermarkThirdParty uses third-party service to remove watermark
func (w *WatermarkRemover) removeWatermarkThirdParty(videoURL string) (string, error) {
	// Prepare request body
	reqBody := map[string]string{
		"url": videoURL,
	}
	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return w.handleFallback(videoURL, err)
	}

	// Create request
	req, err := http.NewRequest("POST", w.customParseURL, bytes.NewReader(jsonBody))
	if err != nil {
		return w.handleFallback(videoURL, err)
	}

	req.Header.Set("Content-Type", "application/json")
	if w.customParseToken != "" {
		req.Header.Set("Authorization", "Bearer "+w.customParseToken)
	}

	// Send request
	resp, err := w.httpClient.Do(req)
	if err != nil {
		return w.handleFallback(videoURL, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return w.handleFallback(videoURL, fmt.Errorf("third party returned status %d", resp.StatusCode))
	}

	// Parse response
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return w.handleFallback(videoURL, err)
	}

	var result map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		return w.handleFallback(videoURL, err)
	}

	// Extract URL from response
	if url, ok := result["url"].(string); ok && url != "" {
		return url, nil
	}

	// Try alternative field names
	for _, field := range []string{"video_url", "clean_url", "result", "data"} {
		if url, ok := result[field].(string); ok && url != "" {
			return url, nil
		}
	}

	return w.handleFallback(videoURL, fmt.Errorf("no URL in response"))
}

// handleFallback handles errors with optional fallback to original URL
func (w *WatermarkRemover) handleFallback(originalURL string, err error) (string, error) {
	if w.fallbackEnabled {
		return originalURL, nil
	}
	return "", fmt.Errorf("watermark removal failed: %w", err)
}

// ParseVideoURL parses and normalizes a video URL
func (w *WatermarkRemover) ParseVideoURL(url string) string {
	// For now, just return the URL as-is
	// Can be extended to handle special cases
	return url
}

// SetHTTPClient sets a custom HTTP client (useful for testing)
func (w *WatermarkRemover) SetHTTPClient(client *http.Client) {
	w.httpClient = client
}
