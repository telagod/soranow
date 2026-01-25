package services

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math/rand"
	"net/http"
	"net/url"
	"time"

	"github.com/google/uuid"
)

const (
	SoraBaseURL    = "https://sora.chatgpt.com/backend"
	SentinelReqURL = "https://chatgpt.com/backend-api/sentinel/req"
)

// Mobile user agents for API requests
var MobileUserAgents = []string{
	"Sora/1.2026.007 (Android 15; 24122RKC7C; build 2600700)",
	"Sora/1.2026.007 (Android 14; SM-G998B; build 2600700)",
	"Sora/1.2026.007 (Android 15; Pixel 8 Pro; build 2600700)",
	"Sora/1.2026.007 (Android 14; Pixel 7; build 2600700)",
	"Sora/1.2026.007 (Android 15; 2211133C; build 2600700)",
}

// TaskStatus represents the status of a generation task
type TaskStatus struct {
	ID          string   `json:"id"`
	Status      string   `json:"status"`
	Progress    float64  `json:"progress"`
	ProgressPct float64  `json:"progress_pct"`
	URLs        []string `json:"urls,omitempty"`
	Error       string   `json:"error,omitempty"`
}

// PendingTask represents a task in the pending list
type PendingTask struct {
	ID          string  `json:"id"`
	Status      string  `json:"status"`
	ProgressPct float64 `json:"progress_pct"`
}

// VideoDraft represents a video draft
type VideoDraft struct {
	ID        string `json:"id"`
	Status    string `json:"status"`
	VideoURL  string `json:"video_url"`
	Thumbnail string `json:"thumbnail_url"`
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
	if baseURL == "" {
		baseURL = SoraBaseURL
	}
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

// SetProxy sets the proxy URL for the client
func (c *SoraClient) SetProxy(proxyURL string) {
	c.proxyURL = proxyURL
	if proxyURL != "" {
		proxyURLParsed, err := url.Parse(proxyURL)
		if err == nil {
			c.httpClient = &http.Client{
				Timeout: time.Duration(c.timeout) * time.Second,
				Transport: &http.Transport{
					Proxy:               http.ProxyURL(proxyURLParsed),
					MaxIdleConns:        100,
					MaxIdleConnsPerHost: 20,
					IdleConnTimeout:     90 * time.Second,
				},
			}
		}
	}
}

// getClientWithProxy returns an HTTP client with optional proxy
func (c *SoraClient) getClientWithProxy(proxyURL string) *http.Client {
	if proxyURL == "" {
		proxyURL = c.proxyURL
	}
	if proxyURL == "" {
		return c.httpClient
	}

	proxyURLParsed, err := url.Parse(proxyURL)
	if err != nil {
		return c.httpClient
	}

	return &http.Client{
		Timeout: time.Duration(c.timeout) * time.Second,
		Transport: &http.Transport{
			Proxy:               http.ProxyURL(proxyURLParsed),
			MaxIdleConns:        100,
			MaxIdleConnsPerHost: 20,
			IdleConnTimeout:     90 * time.Second,
		},
	}
}

// GenerateSentinelToken generates openai-sentinel-token by calling /backend-api/sentinel/req
func (c *SoraClient) GenerateSentinelToken(accessToken string, proxyURL string) (string, error) {
	reqID := uuid.New().String()
	userAgent := DesktopUserAgents[rand.Intn(len(DesktopUserAgents))]
	powToken := GetPowToken(userAgent)

	// Build request payload
	payload := map[string]interface{}{
		"p":    powToken,
		"flow": SentinelFlow,
		"id":   reqID,
	}

	jsonBody, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest("POST", SentinelReqURL, bytes.NewReader(jsonBody))
	if err != nil {
		return "", err
	}

	req.Header.Set("Accept", "application/json, text/plain, */*")
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Origin", "https://sora.chatgpt.com")
	req.Header.Set("Referer", "https://sora.chatgpt.com/")
	req.Header.Set("User-Agent", userAgent)
	if accessToken != "" {
		req.Header.Set("Authorization", "Bearer "+accessToken)
	}

	client := c.getClientWithProxy(proxyURL)
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("sentinel request failed: %v", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read sentinel response: %v", err)
	}

	if resp.StatusCode != 200 {
		return "", fmt.Errorf("sentinel request failed with status %d: %s", resp.StatusCode, string(body))
	}

	var result map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		return "", fmt.Errorf("failed to parse sentinel response: %v", err)
	}

	// Build final sentinel token
	sentinelToken := BuildSentinelToken(SentinelFlow, reqID, powToken, result, userAgent)
	return sentinelToken, nil
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

// makeRequest makes an HTTP request to the Sora API
func (c *SoraClient) makeRequest(method, endpoint, token string, body interface{}, sentinelToken string, proxyURL string) ([]byte, int, error) {
	var reqBody io.Reader
	if body != nil {
		jsonBody, err := json.Marshal(body)
		if err != nil {
			return nil, 0, err
		}
		reqBody = bytes.NewReader(jsonBody)
	}

	reqURL := c.baseURL + endpoint
	req, err := http.NewRequest(method, reqURL, reqBody)
	if err != nil {
		return nil, 0, err
	}

	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", MobileUserAgents[rand.Intn(len(MobileUserAgents))])
	req.Header.Set("Origin", "https://sora.chatgpt.com")
	req.Header.Set("Referer", "https://sora.chatgpt.com/")

	if sentinelToken != "" {
		req.Header.Set("openai-sentinel-token", sentinelToken)
	}

	client := c.getClientWithProxy(proxyURL)
	resp, err := client.Do(req)
	if err != nil {
		return nil, 0, err
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, resp.StatusCode, err
	}

	return respBody, resp.StatusCode, nil
}

// GenerateImage starts an image generation task
func (c *SoraClient) GenerateImage(prompt, token string, width, height int, mediaID string, proxyURL string) (string, error) {
	// Generate sentinel token
	sentinelToken, err := c.GenerateSentinelToken(token, proxyURL)
	if err != nil {
		return "", fmt.Errorf("failed to generate sentinel token: %v", err)
	}

	payload := c.BuildImagePayload(prompt, width, height, mediaID)

	respBody, statusCode, err := c.makeRequest("POST", "/video_gen", token, payload, sentinelToken, proxyURL)
	if err != nil {
		return "", err
	}

	if statusCode >= 400 {
		return "", fmt.Errorf("API error %d: %s", statusCode, string(respBody))
	}

	return ParseTaskResponse(respBody)
}

// GenerateVideo starts a video generation task
func (c *SoraClient) GenerateVideo(prompt, token, orientation, mediaID string, nFrames int, styleID, model, size string, proxyURL string) (string, error) {
	// Generate sentinel token
	sentinelToken, err := c.GenerateSentinelToken(token, proxyURL)
	if err != nil {
		return "", fmt.Errorf("failed to generate sentinel token: %v", err)
	}

	payload := c.BuildVideoPayload(prompt, orientation, mediaID, nFrames, styleID, model, size)

	respBody, statusCode, err := c.makeRequest("POST", "/nf/create", token, payload, sentinelToken, proxyURL)
	if err != nil {
		return "", err
	}

	if statusCode >= 400 {
		return "", fmt.Errorf("API error %d: %s", statusCode, string(respBody))
	}

	return ParseTaskResponse(respBody)
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
		if detail, ok := result["detail"].(string); ok {
			return "", errors.New(detail)
		}
		return "", errors.New("no task ID in response")
	}

	return id, nil
}

