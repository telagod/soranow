package models

import (
	"time"
)

// Task status constants
const (
	TaskStatusProcessing = "processing"
	TaskStatusCompleted  = "completed"
	TaskStatusFailed     = "failed"
	TaskStatusCancelled  = "cancelled"
)

// Token represents a Sora API token
type Token struct {
	ID               int64      `db:"id" json:"id"`
	Token            string     `db:"token" json:"token"`
	Email            string     `db:"email" json:"email"`
	Name             string     `db:"name" json:"name"`
	SessionToken     string     `db:"session_token" json:"session_token,omitempty"`
	RefreshToken     string     `db:"refresh_token" json:"refresh_token,omitempty"`
	ClientID         string     `db:"client_id" json:"client_id,omitempty"`
	ProxyURL         string     `db:"proxy_url" json:"proxy_url,omitempty"`
	Remark           string     `db:"remark" json:"remark,omitempty"`

	// Status
	IsActive    bool       `db:"is_active" json:"is_active"`
	IsExpired   bool       `db:"is_expired" json:"is_expired"`
	CooledUntil *time.Time `db:"cooled_until" json:"cooled_until,omitempty"`

	// Feature toggles
	ImageEnabled     bool `db:"image_enabled" json:"image_enabled"`
	VideoEnabled     bool `db:"video_enabled" json:"video_enabled"`
	ImageConcurrency int  `db:"image_concurrency" json:"image_concurrency"`
	VideoConcurrency int  `db:"video_concurrency" json:"video_concurrency"`

	// Subscription info
	PlanType        string     `db:"plan_type" json:"plan_type,omitempty"`
	PlanTitle       string     `db:"plan_title" json:"plan_title,omitempty"`
	SubscriptionEnd *time.Time `db:"subscription_end" json:"subscription_end,omitempty"`

	// Sora2 quota
	Sora2Supported     bool       `db:"sora2_supported" json:"sora2_supported"`
	Sora2InviteCode    string     `db:"sora2_invite_code" json:"sora2_invite_code,omitempty"`
	Sora2UsedCount     int        `db:"sora2_used_count" json:"sora2_used_count"`
	Sora2TotalCount    int        `db:"sora2_total_count" json:"sora2_total_count"`
	Sora2CooldownUntil *time.Time `db:"sora2_cooldown_until" json:"sora2_cooldown_until,omitempty"`

	// Statistics (embedded to avoid JOIN)
	TotalImageCount   int        `db:"total_image_count" json:"total_image_count"`
	TotalVideoCount   int        `db:"total_video_count" json:"total_video_count"`
	TotalErrorCount   int        `db:"total_error_count" json:"total_error_count"`
	TodayImageCount   int        `db:"today_image_count" json:"today_image_count"`
	TodayVideoCount   int        `db:"today_video_count" json:"today_video_count"`
	TodayErrorCount   int        `db:"today_error_count" json:"today_error_count"`
	TodayDate         string     `db:"today_date" json:"today_date,omitempty"`
	ConsecutiveErrors int        `db:"consecutive_errors" json:"consecutive_errors"`
	LastErrorAt       *time.Time `db:"last_error_at" json:"last_error_at,omitempty"`

	// Timestamps
	ExpiryTime *time.Time `db:"expiry_time" json:"expiry_time,omitempty"`
	CreatedAt  time.Time  `db:"created_at" json:"created_at"`
	LastUsedAt *time.Time `db:"last_used_at" json:"last_used_at,omitempty"`
}

// SystemConfig represents the system configuration (single row table)
type SystemConfig struct {
	ID int64 `db:"id" json:"id"`

	// Admin
	AdminUsername     string `db:"admin_username" json:"admin_username"`
	AdminPasswordHash string `db:"admin_password_hash" json:"-"`
	APIKey            string `db:"api_key" json:"api_key"`

	// Proxy
	ProxyEnabled bool   `db:"proxy_enabled" json:"proxy_enabled"`
	ProxyURL     string `db:"proxy_url" json:"proxy_url,omitempty"`

	// Cache
	CacheEnabled bool   `db:"cache_enabled" json:"cache_enabled"`
	CacheTimeout int    `db:"cache_timeout" json:"cache_timeout"`
	CacheBaseURL string `db:"cache_base_url" json:"cache_base_url,omitempty"`

	// Generation timeout
	ImageTimeout int `db:"image_timeout" json:"image_timeout"`
	VideoTimeout int `db:"video_timeout" json:"video_timeout"`

	// Token management
	ErrorBanThreshold int  `db:"error_ban_threshold" json:"error_ban_threshold"`
	TaskRetryEnabled  bool `db:"task_retry_enabled" json:"task_retry_enabled"`
	TaskMaxRetries    int  `db:"task_max_retries" json:"task_max_retries"`
	AutoDisable401    bool `db:"auto_disable_401" json:"auto_disable_401"`
	TokenAutoRefresh  bool `db:"token_auto_refresh" json:"token_auto_refresh"`

	// Watermark removal
	WatermarkFreeEnabled bool   `db:"watermark_free_enabled" json:"watermark_free_enabled"`
	WatermarkParseMethod string `db:"watermark_parse_method" json:"watermark_parse_method"`
	WatermarkParseURL    string `db:"watermark_parse_url" json:"watermark_parse_url,omitempty"`
	WatermarkParseToken  string `db:"watermark_parse_token" json:"watermark_parse_token,omitempty"`
	WatermarkFallback    bool   `db:"watermark_fallback" json:"watermark_fallback"`

	// Call logic
	CallMode string `db:"call_mode" json:"call_mode"`

	UpdatedAt time.Time `db:"updated_at" json:"updated_at"`
}

// Task represents a generation task
type Task struct {
	ID           int64      `db:"id" json:"id"`
	TaskID       string     `db:"task_id" json:"task_id"`
	TokenID      int64      `db:"token_id" json:"token_id"`
	Model        string     `db:"model" json:"model"`
	Prompt       string     `db:"prompt" json:"prompt"`
	Status       string     `db:"status" json:"status"`
	Progress     float64    `db:"progress" json:"progress"`
	ResultURLs   string     `db:"result_urls" json:"result_urls,omitempty"` // JSON array
	ErrorMessage string     `db:"error_message" json:"error_message,omitempty"`
	RetryCount   int        `db:"retry_count" json:"retry_count"`
	CreatedAt    time.Time  `db:"created_at" json:"created_at"`
	CompletedAt  *time.Time `db:"completed_at" json:"completed_at,omitempty"`
}

// RequestLog represents a request log entry
type RequestLog struct {
	ID           int64      `db:"id" json:"id"`
	TokenID      *int64     `db:"token_id" json:"token_id,omitempty"`
	TaskID       *string    `db:"task_id" json:"task_id,omitempty"`
	Operation    string     `db:"operation" json:"operation"`
	RequestBody  string     `db:"request_body" json:"request_body,omitempty"`
	ResponseBody string     `db:"response_body" json:"response_body,omitempty"`
	StatusCode   int        `db:"status_code" json:"status_code"`
	DurationMS   int64      `db:"duration_ms" json:"duration_ms"`
	CreatedAt    time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt    *time.Time `db:"updated_at" json:"updated_at,omitempty"`
}
