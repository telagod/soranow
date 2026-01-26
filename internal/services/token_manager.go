package services

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	http2 "github.com/bogdanfinn/fhttp"
	tls_client "github.com/bogdanfinn/tls-client"
	"github.com/bogdanfinn/tls-client/profiles"
	"soranow/internal/database"
)

const (
	// API endpoints
	SoraSessionURL     = "https://sora.chatgpt.com/api/auth/session"
	OpenAIOAuthURL     = "https://auth.openai.com/oauth/token"
	SoraBackendURL     = "https://sora.chatgpt.com/backend"
	DefaultClientID    = "app_1LOVEceTvrP2tHFDNnrPLQkJ"
	DefaultRedirectURI = "com.openai.chat://auth0.openai.com/ios/com.openai.chat/callback"
)

// TokenManager manages token lifecycle and statistics
type TokenManager struct {
	db           *database.DB
	loadBalancer *LoadBalancer
	concurrency  *ConcurrencyManager
	httpClient   *http.Client
	tlsClient    tls_client.HttpClient
}

// NewTokenManager creates a new token manager
func NewTokenManager(db *database.DB, lb *LoadBalancer, cm *ConcurrencyManager) *TokenManager {
	// Create TLS client with Chrome profile
	jar := tls_client.NewCookieJar()
	options := []tls_client.HttpClientOption{
		tls_client.WithTimeoutSeconds(30),
		tls_client.WithClientProfile(profiles.Chrome_131),
		tls_client.WithNotFollowRedirects(),
		tls_client.WithCookieJar(jar),
	}
	tlsClient, _ := tls_client.NewHttpClient(tls_client.NewNoopLogger(), options...)

	return &TokenManager{
		db:           db,
		loadBalancer: lb,
		concurrency:  cm,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
		tlsClient: tlsClient,
	}
}

// doTLSRequest performs an HTTP request using the TLS client
func (m *TokenManager) doTLSRequest(method, urlStr string, body string, headers map[string]string, proxyURL string) ([]byte, int, error) {
	if m.tlsClient == nil {
		return nil, 0, fmt.Errorf("TLS client not initialized")
	}

	if proxyURL != "" {
		m.tlsClient.SetProxy(proxyURL)
	}

	var bodyReader io.Reader
	if body != "" {
		bodyReader = strings.NewReader(body)
	}

	req, err := http2.NewRequest(method, urlStr, bodyReader)
	if err != nil {
		return nil, 0, err
	}

	for k, v := range headers {
		req.Header.Set(k, v)
	}

	resp, err := m.tlsClient.Do(req)
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

// STToATResult represents the result of ST to AT conversion
type STToATResult struct {
	Success     bool   `json:"success"`
	AccessToken string `json:"access_token,omitempty"`
	Email       string `json:"email,omitempty"`
	ExpiresAt   string `json:"expires_at,omitempty"`
	Message     string `json:"message,omitempty"`
}

// RTToATResult represents the result of RT to AT conversion
type RTToATResult struct {
	Success      bool   `json:"success"`
	AccessToken  string `json:"access_token,omitempty"`
	RefreshToken string `json:"refresh_token,omitempty"`
	ExpiresIn    int    `json:"expires_in,omitempty"`
	Message      string `json:"message,omitempty"`
}

// TokenTestResult represents the result of token testing
type TokenTestResult struct {
	Success           bool   `json:"success"`
	Status            string `json:"status"`
	Email             string `json:"email,omitempty"`
	PlanType          string `json:"plan_type,omitempty"`
	PlanTitle         string `json:"plan_title,omitempty"`
	SubscriptionEnd   string `json:"subscription_end,omitempty"`
	Sora2Supported    bool   `json:"sora2_supported,omitempty"`
	Sora2TotalCount   int    `json:"sora2_total_count,omitempty"`
	Sora2UsedCount    int    `json:"sora2_redeemed_count,omitempty"`
	Sora2Remaining    int    `json:"sora2_remaining_count,omitempty"`
	Message           string `json:"message,omitempty"`
}

// ConvertSTToAT converts Session Token to Access Token
func (m *TokenManager) ConvertSTToAT(sessionToken string, proxyURL string) (*STToATResult, error) {
	req, err := http.NewRequest("GET", SoraSessionURL, nil)
	if err != nil {
		return &STToATResult{Success: false, Message: err.Error()}, err
	}

	// Set headers
	req.Header.Set("Cookie", fmt.Sprintf("__Secure-next-auth.session-token=%s", sessionToken))
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Origin", "https://sora.chatgpt.com")
	req.Header.Set("Referer", "https://sora.chatgpt.com/")
	req.Header.Set("User-Agent", MobileUserAgents[0])

	// Create client with optional proxy
	client := m.httpClient
	if proxyURL != "" {
		proxyURLParsed, err := url.Parse(proxyURL)
		if err == nil {
			client = &http.Client{
				Timeout: 30 * time.Second,
				Transport: &http.Transport{
					Proxy: http.ProxyURL(proxyURLParsed),
				},
			}
		}
	}

	resp, err := client.Do(req)
	if err != nil {
		return &STToATResult{Success: false, Message: fmt.Sprintf("请求失败: %v", err)}, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return &STToATResult{Success: false, Message: fmt.Sprintf("读取响应失败: %v", err)}, err
	}

	if resp.StatusCode != 200 {
		return &STToATResult{Success: false, Message: fmt.Sprintf("API 返回错误: %d - %s", resp.StatusCode, string(body))}, nil
	}

	var result map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		return &STToATResult{Success: false, Message: fmt.Sprintf("解析响应失败: %v", err)}, err
	}

	accessToken, _ := result["accessToken"].(string)
	if accessToken == "" {
		return &STToATResult{Success: false, Message: "响应中没有 accessToken"}, nil
	}

	email := ""
	if user, ok := result["user"].(map[string]interface{}); ok {
		email, _ = user["email"].(string)
	}

	expires, _ := result["expires"].(string)

	return &STToATResult{
		Success:     true,
		AccessToken: accessToken,
		Email:       email,
		ExpiresAt:   expires,
	}, nil
}

