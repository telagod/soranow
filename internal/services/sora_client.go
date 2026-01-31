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
	"regexp"
	"strings"
	"time"

	http2 "github.com/bogdanfinn/fhttp"
	tls_client "github.com/bogdanfinn/tls-client"
	"github.com/bogdanfinn/tls-client/profiles"
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

// Storyboard pattern for detecting storyboard prompts
var storyboardPattern = regexp.MustCompile(`\[\d+(?:\.\d+)?s\]`)

// IsStoryboardPrompt checks if the prompt is in storyboard format
// Format: [time]prompt or [time]prompt\n[time]prompt
// Example: [5.0s]猫猫从飞机上跳伞 [5.0s]猫猫降落
func IsStoryboardPrompt(prompt string) bool {
	if prompt == "" {
		return false
	}
	matches := storyboardPattern.FindAllString(prompt, -1)
	return len(matches) >= 1
}

// FormatStoryboardPrompt converts storyboard format prompt to API format
// Input: 猫猫的奇妙冒险\n[5.0s]猫猫从飞机上跳伞 [5.0s]猫猫降落
// Output: current timeline:\nShot 1:...\n\ninstructions:\n猫猫的奇妙冒险
func FormatStoryboardPrompt(prompt string) string {
	// Match [time]content pattern
	pattern := regexp.MustCompile(`\[(\d+(?:\.\d+)?)s\]\s*([^\[]+)`)
	matches := pattern.FindAllStringSubmatch(prompt, -1)

	if len(matches) == 0 {
		return prompt
	}

	// Extract instructions (content before first [time])
	firstBracketPos := strings.Index(prompt, "[")
	instructions := ""
	if firstBracketPos > 0 {
		instructions = strings.TrimSpace(prompt[:firstBracketPos])
	}

	// Format shots
	var formattedShots []string
	for idx, match := range matches {
		duration := match[1]
		scene := strings.TrimSpace(match[2])
		shot := fmt.Sprintf("Shot %d:\nduration: %ssec\nScene: %s", idx+1, duration, scene)
		formattedShots = append(formattedShots, shot)
	}

	timeline := strings.Join(formattedShots, "\n\n")

	// If there are instructions, add them
	if instructions != "" {
		return fmt.Sprintf("current timeline:\n%s\n\ninstructions:\n%s", timeline, instructions)
	}
	return timeline
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
	baseURL        string
	timeout        int
	httpClient     *http.Client
	tlsClient      tls_client.HttpClient
	proxyURL       string
	sessionManager *SessionManager
	proxyManager   *ProxyManager
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

	// Create TLS client with Firefox profile to bypass Cloudflare
	jar := tls_client.NewCookieJar()
	options := []tls_client.HttpClientOption{
		tls_client.WithTimeoutSeconds(timeout),
		tls_client.WithClientProfile(profiles.Firefox_132),
		tls_client.WithNotFollowRedirects(),
		tls_client.WithCookieJar(jar),
	}
	tlsClient, _ := tls_client.NewHttpClient(tls_client.NewNoopLogger(), options...)

	return &SoraClient{
		baseURL:        baseURL,
		timeout:        timeout,
		httpClient:     httpClient,
		tlsClient:      tlsClient,
		sessionManager: NewSessionManager(timeout),
	}
}

// SetProxyManager sets the proxy manager for the client
func (c *SoraClient) SetProxyManager(pm *ProxyManager) {
	c.proxyManager = pm
}

