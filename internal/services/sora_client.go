package services

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"time"
)

const (
	ChatGPTBaseURL = "https://chatgpt.com"
	SentinelFlow   = "sora_2_create_task"
)

// Mobile user agents for API requests
var MobileUserAgents = []string{
	"Sora/1.2026.007 (Android 15; 24122RKC7C; build 2600700)",
	"Sora/1.2026.006 (Android 14; SM-S928B; build 2600600)",
}

// TaskStatus represents the status of a generation task
type TaskStatus struct {
	ID        string   `json:"id"`
	Status    string   `json:"status"`
	Progress  float64  `json:"progress"`
	URLs      []string `json:"urls,omitempty"`
	Error     string   `json:"error,omitempty"`
}

// SoraClient handles communication with the Sora API
type SoraClient struct {
	baseURL    string
	timeout    int
	httpClient *http.Client
	proxyURL   string
}

// NewSoraClient creates a new Sora API client
func NewSoraClient(baseURL string, timeout int, httpClient *http.Client) *SoraClient {
	if httpClient == nil {
		httpClient = &http.Client{
			Timeout: time.Duration(timeout) * time.Second,
			Transport: &http.Transport{
				MaxIdleConns:        100,
				MaxIdleConnsPerHost: 20,
				IdleConnTimeout:     90 * time.Second,
			},
		}
	}
	return &SoraClient{
		baseURL:    baseURL,
		timeout:    timeout,
		httpClient: httpClient,
	}
}

// GetPowParseTime generates time string for PoW (EST timezone)
func GetPowParseTime() string {
	// EST is UTC-5
	loc := time.FixedZone("EST", -5*60*60)
	now := time.Now().In(loc)
	return now.Format("Mon Jan 02 2006 15:04:05") + " GMT-0500 (Eastern Standard Time)"
}

// BuildImagePayload builds the payload for image generation
func (c *SoraClient) BuildImagePayload(prompt string, width, height int, mediaID string) map[string]interface{} {
	operation := "simple_compose"
	inpaintItems := []map[string]interface{}{}
	
	if mediaID != "" {
		operation = "remix"
		inpaintItems = []map[string]interface{}{
			{
				"type":            "image",
				"frame_index":     0,
				"upload_media_id": mediaID,
			},
		}
	}

	return map[string]interface{}{
		"type":          "image_gen",
		"operation":     operation,
		"prompt":        prompt,
		"width":         width,
		"height":        height,
		"n_variants":    1,
		"n_frames":      1,
		"inpaint_items": inpaintItems,
	}
}

// BuildVideoPayload builds the payload for video generation
func (c *SoraClient) BuildVideoPayload(prompt, orientation, mediaID string, nFrames int, styleID, model, size string) map[string]interface{} {
	inpaintItems := []map[string]interface{}{}
	
	if mediaID != "" {
		inpaintItems = []map[string]interface{}{
			{
				"kind":      "upload",
				"upload_id": mediaID,
			},
		}
	}

	payload := map[string]interface{}{
		"kind":          "video",
		"prompt":        prompt,
		"orientation":   orientation,
		"size":          size,
		"n_frames":      nFrames,
		"model":         model,
		"inpaint_items": inpaintItems,
	}
	
	if styleID != "" {
		payload["style_id"] = styleID
	}

	return payload
}

// ParseTaskResponse parses the task creation response
func ParseTaskResponse(body []byte) (string, error) {
	var result map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		return "", err
	}
	
	id, ok := result["id"].(string)
	if !ok || id == "" {
		if errMsg, ok := result["error"].(string); ok {
			return "", errors.New(errMsg)
		}
		return "", errors.New("no task ID in response")
	}
	
	return id, nil
}