// ConvertRTToAT converts Refresh Token to Access Token
func (m *TokenManager) ConvertRTToAT(refreshToken string, clientID string, proxyURL string) (*RTToATResult, error) {
	if clientID == "" {
		clientID = DefaultClientID
	}

	// Build form data
	formData := url.Values{}
	formData.Set("client_id", clientID)
	formData.Set("grant_type", "refresh_token")
	formData.Set("redirect_uri", DefaultRedirectURI)
	formData.Set("refresh_token", refreshToken)

	headers := map[string]string{
		"Content-Type": "application/x-www-form-urlencoded",
		"User-Agent":   MobileUserAgents[0],
	}

	body, statusCode, err := m.doTLSRequest("POST", OpenAIOAuthURL, formData.Encode(), headers, proxyURL)
	if err != nil {
		return &RTToATResult{Success: false, Message: fmt.Sprintf("请求失败: %v", err)}, err
	}

	if statusCode != 200 {
		return &RTToATResult{Success: false, Message: fmt.Sprintf("API 返回错误: %d - %s", statusCode, string(body))}, nil
	}

	var result map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		return &RTToATResult{Success: false, Message: fmt.Sprintf("解析响应失败: %v", err)}, err
	}

	accessToken, _ := result["access_token"].(string)
	if accessToken == "" {
		errMsg, _ := result["error_description"].(string)
		if errMsg == "" {
			errMsg = "响应中没有 access_token"
		}
		return &RTToATResult{Success: false, Message: errMsg}, nil
	}

	newRefreshToken, _ := result["refresh_token"].(string)
	expiresIn := 0
	if exp, ok := result["expires_in"].(float64); ok {
		expiresIn = int(exp)
	}

	return &RTToATResult{
		Success:      true,
		AccessToken:  accessToken,
		RefreshToken: newRefreshToken,
		ExpiresIn:    expiresIn,
	}, nil
}