// SetSessionManager sets the session manager for the client
func (c *SoraClient) SetSessionManager(sm *SessionManager) {
	c.sessionManager = sm
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
		// Update TLS client with proxy
		if c.tlsClient != nil {
			c.tlsClient.SetProxy(proxyURL)
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

// getTLSClientWithProxy returns a TLS client with optional proxy
// If token is provided, uses session manager for cookie persistence
func (c *SoraClient) getTLSClientWithProxy(proxyURL string) tls_client.HttpClient {
	if proxyURL == "" {
		proxyURL = c.proxyURL
	}
	// If proxy manager is set, get proxy from pool
	if proxyURL == "" && c.proxyManager != nil {
		proxyURL = c.proxyManager.GetProxyURL()
	}
	if proxyURL != "" && c.tlsClient != nil {
		c.tlsClient.SetProxy(proxyURL)
	}
	return c.tlsClient
}

// getTLSClientForToken returns a TLS client with session persistence for the given token
func (c *SoraClient) getTLSClientForToken(token string, proxyURL string) (tls_client.HttpClient, error) {
	if proxyURL == "" {
		proxyURL = c.proxyURL
	}
	// If proxy manager is set, get proxy from pool
	if proxyURL == "" && c.proxyManager != nil {
		proxyURL = c.proxyManager.GetProxyURL()
	}

	// Use session manager for cookie persistence
	if c.sessionManager != nil {
		return c.sessionManager.GetSession(token, proxyURL)
	}

	// Fallback to default TLS client
	if proxyURL != "" && c.tlsClient != nil {
		c.tlsClient.SetProxy(proxyURL)
	}
	return c.tlsClient, nil
}

// doTLSRequest performs an HTTP request using the TLS client (bypasses Cloudflare)
func (c *SoraClient) doTLSRequest(method, urlStr string, body []byte, headers map[string]string, proxyURL string) ([]byte, int, error) {
	return c.doTLSRequestWithToken(method, urlStr, body, headers, proxyURL, "")
}

// doTLSRequestWithToken performs an HTTP request with session persistence for the given token
func (c *SoraClient) doTLSRequestWithToken(method, urlStr string, body []byte, headers map[string]string, proxyURL string, token string) ([]byte, int, error) {
	var tlsClient tls_client.HttpClient
	var err error

	if token != "" && c.sessionManager != nil {
		tlsClient, err = c.getTLSClientForToken(token, proxyURL)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to get session: %w", err)
		}
	} else {
		tlsClient = c.getTLSClientWithProxy(proxyURL)
	}

	if tlsClient == nil {
		return nil, 0, errors.New("TLS client not initialized")
	}

	var bodyReader io.Reader
	if body != nil {
		bodyReader = bytes.NewReader(body)
	}

	req, err := http2.NewRequest(method, urlStr, bodyReader)
	if err != nil {
		return nil, 0, err
	}

	// Set default headers for Cloudflare bypass
	req.Header = http2.Header{
		"accept":          {"application/json, text/plain, */*"},
		"accept-language": {"en-US,en;q=0.9"},
		"origin":          {"https://sora.chatgpt.com"},
		"referer":         {"https://sora.chatgpt.com/"},
		"sec-fetch-dest":  {"empty"},
		"sec-fetch-mode":  {"cors"},
		"sec-fetch-site":  {"same-origin"},
		http2.HeaderOrderKey: {
			"accept",
			"accept-language",
			"authorization",
			"content-type",
			"origin",
			"referer",
			"sec-fetch-dest",
			"sec-fetch-mode",
			"sec-fetch-site",
			"user-agent",
			"openai-sentinel-token",
		},
	}

	// Override with provided headers
	for k, v := range headers {
		req.Header.Set(k, v)
	}

	resp, err := tlsClient.Do(req)
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

	headers := map[string]string{
		"Accept":       "application/json, text/plain, */*",
		"Content-Type": "application/json",
		"Origin":       "https://sora.chatgpt.com",
		"Referer":      "https://sora.chatgpt.com/",
		"User-Agent":   userAgent,
	}
	if accessToken != "" {
		headers["Authorization"] = "Bearer " + accessToken
	}

	// Use token for session persistence
	body, statusCode, err := c.doTLSRequestWithToken("POST", SentinelReqURL, jsonBody, headers, proxyURL, accessToken)
	if err != nil {
		return "", fmt.Errorf("sentinel request failed: %v", err)
	}

	if statusCode != 200 {
		return "", fmt.Errorf("sentinel request failed with status %d: %s", statusCode, string(body))
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
		payload["style_id"] = strings.ToLower(styleID)
	}

	return payload
}

// BuildRemixPayload builds the payload for remix video generation
func (c *SoraClient) BuildRemixPayload(prompt, orientation, remixTargetID string, nFrames int, model string) map[string]interface{} {
	return map[string]interface{}{
		"kind":             "video",
		"prompt":           prompt,
		"inpaint_items":    []map[string]interface{}{},
		"remix_target_id":  remixTargetID,
		"cameo_ids":        []string{},
		"cameo_replacements": map[string]interface{}{},
		"model":            model,
		"orientation":      orientation,
		"n_frames":         nFrames,
	}
}

// BuildStoryboardPayload builds the payload for storyboard video generation
func (c *SoraClient) BuildStoryboardPayload(prompt, orientation, mediaID string, nFrames int) map[string]interface{} {
	inpaintItems := []map[string]interface{}{}

	if mediaID != "" {
		inpaintItems = []map[string]interface{}{
			{
				"kind":      "upload",
				"upload_id": mediaID,
			},
		}
	}

	return map[string]interface{}{
		"kind":               "video",
		"prompt":             prompt,
		"title":              "Draft your video",
		"orientation":        orientation,
		"size":               "small",
		"n_frames":           nFrames,
		"storyboard_id":      nil,
		"inpaint_items":      inpaintItems,
		"remix_target_id":    nil,
		"model":              "sy_8",
		"metadata":           nil,
		"style_id":           nil,
		"cameo_ids":          nil,
		"cameo_replacements": nil,
		"audio_caption":      nil,
		"audio_transcript":   nil,
		"video_caption":      nil,
	}
}

// makeRequest makes an HTTP request to the Sora API using TLS client with session persistence
func (c *SoraClient) makeRequest(method, endpoint, token string, body interface{}, sentinelToken string, proxyURL string) ([]byte, int, error) {
	var jsonBody []byte
	var err error
	if body != nil {
		jsonBody, err = json.Marshal(body)
		if err != nil {
			return nil, 0, err
		}
	}

	reqURL := c.baseURL + endpoint
	headers := map[string]string{
		"Authorization": "Bearer " + token,
		"Content-Type":  "application/json",
		"User-Agent":    MobileUserAgents[rand.Intn(len(MobileUserAgents))],
		"Origin":        "https://sora.chatgpt.com",
		"Referer":       "https://sora.chatgpt.com/",
	}

	if sentinelToken != "" {
		headers["openai-sentinel-token"] = sentinelToken
	}

	// Use token for session persistence
	return c.doTLSRequestWithToken(method, reqURL, jsonBody, headers, proxyURL, token)
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

// RemixVideo starts a remix video generation task based on existing video
func (c *SoraClient) RemixVideo(prompt, token, orientation, remixTargetID string, nFrames int, model string, proxyURL string) (string, error) {
	// Generate sentinel token
	sentinelToken, err := c.GenerateSentinelToken(token, proxyURL)
	if err != nil {
		return "", fmt.Errorf("failed to generate sentinel token: %v", err)
	}

	if model == "" {
		model = "sy_8"
	}

	payload := c.BuildRemixPayload(prompt, orientation, remixTargetID, nFrames, model)

	respBody, statusCode, err := c.makeRequest("POST", "/nf/create", token, payload, sentinelToken, proxyURL)
	if err != nil {
		return "", err
	}

	if statusCode >= 400 {
		return "", fmt.Errorf("API error %d: %s", statusCode, string(respBody))
	}

	return ParseTaskResponse(respBody)
}

// GenerateStoryboard starts a storyboard video generation task
func (c *SoraClient) GenerateStoryboard(prompt, token, orientation, mediaID string, nFrames int, proxyURL string) (string, error) {
	// Generate sentinel token
	sentinelToken, err := c.GenerateSentinelToken(token, proxyURL)
	if err != nil {
		return "", fmt.Errorf("failed to generate sentinel token: %v", err)
	}

	payload := c.BuildStoryboardPayload(prompt, orientation, mediaID, nFrames)

	respBody, statusCode, err := c.makeRequest("POST", "/nf/create/storyboard", token, payload, sentinelToken, proxyURL)
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

	// Try "task_responses" first (new API format), then "tasks" (old format)
	tasks, ok := result["task_responses"].([]interface{})
	if !ok {
		tasks, ok = result["tasks"].([]interface{})
		if !ok {
			return []map[string]interface{}{}, nil
		}
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
				// Try direct url field first (new API format)
				if imgURL, ok := g["url"].(string); ok && imgURL != "" {
					urls = append(urls, imgURL)
					continue
				}
				// Try media.url (old API format)
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

// ========== Character (Cameo) API Methods ==========

// UploadCharacterVideo uploads a video for character creation and returns cameo_id
func (c *SoraClient) UploadCharacterVideo(videoData []byte, token string, timestamps string, proxyURL string) (string, error) {
	// Generate sentinel token
	sentinelToken, err := c.GenerateSentinelToken(token, proxyURL)
	if err != nil {
		return "", fmt.Errorf("failed to generate sentinel token: %v", err)
	}

	// First, upload the video file
	uploadPayload := map[string]interface{}{
		"file_size": len(videoData),
		"file_type": "video/mp4",
	}

	respBody, statusCode, err := c.makeRequest("POST", "/cameo/upload/init", token, uploadPayload, sentinelToken, proxyURL)
	if err != nil {
		return "", fmt.Errorf("upload init failed: %v", err)
	}

	if statusCode >= 400 {
		return "", fmt.Errorf("upload init failed with status %d: %s", statusCode, string(respBody))
	}

	var initResult map[string]interface{}
	if err := json.Unmarshal(respBody, &initResult); err != nil {
		return "", fmt.Errorf("failed to parse upload init response: %v", err)
	}

	uploadURL, _ := initResult["upload_url"].(string)
	uploadID, _ := initResult["upload_id"].(string)

	if uploadURL == "" || uploadID == "" {
		return "", errors.New("missing upload_url or upload_id in response")
	}

	// Upload the actual video data
	headers := map[string]string{
		"Content-Type": "video/mp4",
	}
	_, statusCode, err = c.doTLSRequest("PUT", uploadURL, videoData, headers, proxyURL)
	if err != nil {
		return "", fmt.Errorf("video upload failed: %v", err)
	}

	if statusCode >= 400 {
		return "", fmt.Errorf("video upload failed with status %d", statusCode)
	}

	// Create the cameo with the uploaded video
	cameoPayload := map[string]interface{}{
		"upload_id":  uploadID,
		"timestamps": timestamps,
	}

	respBody, statusCode, err = c.makeRequest("POST", "/cameo/create", token, cameoPayload, sentinelToken, proxyURL)
	if err != nil {
		return "", fmt.Errorf("cameo create failed: %v", err)
	}

	if statusCode >= 400 {
		return "", fmt.Errorf("cameo create failed with status %d: %s", statusCode, string(respBody))
	}

	var cameoResult map[string]interface{}
	if err := json.Unmarshal(respBody, &cameoResult); err != nil {
		return "", fmt.Errorf("failed to parse cameo create response: %v", err)
	}

	cameoID, _ := cameoResult["cameo_id"].(string)
	if cameoID == "" {
		if id, ok := cameoResult["id"].(string); ok {
			cameoID = id
		}
	}

	if cameoID == "" {
		return "", errors.New("no cameo_id in response")
	}

	return cameoID, nil
}

// GetCameoStatus gets the processing status of a cameo
func (c *SoraClient) GetCameoStatus(cameoID, token string, proxyURL string) (string, string, error) {
	endpoint := fmt.Sprintf("/cameo/%s", cameoID)

	respBody, statusCode, err := c.makeRequest("GET", endpoint, token, nil, "", proxyURL)
	if err != nil {
		return "", "", err
	}

	if statusCode >= 400 {
		return "", "", fmt.Errorf("get cameo status failed with status %d: %s", statusCode, string(respBody))
	}

	var result map[string]interface{}
	if err := json.Unmarshal(respBody, &result); err != nil {
		return "", "", err
	}

	status, _ := result["status"].(string)
	profileURL, _ := result["profile_url"].(string)

	return status, profileURL, nil
}

// CheckUsernameAvailable checks if a username is available for character creation
func (c *SoraClient) CheckUsernameAvailable(username, token string, proxyURL string) (bool, error) {
	endpoint := fmt.Sprintf("/cameo/username/check?username=%s", url.QueryEscape(username))

	respBody, statusCode, err := c.makeRequest("GET", endpoint, token, nil, "", proxyURL)
	if err != nil {
		return false, err
	}

	if statusCode >= 400 {
		return false, fmt.Errorf("username check failed with status %d: %s", statusCode, string(respBody))
	}

	var result map[string]interface{}
	if err := json.Unmarshal(respBody, &result); err != nil {
		return false, err
	}

	available, _ := result["available"].(bool)
	return available, nil
}

// FinalizeCharacter finalizes a cameo into a character with username and settings
func (c *SoraClient) FinalizeCharacter(cameoID, username, displayName, instructionSet, safetyInstructionSet, visibility, token string, proxyURL string) (string, string, error) {
	// Generate sentinel token
	sentinelToken, err := c.GenerateSentinelToken(token, proxyURL)
	if err != nil {
		return "", "", fmt.Errorf("failed to generate sentinel token: %v", err)
	}

	payload := map[string]interface{}{
		"cameo_id":               cameoID,
		"username":               username,
		"display_name":           displayName,
		"instruction_set":        instructionSet,
		"safety_instruction_set": safetyInstructionSet,
		"visibility":             visibility,
	}

	respBody, statusCode, err := c.makeRequest("POST", "/cameo/finalize", token, payload, sentinelToken, proxyURL)
	if err != nil {
		return "", "", fmt.Errorf("finalize failed: %v", err)
	}

	if statusCode >= 400 {
		return "", "", fmt.Errorf("finalize failed with status %d: %s", statusCode, string(respBody))
	}

	var result map[string]interface{}
	if err := json.Unmarshal(respBody, &result); err != nil {
		return "", "", err
	}

	characterID, _ := result["character_id"].(string)
	if characterID == "" {
		characterID, _ = result["id"].(string)
	}
	profileURL, _ := result["profile_url"].(string)

	return characterID, profileURL, nil
}

// SearchCharacter searches for public characters by username
func (c *SoraClient) SearchCharacter(username, token string, proxyURL string) ([]map[string]interface{}, error) {
	endpoint := fmt.Sprintf("/cameo/search?q=%s&intent=use", url.QueryEscape(username))

	respBody, statusCode, err := c.makeRequest("GET", endpoint, token, nil, "", proxyURL)
	if err != nil {
		return nil, err
	}

	if statusCode >= 400 {
		return nil, fmt.Errorf("search failed with status %d: %s", statusCode, string(respBody))
	}

	var result map[string]interface{}
	if err := json.Unmarshal(respBody, &result); err != nil {
		return nil, err
	}

	charactersRaw, ok := result["characters"].([]interface{})
	if !ok {
		charactersRaw, _ = result["results"].([]interface{})
	}

	var characters []map[string]interface{}
	for _, c := range charactersRaw {
		if char, ok := c.(map[string]interface{}); ok {
			characters = append(characters, char)
		}
	}

	return characters, nil
}

// DeleteCharacter deletes a character by ID
func (c *SoraClient) DeleteCharacter(characterID, token string, proxyURL string) error {
	endpoint := fmt.Sprintf("/cameo/%s", characterID)

	_, statusCode, err := c.makeRequest("DELETE", endpoint, token, nil, "", proxyURL)
	if err != nil {
		return err
	}

	if statusCode >= 400 {
		return fmt.Errorf("delete character failed with status %d", statusCode)
	}

	return nil
}

// GetMyCharacters gets all characters owned by the current user
func (c *SoraClient) GetMyCharacters(token string, proxyURL string) ([]map[string]interface{}, error) {
	respBody, statusCode, err := c.makeRequest("GET", "/cameo/mine", token, nil, "", proxyURL)
	if err != nil {
		return nil, err
	}

	if statusCode >= 400 {
		return nil, fmt.Errorf("get my characters failed with status %d: %s", statusCode, string(respBody))
	}

	var result map[string]interface{}
	if err := json.Unmarshal(respBody, &result); err != nil {
		return nil, err
	}

	charactersRaw, ok := result["characters"].([]interface{})
	if !ok {
		charactersRaw, _ = result["cameos"].([]interface{})
	}

	var characters []map[string]interface{}
	for _, c := range charactersRaw {
		if char, ok := c.(map[string]interface{}); ok {
			characters = append(characters, char)
		}
	}

	return characters, nil
}

// BuildVideoPayloadWithCameo builds video payload with character references
func (c *SoraClient) BuildVideoPayloadWithCameo(prompt, orientation, mediaID string, nFrames int, styleID, model, size string, cameoIDs []string) map[string]interface{} {
	payload := c.BuildVideoPayload(prompt, orientation, mediaID, nFrames, styleID, model, size)

	if len(cameoIDs) > 0 {
		payload["cameo_ids"] = cameoIDs
	}

	return payload
}

// GenerateVideoWithCameo starts a video generation task with character references
func (c *SoraClient) GenerateVideoWithCameo(prompt, token, orientation, mediaID string, nFrames int, styleID, model, size string, cameoIDs []string, proxyURL string) (string, error) {
	// Generate sentinel token
	sentinelToken, err := c.GenerateSentinelToken(token, proxyURL)
	if err != nil {
		return "", fmt.Errorf("failed to generate sentinel token: %v", err)
	}

	payload := c.BuildVideoPayloadWithCameo(prompt, orientation, mediaID, nFrames, styleID, model, size, cameoIDs)

	respBody, statusCode, err := c.makeRequest("POST", "/nf/create", token, payload, sentinelToken, proxyURL)
	if err != nil {
		return "", err
	}

	if statusCode >= 400 {
		return "", fmt.Errorf("API error %d: %s", statusCode, string(respBody))
	}

	return ParseTaskResponse(respBody)
}
