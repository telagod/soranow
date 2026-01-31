package api

import (
	"encoding/base64"
	"io"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"soranow/internal/database"
	"soranow/internal/models"
	"soranow/internal/services"
)

// CharacterHandler handles character-related API requests
type CharacterHandler struct {
	db         *database.DB
	soraClient *services.SoraClient
}

// NewCharacterHandler creates a new CharacterHandler
func NewCharacterHandler(db *database.DB, soraClient *services.SoraClient) *CharacterHandler {
	return &CharacterHandler{
		db:         db,
		soraClient: soraClient,
	}
}

// HandleGetCharacters returns all characters
func (h *CharacterHandler) HandleGetCharacters(c *gin.Context) {
	characters, err := h.db.GetAllCharacters()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"characters": characters})
}

// HandleGetCharacter returns a single character by ID
func (h *CharacterHandler) HandleGetCharacter(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid character ID"})
		return
	}

	character, err := h.db.GetCharacterByID(id)
	if err != nil {
		if err == database.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "character not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"character": character})
}

// HandleUploadCharacterVideo handles video upload for character creation
func (h *CharacterHandler) HandleUploadCharacterVideo(c *gin.Context) {
	var req struct {
		TokenID    int64  `json:"token_id" binding:"required"`
		VideoData  string `json:"video_data" binding:"required"` // Base64 encoded video
		Timestamps string `json:"timestamps"`                    // e.g., "0-5" for 0 to 5 seconds
		Username   string `json:"username" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get the token
	token, err := h.db.GetTokenByID(req.TokenID)
	if err != nil {
		if err == database.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "token not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Decode base64 video data
	videoData, err := base64.StdEncoding.DecodeString(req.VideoData)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid video data encoding"})
		return
	}

	// Get proxy URL from system config
	config, _ := h.db.GetSystemConfig()
	proxyURL := ""
	if config != nil && config.ProxyEnabled {
		proxyURL = config.ProxyURL
	}
	// Token-specific proxy takes precedence
	if token.ProxyURL != "" {
		proxyURL = token.ProxyURL
	}

	// Upload video and create cameo
	timestamps := req.Timestamps
	if timestamps == "" {
		timestamps = "0-5"
	}

	cameoID, err := h.soraClient.UploadCharacterVideo(videoData, token.Token, timestamps, proxyURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to upload video: " + err.Error()})
		return
	}

	// Create character record in database
	character := &models.Character{
		CameoID:     cameoID,
		Username:    req.Username,
		DisplayName: req.Username,
		Visibility:  models.CharacterVisibilityPrivate,
		Status:      models.CharacterStatusProcessing,
		TokenID:     req.TokenID,
	}

	charID, err := h.db.CreateCharacter(character)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save character: " + err.Error()})
		return
	}

	character.ID = charID

	c.JSON(http.StatusOK, gin.H{
		"success":   true,
		"character": character,
		"cameo_id":  cameoID,
	})
}

// HandleGetCameoStatus gets the processing status of a cameo
func (h *CharacterHandler) HandleGetCameoStatus(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid character ID"})
		return
	}

	character, err := h.db.GetCharacterByID(id)
	if err != nil {
		if err == database.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "character not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Get the token
	token, err := h.db.GetTokenByID(character.TokenID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get token: " + err.Error()})
		return
	}

	// Get proxy URL
	config, _ := h.db.GetSystemConfig()
	proxyURL := ""
	if config != nil && config.ProxyEnabled {
		proxyURL = config.ProxyURL
	}
	if token.ProxyURL != "" {
		proxyURL = token.ProxyURL
	}

	// Get cameo status from Sora API
	status, profileURL, err := h.soraClient.GetCameoStatus(character.CameoID, token.Token, proxyURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get cameo status: " + err.Error()})
		return
	}

	// Update character if status changed
	if status != character.Status || profileURL != character.ProfileURL {
		character.Status = status
		character.ProfileURL = profileURL
		h.db.UpdateCharacter(character)
	}

	c.JSON(http.StatusOK, gin.H{
		"status":      status,
		"profile_url": profileURL,
		"character":   character,
	})
}

// HandleCheckUsername checks if a username is available
func (h *CharacterHandler) HandleCheckUsername(c *gin.Context) {
	username := c.Query("username")
	tokenIDStr := c.Query("token_id")

	if username == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "username is required"})
		return
	}

	tokenID, err := strconv.ParseInt(tokenIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid token_id"})
		return
	}

	// Check local database first
	_, err = h.db.GetCharacterByUsername(username)
	if err == nil {
		c.JSON(http.StatusOK, gin.H{"available": false, "reason": "username already exists locally"})
		return
	}

	// Get the token
	token, err := h.db.GetTokenByID(tokenID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get token"})
		return
	}

	// Get proxy URL
	config, _ := h.db.GetSystemConfig()
	proxyURL := ""
	if config != nil && config.ProxyEnabled {
		proxyURL = config.ProxyURL
	}
	if token.ProxyURL != "" {
		proxyURL = token.ProxyURL
	}

	// Check with Sora API
	available, err := h.soraClient.CheckUsernameAvailable(username, token.Token, proxyURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to check username: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"available": available})
}

// HandleFinalizeCharacter finalizes a character with username and settings
func (h *CharacterHandler) HandleFinalizeCharacter(c *gin.Context) {
	var req struct {
		CharacterID          int64  `json:"character_id" binding:"required"`
		Username             string `json:"username" binding:"required"`
		DisplayName          string `json:"display_name" binding:"required"`
		InstructionSet       string `json:"instruction_set"`
		SafetyInstructionSet string `json:"safety_instruction_set"`
		Visibility           string `json:"visibility"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get the character
	character, err := h.db.GetCharacterByID(req.CharacterID)
	if err != nil {
		if err == database.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "character not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Get the token
	token, err := h.db.GetTokenByID(character.TokenID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get token"})
		return
	}

	// Get proxy URL
	config, _ := h.db.GetSystemConfig()
	proxyURL := ""
	if config != nil && config.ProxyEnabled {
		proxyURL = config.ProxyURL
	}
	if token.ProxyURL != "" {
		proxyURL = token.ProxyURL
	}

	visibility := req.Visibility
	if visibility == "" {
		visibility = models.CharacterVisibilityPrivate
	}

	// Finalize with Sora API
	characterID, profileURL, err := h.soraClient.FinalizeCharacter(
		character.CameoID,
		req.Username,
		req.DisplayName,
		req.InstructionSet,
		req.SafetyInstructionSet,
		visibility,
		token.Token,
		proxyURL,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to finalize character: " + err.Error()})
		return
	}

	// Update character in database
	character.CharacterID = characterID
	character.Username = req.Username
	character.DisplayName = req.DisplayName
	character.InstructionSet = req.InstructionSet
	character.SafetyInstructionSet = req.SafetyInstructionSet
	character.Visibility = visibility
	character.ProfileURL = profileURL
	character.Status = models.CharacterStatusFinalized

	if err := h.db.UpdateCharacter(character); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update character: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":   true,
		"character": character,
	})
}

