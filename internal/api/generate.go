package api

import (
	"context"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"soranow/internal/database"
	"soranow/internal/services"
)

type GenerateHandler struct {
	db         *database.DB
	soraClient *services.SoraClient
}

func NewGenerateHandler(db *database.DB) *GenerateHandler {
	return &GenerateHandler{
		db:         db,
		soraClient: services.NewSoraClient("", 120, nil),
	}
}

type GenerateVideoRequest struct {
	TokenID        int      `json:"token_id" binding:"required"`
	Prompt         string   `json:"prompt" binding:"required"`
	Duration       int      `json:"duration"`
	AspectRatio    string   `json:"aspect_ratio"`
	Model          string   `json:"model"`
	CameoIDs       []string `json:"cameo_ids"`
	ReferenceImage string   `json:"reference_image"`
}

type GenerateImageRequest struct {
	TokenID int    `json:"token_id" binding:"required"`
	Prompt  string `json:"prompt" binding:"required"`
	Size    string `json:"size"`
	Model   string `json:"model"`
}

func (h *GenerateHandler) getTokenAndProxy(tokenID int) (string, string, error) {
	token, err := h.db.GetTokenByID(int64(tokenID))
	if err != nil {
		return "", "", err
	}

	proxyURL := token.ProxyURL
	if proxyURL == "" {
		if cfg, err := h.db.GetSystemConfig(); err == nil && cfg.ProxyEnabled {
			proxyURL = cfg.ProxyURL
		}
	}

	accessToken := token.Token

	// If token is RT, convert first
	if strings.HasPrefix(accessToken, "rt_") {
		rt := token.RefreshToken
		if rt == "" {
			rt = token.Token
		}
		tm := services.NewTokenManager(h.db, nil, nil)
		result, err := tm.ConvertRTToAT(rt, token.ClientID, proxyURL)
		if err != nil || !result.Success {
			return "", "", fmt.Errorf("RT 转换 AT 失败")
		}
		accessToken = result.AccessToken
		token.Token = result.AccessToken
		if result.RefreshToken != "" {
			token.RefreshToken = result.RefreshToken
		}
		h.db.UpdateToken(token)
	}

	return accessToken, proxyURL, nil
}

func (h *GenerateHandler) durationToFrames(duration int) int {
	switch {
	case duration <= 10:
		return 300
	case duration <= 15:
		return 450
	default:
		return 750
	}
}

func (h *GenerateHandler) HandleGenerateVideo(c *gin.Context) {
	var req GenerateVideoRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	accessToken, proxyURL, err := h.getTokenAndProxy(req.TokenID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	orientation := "landscape"
	if req.AspectRatio == "9:16" {
		orientation = "portrait"
	}

	nFrames := h.durationToFrames(req.Duration)

	var taskID string
	if len(req.CameoIDs) > 0 {
		taskID, err = h.soraClient.GenerateVideoWithCameo(
			req.Prompt, accessToken, orientation, "",
			nFrames, "", "sy_8", "small", req.CameoIDs, proxyURL,
		)
	} else {
		taskID, err = h.soraClient.GenerateVideo(
			req.Prompt, accessToken, orientation, "",
			nFrames, "", "sy_8", "small", proxyURL,
		)
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":       true,
		"generation_id": taskID,
	})
}

func (h *GenerateHandler) HandleGenerateImage(c *gin.Context) {
	var req GenerateImageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	accessToken, proxyURL, err := h.getTokenAndProxy(req.TokenID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	width, height := 360, 360
	switch req.Size {
	case "1024x1792", "portrait":
		width, height = 360, 540
	case "1792x1024", "landscape":
		width, height = 540, 360
	}

	taskID, err := h.soraClient.GenerateImage(
		req.Prompt, accessToken, width, height, "", proxyURL,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Poll for image result (images are fast)
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Minute)
	defer cancel()

	for {
		select {
		case <-ctx.Done():
			c.JSON(http.StatusOK, gin.H{"success": true, "generation_id": taskID})
			return
		default:
		}

		time.Sleep(3 * time.Second)
		task, err := h.soraClient.FindTaskInImageTasks(taskID, accessToken, proxyURL)
		if err != nil || task == nil {
			continue
		}

		status, _ := task["status"].(string)
		if status == "succeeded" {
			urls := services.ExtractImageURLs(task)
			if len(urls) > 0 {
				c.JSON(http.StatusOK, gin.H{"success": true, "image_url": urls[0]})
				return
			}
		} else if status == "failed" {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "图片生成失败"})
			return
		}
	}
}

func (h *GenerateHandler) HandleGetGenerationStatus(c *gin.Context) {
	generationID := c.Param("id")
	tokenIDStr := c.Query("token_id")
	tokenID, err := strconv.Atoi(tokenIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid token_id"})
		return
	}

	accessToken, proxyURL, err := h.getTokenAndProxy(tokenID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	task, err := h.soraClient.FindTaskInImageTasks(generationID, accessToken, proxyURL)
	if err != nil || task == nil {
		c.JSON(http.StatusOK, gin.H{"status": "processing", "progress": 0})
		return
	}

	status, _ := task["status"].(string)
	progressPct, _ := task["progress_pct"].(float64)

	switch status {
	case "succeeded":
		// Try video first
		videoURL := ""
		if gens, ok := task["generations"].([]interface{}); ok && len(gens) > 0 {
			if gen, ok := gens[0].(map[string]interface{}); ok {
				videoURL, _ = gen["url"].(string)
			}
		}
		if videoURL != "" {
			c.JSON(http.StatusOK, gin.H{"status": "completed", "progress": 1.0, "video_url": videoURL})
			return
		}
		// Try image
		urls := services.ExtractImageURLs(task)
		if len(urls) > 0 {
			c.JSON(http.StatusOK, gin.H{"status": "completed", "progress": 1.0, "video_url": urls[0]})
			return
		}
		c.JSON(http.StatusOK, gin.H{"status": "completed", "progress": 1.0})
	case "failed":
		errMsg := "生成失败"
		if msg, ok := task["error_message"].(string); ok && msg != "" {
			errMsg = msg
		}
		c.JSON(http.StatusOK, gin.H{"status": "failed", "error": errMsg})
	default:
		c.JSON(http.StatusOK, gin.H{"status": "processing", "progress": progressPct})
	}
}
