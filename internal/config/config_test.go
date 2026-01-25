package config

import (
	"os"
	"path/filepath"
	"testing"
)

func TestLoadConfig_DefaultValues(t *testing.T) {
	// Create a minimal TOML config file
	tmpDir := t.TempDir()
	configPath := filepath.Join(tmpDir, "setting.toml")

	content := `
[global]
api_key = "test_key"
admin_username = "admin"
admin_password = "admin123"

[server]
host = "0.0.0.0"
port = 8000
`
	if err := os.WriteFile(configPath, []byte(content), 0644); err != nil {
		t.Fatalf("Failed to write config file: %v", err)
	}

	cfg, err := LoadConfig(configPath)
	if err != nil {
		t.Fatalf("LoadConfig failed: %v", err)
	}

	// Verify global settings
	if cfg.Global.APIKey != "test_key" {
		t.Errorf("Expected APIKey 'test_key', got '%s'", cfg.Global.APIKey)
	}
	if cfg.Global.AdminUsername != "admin" {
		t.Errorf("Expected AdminUsername 'admin', got '%s'", cfg.Global.AdminUsername)
	}
	if cfg.Global.AdminPassword != "admin123" {
		t.Errorf("Expected AdminPassword 'admin123', got '%s'", cfg.Global.AdminPassword)
	}

	// Verify server settings
	if cfg.Server.Host != "0.0.0.0" {
		t.Errorf("Expected Host '0.0.0.0', got '%s'", cfg.Server.Host)
	}
	if cfg.Server.Port != 8000 {
		t.Errorf("Expected Port 8000, got %d", cfg.Server.Port)
	}
}

func TestLoadConfig_FileNotFound(t *testing.T) {
	_, err := LoadConfig("/nonexistent/path/config.toml")
	if err == nil {
		t.Error("Expected error for nonexistent config file, got nil")
	}
}

func TestLoadConfig_AllSections(t *testing.T) {
	tmpDir := t.TempDir()
	configPath := filepath.Join(tmpDir, "setting.toml")

	content := `
[global]
api_key = "han1234"
admin_username = "admin"
admin_password = "admin"

[sora]
base_url = "https://sora.chatgpt.com/backend"
timeout = 120
max_retries = 3
poll_interval = 2.5
max_poll_attempts = 600

[server]
host = "0.0.0.0"
port = 8000

[debug]
enabled = false
log_requests = true
log_responses = true
mask_token = true

[cache]
enabled = false
timeout = 600
base_url = "http://127.0.0.1:8000"

[generation]
image_timeout = 300
video_timeout = 3000

[admin]
error_ban_threshold = 3
task_retry_enabled = true
task_max_retries = 3
auto_disable_on_401 = true

[proxy]
proxy_enabled = false
proxy_url = ""

[watermark_free]
watermark_free_enabled = false
parse_method = "third_party"
custom_parse_url = ""
custom_parse_token = ""
fallback_on_failure = true

[token_refresh]
at_auto_refresh_enabled = false

[call_logic]
call_mode = "default"

[timezone]
timezone_offset = 8
`
	if err := os.WriteFile(configPath, []byte(content), 0644); err != nil {
		t.Fatalf("Failed to write config file: %v", err)
	}

	cfg, err := LoadConfig(configPath)
	if err != nil {
		t.Fatalf("LoadConfig failed: %v", err)
	}

	// Verify sora settings
	if cfg.Sora.BaseURL != "https://sora.chatgpt.com/backend" {
		t.Errorf("Expected Sora BaseURL, got '%s'", cfg.Sora.BaseURL)
	}
	if cfg.Sora.Timeout != 120 {
		t.Errorf("Expected Sora Timeout 120, got %d", cfg.Sora.Timeout)
	}
	if cfg.Sora.PollInterval != 2.5 {
		t.Errorf("Expected Sora PollInterval 2.5, got %f", cfg.Sora.PollInterval)
	}

	// Verify generation settings
	if cfg.Generation.ImageTimeout != 300 {
		t.Errorf("Expected ImageTimeout 300, got %d", cfg.Generation.ImageTimeout)
	}
	if cfg.Generation.VideoTimeout != 3000 {
		t.Errorf("Expected VideoTimeout 3000, got %d", cfg.Generation.VideoTimeout)
	}

	// Verify admin settings
	if cfg.Admin.ErrorBanThreshold != 3 {
		t.Errorf("Expected ErrorBanThreshold 3, got %d", cfg.Admin.ErrorBanThreshold)
	}
	if !cfg.Admin.TaskRetryEnabled {
		t.Error("Expected TaskRetryEnabled true")
	}

	// Verify watermark settings
	if cfg.WatermarkFree.ParseMethod != "third_party" {
		t.Errorf("Expected ParseMethod 'third_party', got '%s'", cfg.WatermarkFree.ParseMethod)
	}
	if !cfg.WatermarkFree.FallbackOnFailure {
		t.Error("Expected FallbackOnFailure true")
	}

	// Verify timezone
	if cfg.Timezone.TimezoneOffset != 8 {
		t.Errorf("Expected TimezoneOffset 8, got %d", cfg.Timezone.TimezoneOffset)
	}
}