// GetPendingTasks gets the list of pending tasks
func (c *SoraClient) GetPendingTasks(token string, proxyURL string) ([]PendingTask, error) {
	respBody, statusCode, err := c.makeRequest("GET", "/nf/pending/v2", token, nil, "", proxyURL)
	if err != nil {
		return nil, err
	}

	if statusCode >= 400 {
		return nil, fmt.Errorf("API error %d: %s", statusCode, string(respBody))
	}

	var result map[string]interface{}
	if err := json.Unmarshal(respBody, &result); err != nil {
		return nil, err
	}

	tasksRaw, ok := result["tasks"].([]interface{})
	if !ok {
		return []PendingTask{}, nil
	}

	var tasks []PendingTask
	for _, t := range tasksRaw {
		if task, ok := t.(map[string]interface{}); ok {
			pt := PendingTask{
				ID:     task["id"].(string),
				Status: "processing",
			}
			if pct, ok := task["progress_pct"].(float64); ok {
				pt.ProgressPct = pct
			}
			tasks = append(tasks, pt)
		}
	}

	return tasks, nil
}

// GetImageTasks gets recent image generation tasks
func (c *SoraClient) GetImageTasks(token string, limit int, proxyURL string) ([]map[string]interface{}, error) {
	endpoint := fmt.Sprintf("/v2/recent_tasks?limit=%d", limit)

	respBody, statusCode, err := c.makeRequest("GET", endpoint, token, nil, "", proxyURL)
	if err != nil {
		return nil, err
	}

	if statusCode >= 400 {
		return nil, fmt.Errorf("API error %d: %s", statusCode, string(respBody))
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
func (c *SoraClient) GetVideoDrafts(token string, limit int, proxyURL string) ([]VideoDraft, error) {
	endpoint := fmt.Sprintf("/project_y/profile/drafts?limit=%d", limit)

	respBody, statusCode, err := c.makeRequest("GET", endpoint, token, nil, "", proxyURL)
	if err != nil {
		return nil, err
	}

	if statusCode >= 400 {
		return nil, fmt.Errorf("API error %d: %s", statusCode, string(respBody))
	}

	var result map[string]interface{}
	if err := json.Unmarshal(respBody, &result); err != nil {
		return nil, err
	}

	draftsRaw, ok := result["drafts"].([]interface{})
	if !ok {
		return []VideoDraft{}, nil
	}

	var drafts []VideoDraft
	for _, d := range draftsRaw {
		if draft, ok := d.(map[string]interface{}); ok {
			vd := VideoDraft{
				ID: draft["id"].(string),
			}
			if status, ok := draft["status"].(string); ok {
				vd.Status = status
			}
			// Extract video URL from media
			if media, ok := draft["media"].(map[string]interface{}); ok {
				if videoURL, ok := media["url"].(string); ok {
					vd.VideoURL = videoURL
				}
				if thumb, ok := media["thumbnail_url"].(string); ok {
					vd.Thumbnail = thumb
				}
			}
			drafts = append(drafts, vd)
		}
	}

	return drafts, nil
}

// FindTaskInPending finds a task by ID in the pending list
func (c *SoraClient) FindTaskInPending(taskID, token string, proxyURL string) (*PendingTask, error) {
	tasks, err := c.GetPendingTasks(token, proxyURL)
	if err != nil {
		return nil, err
	}

	for _, task := range tasks {
		if task.ID == taskID {
			return &task, nil
		}
	}

	return nil, nil // Not found in pending
}

// FindTaskInImageTasks finds a completed image task
func (c *SoraClient) FindTaskInImageTasks(taskID, token string, proxyURL string) (map[string]interface{}, error) {
	tasks, err := c.GetImageTasks(token, 20, proxyURL)
	if err != nil {
		return nil, err
	}

	for _, task := range tasks {
		if id, ok := task["id"].(string); ok && id == taskID {
			return task, nil
		}
	}

	return nil, nil
}

// FindTaskInVideoDrafts finds a completed video task
func (c *SoraClient) FindTaskInVideoDrafts(taskID, token string, proxyURL string) (*VideoDraft, error) {
	drafts, err := c.GetVideoDrafts(token, 20, proxyURL)
	if err != nil {
		return nil, err
	}

	for _, draft := range drafts {
		if draft.ID == taskID {
			return &draft, nil
		}
	}

	return nil, nil
}

// ExtractImageURLs extracts image URLs from a completed image task
func ExtractImageURLs(task map[string]interface{}) []string {
	var urls []string

	// Try to get URLs from generations
	if generations, ok := task["generations"].([]interface{}); ok {
		for _, gen := range generations {
			if g, ok := gen.(map[string]interface{}); ok {
				if media, ok := g["media"].(map[string]interface{}); ok {
					if imgURL, ok := media["url"].(string); ok {
						urls = append(urls, imgURL)
					}
				}
			}
		}
	}

	return urls
}

// PublishVideo publishes a video to get watermark-free URL
func (c *SoraClient) PublishVideo(draftID, token string, proxyURL string) (string, string, error) {
	payload := map[string]interface{}{
		"draft_id":    draftID,
		"title":       "",
		"description": "",
		"visibility":  "private",
	}

	respBody, statusCode, err := c.makeRequest("POST", "/project_y/post", token, payload, "", proxyURL)
	if err != nil {
		return "", "", err
	}

	if statusCode >= 400 {
		return "", "", fmt.Errorf("publish failed with status %d: %s", statusCode, string(respBody))
	}

	var result map[string]interface{}
	if err := json.Unmarshal(respBody, &result); err != nil {
		return "", "", err
	}

	postID, _ := result["id"].(string)
	videoURL := ""
	if media, ok := result["media"].(map[string]interface{}); ok {
		videoURL, _ = media["url"].(string)
	}

	return postID, videoURL, nil
}

// DeletePost deletes a published post
func (c *SoraClient) DeletePost(postID, token string, proxyURL string) error {
	endpoint := fmt.Sprintf("/project_y/post/%s", postID)
	_, statusCode, err := c.makeRequest("DELETE", endpoint, token, nil, "", proxyURL)
	if err != nil {
		return err
	}

	if statusCode >= 400 {
		return fmt.Errorf("delete failed with status %d", statusCode)
	}

	return nil
}
