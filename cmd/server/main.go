package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
	"sora2api-go/internal/api"
	"sora2api-go/internal/config"
	"sora2api-go/internal/database"
	"sora2api-go/internal/services"
)

func main() {
	// Parse command line flags
	configPath := flag.String("config", "config/setting.toml", "Path to config file")
	flag.Parse()

	// Load configuration
	cfg, err := config.LoadConfig(*configPath)
	if err != nil {
		// Try default paths
		defaultPaths := []string{
			"config/setting.toml",
			"../config/setting.toml",
			"../../config/setting.toml",
		}
		for _, p := range defaultPaths {
			cfg, err = config.LoadConfig(p)
			if err == nil {
				break
			}
		}
		if err != nil {
			log.Printf("Warning: Could not load config file, using defaults: %v", err)
			cfg = &config.Config{
				Global: config.GlobalConfig{
					APIKey:        "han1234",
					AdminUsername: "admin",
					AdminPassword: "admin",
				},
				Server: config.ServerConfig{
					Host: "0.0.0.0",
					Port: 8000,
				},
				Cache: config.CacheConfig{
					Enabled: false,
					Timeout: 600,
				},
			}
		}
	}

	// Initialize database
	dbPath := "data/sora2api.db"
	if err := os.MkdirAll(filepath.Dir(dbPath), 0755); err != nil {
		log.Fatalf("Failed to create data directory: %v", err)
	}

	db, err := database.NewDB(dbPath)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	if err := db.InitSchema(); err != nil {
		log.Fatalf("Failed to initialize database schema: %v", err)
	}

	// Initialize services
	loadBalancer := services.NewLoadBalancer()
	concurrencyManager := services.NewConcurrencyManager()
	tokenManager := services.NewTokenManager(db, loadBalancer, concurrencyManager)

	// Initialize file cache
	cacheDir := "data/cache"
	os.MkdirAll(cacheDir, 0755)
	cacheBaseURL := cfg.Cache.BaseURL
	if cacheBaseURL == "" {
		cacheBaseURL = fmt.Sprintf("http://%s:%d", cfg.Server.Host, cfg.Server.Port)
	}
	fileCache := services.NewFileCache(cacheDir, cfg.Cache.Timeout, cacheBaseURL)

	// Initialize watermark remover
	watermarkRemover := services.NewWatermarkRemover(
		cfg.WatermarkFree.ParseMethod,
		cfg.WatermarkFree.CustomParseURL,
		cfg.WatermarkFree.CustomParseToken,
		cfg.WatermarkFree.FallbackOnFailure,
	)

	// Initialize scheduler for background tasks
	scheduler := services.NewScheduler()

	// Schedule cache cleanup (every 10 minutes)
	if cfg.Cache.Enabled {
		scheduler.AddTask("cache_cleanup", 10*time.Minute, func() {
			cleaned := fileCache.Cleanup()
			if cleaned > 0 {
				log.Printf("Cache cleanup: removed %d expired files", cleaned)
			}
		})
		log.Println("Cache cleanup task scheduled")
	}

	// Schedule cooldown cleanup (every minute)
	scheduler.AddTask("cooldown_cleanup", 1*time.Minute, func() {
		cleared, _ := tokenManager.ClearExpiredCooldowns()
		if cleared > 0 {
			log.Printf("Cleared %d expired cooldowns", cleared)
		}
	})

	// Schedule error token check (every 5 minutes)
	if cfg.Admin.ErrorBanThreshold > 0 {
		scheduler.AddTask("error_token_check", 5*time.Minute, func() {
			disabled, _ := tokenManager.CheckAndDisableErrorTokens(cfg.Admin.ErrorBanThreshold)
			if disabled > 0 {
				log.Printf("Disabled %d tokens due to consecutive errors", disabled)
			}
		})
		log.Println("Error token check task scheduled")
	}

	// Load active tokens into load balancer
	tokenManager.RefreshLoadBalancer()
	log.Printf("Loaded %d active tokens", loadBalancer.GetTokenCount())

	// Log service status
	log.Printf("File cache: enabled=%v, dir=%s", cfg.Cache.Enabled, cacheDir)
	log.Printf("Watermark remover: enabled=%v, method=%s", watermarkRemover.IsEnabled(), cfg.WatermarkFree.ParseMethod)

	// Set up router
	if !cfg.Debug.Enabled {
		gin.SetMode(gin.ReleaseMode)
	}

	router := api.SetupRouter(cfg.Global.APIKey, db, loadBalancer, concurrencyManager)

	// Start server
	addr := fmt.Sprintf("%s:%d", cfg.Server.Host, cfg.Server.Port)
	log.Printf("Starting server on %s", addr)
	if err := router.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}

	// Cleanup on shutdown
	scheduler.Stop()
}