// makeRequest makes an HTTP request to the Sora API
func (c *SoraClient) makeRequest(method, endpoint, token string, body interface{}, sentinelToken string) ([]byte, error) {
	var reqBody io.Reader
	if body != nil {
		jsonBody, err := json.Marshal(body)
		if err != nil {
			return nil, err
		}
		reqBody = bytes.NewReader(jsonBody)
	}

	url := c.baseURL + endpoint
	req, err := http.NewRequest(method, url, reqBody)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", MobileUserAgents[0])
	
	if sentinelToken != "" {
		req.Header.Set("openai-sentinel-token", sentinelToken)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("API error %d: %s", resp.StatusCode, string(respBody))
	}

	return respBody, nil
}

// GenerateImage starts an image generation task
func (c *SoraClient) GenerateImage(prompt, token string, width, height int, mediaID string, tokenID int64) (string, error) {
	payload := c.BuildImagePayload(prompt, width, height, mediaID)
	
	// TODO: Generate sentinel token for production
	sentinelToken := ""
	
	respBody, err := c.makeRequest("POST", "/video_gen", token, payload, sentinelToken)
	if err != nil {
		return "", err
	}
	
	return ParseTaskResponse(respBody)
}

// GenerateVideo starts a video generation task
func (c *SoraClient) GenerateVideo(prompt, token, orientation, mediaID string, nFrames int, styleID, model, size string, tokenID int64) (string, error) {
	payload := c.BuildVideoPayload(prompt, orientation, mediaID, nFrames, styleID, model, size)
	
	// TODO: Generate sentinel token for production
	sentinelToken := ""
	
	respBody, err := c.makeRequest("POST", "/nf/create", token, payload, sentinelToken)
	if err != nil {
		return "", err
	}
	
	return ParseTaskResponse(respBody)
}

// GetTaskStatus gets the status of a generation task
func (c *SoraClient) GetTaskStatus(taskID, token string, isImage bool, tokenID int64) (*TaskStatus, error) {
	var endpoint string
	if isImage {
		endpoint = fmt.Sprintf("/v2/task/%s", taskID)
	} else {
		endpoint = fmt.Sprintf("/project_y/task/%s", taskID)
	}
	
	respBody, err := c.makeRequest("GET", endpoint, token, nil, "")
	if err != nil {
		return nil, err
	}
	
	var status TaskStatus
	if err := json.Unmarshal(respBody, &status); err != nil {
		return nil, err
	}
	
	return &status, nil
}

// GetImageTasks gets recent image generation tasks
func (c *SoraClient) GetImageTasks(token string, limit int, tokenID int64) ([]map[string]interface{}, error) {
	endpoint := fmt.Sprintf("/v2/recent_tasks?limit=%d", limit)
	
	respBody, err := c.makeRequest("GET", endpoint, token, nil, "")
	if err != nil {
		return nil, err
	}
	
	var result map[string]interface{}
	if err := json.Unmarshal(respBody, &result); err != nil {
		return nil, err
	}
	
	tasks, ok := result["tasks"].([]interface{})
	if !ok {
		return []map[string]interface{}{}, nil
	}
	
	var taskList []map[string]interface{}
	for _, t := range tasks {
		if task, ok := t.(map[string]interface{}); ok {
			taskList = append(taskList, task)
		}
	}
	
	return taskList, nil
}

// GetVideoDrafts gets recent video drafts
func (c *SoraClient) GetVideoDrafts(token string, limit int, tokenID int64) ([]map[string]interface{}, error) {
	endpoint := fmt.Sprintf("/project_y/profile/drafts?limit=%d", limit)
	
	respBody, err := c.makeRequest("GET", endpoint, token, nil, "")
	if err != nil {
		return nil, err
	}
	
	var result map[string]interface{}
	if err := json.Unmarshal(respBody, &result); err != nil {
		return nil, err
	}
	
	drafts, ok := result["drafts"].([]interface{})
	if !ok {
		return []map[string]interface{}{}, nil
	}
	
	var draftList []map[string]interface{}
	for _, d := range drafts {
		if draft, ok := d.(map[string]interface{}); ok {
			draftList = append(draftList, draft)
		}
	}
	
	return draftList, nil
}