// HandleDeleteCharacter deletes a character
func (h *CharacterHandler) HandleDeleteCharacter(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid character ID"})
		return
	}

	// Get the character
	character, err := h.db.GetCharacterByID(id)
	if err != nil {
		if err == database.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "character not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Get the token
	token, err := h.db.GetTokenByID(character.TokenID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get token"})
		return
	}

	// Get proxy URL
	config, _ := h.db.GetSystemConfig()
	proxyURL := ""
	if config != nil && config.ProxyEnabled {
		proxyURL = config.ProxyURL
	}
	if token.ProxyURL != "" {
		proxyURL = token.ProxyURL
	}

	// Delete from Sora API (use character_id if finalized, otherwise cameo_id)
	deleteID := character.CharacterID
	if deleteID == "" {
		deleteID = character.CameoID
	}

	if err := h.soraClient.DeleteCharacter(deleteID, token.Token, proxyURL); err != nil {
		// Log error but continue with local deletion
		// The character might already be deleted on Sora's side
	}

	// Delete from local database
	if err := h.db.DeleteCharacter(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete character: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "character deleted",
	})
}

// HandleSearchCharacters searches for public characters
func (h *CharacterHandler) HandleSearchCharacters(c *gin.Context) {
	query := c.Query("q")
	tokenIDStr := c.Query("token_id")

	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "search query is required"})
		return
	}

	tokenID, err := strconv.ParseInt(tokenIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid token_id"})
		return
	}

	// Get the token
	token, err := h.db.GetTokenByID(tokenID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get token"})
		return
	}

	// Get proxy URL
	config, _ := h.db.GetSystemConfig()
	proxyURL := ""
	if config != nil && config.ProxyEnabled {
		proxyURL = config.ProxyURL
	}
	if token.ProxyURL != "" {
		proxyURL = token.ProxyURL
	}

	// Search with Sora API
	characters, err := h.soraClient.SearchCharacter(query, token.Token, proxyURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "search failed: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"characters": characters,
	})
}

// HandleSyncCharacters syncs characters from Sora API to local database
func (h *CharacterHandler) HandleSyncCharacters(c *gin.Context) {
	var req struct {
		TokenID int64 `json:"token_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get the token
	token, err := h.db.GetTokenByID(req.TokenID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get token"})
		return
	}

	// Get proxy URL
	config, _ := h.db.GetSystemConfig()
	proxyURL := ""
	if config != nil && config.ProxyEnabled {
		proxyURL = config.ProxyURL
	}
	if token.ProxyURL != "" {
		proxyURL = token.ProxyURL
	}

	// Get characters from Sora API
	remoteChars, err := h.soraClient.GetMyCharacters(token.Token, proxyURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get characters: " + err.Error()})
		return
	}

	synced := 0
	for _, rc := range remoteChars {
		cameoID, _ := rc["cameo_id"].(string)
		if cameoID == "" {
			cameoID, _ = rc["id"].(string)
		}
		if cameoID == "" {
			continue
		}

		// Check if already exists
		_, err := h.db.GetCharacterByCameoID(cameoID)
		if err == nil {
			continue // Already exists
		}

		// Create new character
		username, _ := rc["username"].(string)
		displayName, _ := rc["display_name"].(string)
		if displayName == "" {
			displayName = username
		}
		profileURL, _ := rc["profile_url"].(string)
		characterID, _ := rc["character_id"].(string)
		status, _ := rc["status"].(string)
		if status == "" {
			status = models.CharacterStatusFinalized
		}

		char := &models.Character{
			CameoID:     cameoID,
			CharacterID: characterID,
			Username:    username,
			DisplayName: displayName,
			ProfileURL:  profileURL,
			Visibility:  models.CharacterVisibilityPrivate,
			Status:      status,
			TokenID:     req.TokenID,
		}

		if _, err := h.db.CreateCharacter(char); err == nil {
			synced++
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"synced":  synced,
		"total":   len(remoteChars),
	})
}

// Unused import placeholder
var _ = io.EOF
