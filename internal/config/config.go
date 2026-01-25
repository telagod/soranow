package config

import (
	"os"

	"github.com/BurntSushi/toml"
)

// Config represents the complete application configuration
type Config struct {
	Global       GlobalConfig       `toml:"global"`
	Sora         SoraConfig         `toml:"sora"`
	Server       ServerConfig       `toml:"server"`
	Debug        DebugConfig        `toml:"debug"`
	Cache        CacheConfig        `toml:"cache"`
	Generation   GenerationConfig   `toml:"generation"`
	Admin        AdminConfig        `toml:"admin"`
	Proxy        ProxyConfig        `toml:"proxy"`
	WatermarkFree WatermarkFreeConfig `toml:"watermark_free"`
	TokenRefresh TokenRefreshConfig `toml:"token_refresh"`
	CallLogic    CallLogicConfig    `toml:"call_logic"`
	Timezone     TimezoneConfig     `toml:"timezone"`
}

type GlobalConfig struct {
	APIKey        string `toml:"api_key"`
	AdminUsername string `toml:"admin_username"`
	AdminPassword string `toml:"admin_password"`
}

type SoraConfig struct {
	BaseURL         string  `toml:"base_url"`
	Timeout         int     `toml:"timeout"`
	MaxRetries      int     `toml:"max_retries"`
	PollInterval    float64 `toml:"poll_interval"`
	MaxPollAttempts int     `toml:"max_poll_attempts"`
}

type ServerConfig struct {
	Host string `toml:"host"`
	Port int    `toml:"port"`
}

type DebugConfig struct {
	Enabled      bool `toml:"enabled"`
	LogRequests  bool `toml:"log_requests"`
	LogResponses bool `toml:"log_responses"`
	MaskToken    bool `toml:"mask_token"`
}

type CacheConfig struct {
	Enabled bool   `toml:"enabled"`
	Timeout int    `toml:"timeout"`
	BaseURL string `toml:"base_url"`
}

type GenerationConfig struct {
	ImageTimeout int `toml:"image_timeout"`
	VideoTimeout int `toml:"video_timeout"`
}

type AdminConfig struct {
	ErrorBanThreshold int  `toml:"error_ban_threshold"`
	TaskRetryEnabled  bool `toml:"task_retry_enabled"`
	TaskMaxRetries    int  `toml:"task_max_retries"`
	AutoDisableOn401  bool `toml:"auto_disable_on_401"`
}

type ProxyConfig struct {
	ProxyEnabled bool   `toml:"proxy_enabled"`
	ProxyURL     string `toml:"proxy_url"`
}

type WatermarkFreeConfig struct {
	WatermarkFreeEnabled bool   `toml:"watermark_free_enabled"`
	ParseMethod          string `toml:"parse_method"`
	CustomParseURL       string `toml:"custom_parse_url"`
	CustomParseToken     string `toml:"custom_parse_token"`
	FallbackOnFailure    bool   `toml:"fallback_on_failure"`
}

type TokenRefreshConfig struct {
	ATAutoRefreshEnabled bool `toml:"at_auto_refresh_enabled"`
}

type CallLogicConfig struct {
	CallMode string `toml:"call_mode"`
}

type TimezoneConfig struct {
	TimezoneOffset int `toml:"timezone_offset"`
}

// LoadConfig loads configuration from a TOML file
func LoadConfig(path string) (*Config, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	var cfg Config
	if _, err := toml.Decode(string(data), &cfg); err != nil {
		return nil, err
	}

	return &cfg, nil
}