// TestToken tests if a token is valid and retrieves account info
func (m *TokenManager) TestToken(tokenID int64, proxyURL string) (*TokenTestResult, error) {
	token, err := m.db.GetTokenByID(tokenID)
	if err != nil {
		return &TokenTestResult{Success: false, Status: "error", Message: "Token 不存在"}, err
	}

	// Create client with optional proxy
	client := m.httpClient
	if proxyURL != "" {
		proxyURLParsed, err := url.Parse(proxyURL)
		if err == nil {
			client = &http.Client{
				Timeout: 30 * time.Second,
				Transport: &http.Transport{
					Proxy: http.ProxyURL(proxyURLParsed),
				},
			}
		}
	} else if token.ProxyURL != "" {
		proxyURLParsed, err := url.Parse(token.ProxyURL)
		if err == nil {
			client = &http.Client{
				Timeout: 30 * time.Second,
				Transport: &http.Transport{
					Proxy: http.ProxyURL(proxyURLParsed),
				},
			}
		}
	}

	// Test by getting user info from /me endpoint
	req, err := http.NewRequest("GET", SoraBackendURL+"/me", nil)
	if err != nil {
		return &TokenTestResult{Success: false, Status: "error", Message: err.Error()}, err
	}

	req.Header.Set("Authorization", "Bearer "+token.Token)
	req.Header.Set("User-Agent", MobileUserAgents[0])
	req.Header.Set("Accept", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		return &TokenTestResult{Success: false, Status: "error", Message: fmt.Sprintf("请求失败: %v", err)}, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return &TokenTestResult{Success: false, Status: "error", Message: fmt.Sprintf("读取响应失败: %v", err)}, err
	}

	if resp.StatusCode == 401 {
		// Token is invalid/expired
		token.IsExpired = true
		m.db.UpdateToken(token)
		return &TokenTestResult{Success: false, Status: "expired", Message: "Token 已过期或无效"}, nil
	}

	if resp.StatusCode != 200 {
		return &TokenTestResult{Success: false, Status: "error", Message: fmt.Sprintf("API 返回错误: %d", resp.StatusCode)}, nil
	}

	var userInfo map[string]interface{}
	if err := json.Unmarshal(body, &userInfo); err != nil {
		return &TokenTestResult{Success: false, Status: "error", Message: fmt.Sprintf("解析响应失败: %v", err)}, err
	}

	email, _ := userInfo["email"].(string)

	// Get subscription info
	subReq, _ := http.NewRequest("GET", SoraBackendURL+"/billing/subscriptions", nil)
	subReq.Header.Set("Authorization", "Bearer "+token.Token)
	subReq.Header.Set("User-Agent", MobileUserAgents[0])

	planType := ""
	planTitle := ""
	subscriptionEnd := ""

	subResp, err := client.Do(subReq)
	if err == nil {
		defer subResp.Body.Close()
		subBody, _ := io.ReadAll(subResp.Body)
		var subInfo map[string]interface{}
		if json.Unmarshal(subBody, &subInfo) == nil {
			if subs, ok := subInfo["subscriptions"].([]interface{}); ok && len(subs) > 0 {
				if sub, ok := subs[0].(map[string]interface{}); ok {
					planType, _ = sub["plan_type"].(string)
					planTitle, _ = sub["name"].(string)
					if endDate, ok := sub["expires_at"].(string); ok {
						subscriptionEnd = endDate
					}
				}
			}
		}
	}

	// Get Sora2 info
	sora2Supported := false
	sora2Total := 0
	sora2Used := 0
	sora2Remaining := 0

	sora2Req, _ := http.NewRequest("GET", SoraBackendURL+"/project_y/invite/mine", nil)
	sora2Req.Header.Set("Authorization", "Bearer "+token.Token)
	sora2Req.Header.Set("User-Agent", MobileUserAgents[0])

	sora2Resp, err := client.Do(sora2Req)
	if err == nil {
		defer sora2Resp.Body.Close()
		sora2Body, _ := io.ReadAll(sora2Resp.Body)
		var sora2Info map[string]interface{}
		if json.Unmarshal(sora2Body, &sora2Info) == nil {
			if _, ok := sora2Info["invite_code"]; ok {
				sora2Supported = true
			}
			if total, ok := sora2Info["total_count"].(float64); ok {
				sora2Total = int(total)
			}
			if used, ok := sora2Info["redeemed_count"].(float64); ok {
				sora2Used = int(used)
			}
		}
	}

	// Get remaining count
	checkReq, _ := http.NewRequest("GET", SoraBackendURL+"/nf/check", nil)
	checkReq.Header.Set("Authorization", "Bearer "+token.Token)
	checkReq.Header.Set("User-Agent", MobileUserAgents[0])

	checkResp, err := client.Do(checkReq)
	if err == nil {
		defer checkResp.Body.Close()
		checkBody, _ := io.ReadAll(checkResp.Body)
		var checkInfo map[string]interface{}
		if json.Unmarshal(checkBody, &checkInfo) == nil {
			if remaining, ok := checkInfo["remaining_count"].(float64); ok {
				sora2Remaining = int(remaining)
			}
		}
	}

	// Update token in database
	token.Email = email
	token.IsExpired = false
	token.Sora2Supported = sora2Supported
	token.Sora2TotalCount = sora2Total
	token.Sora2UsedCount = sora2Used
	m.db.UpdateToken(token)

	return &TokenTestResult{
		Success:         true,
		Status:          "valid",
		Email:           email,
		PlanType:        planType,
		PlanTitle:       planTitle,
		SubscriptionEnd: subscriptionEnd,
		Sora2Supported:  sora2Supported,
		Sora2TotalCount: sora2Total,
		Sora2UsedCount:  sora2Used,
		Sora2Remaining:  sora2Remaining,
		Message:         "Token 有效",
	}, nil
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
