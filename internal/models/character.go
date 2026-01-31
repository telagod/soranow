package models

import (
	"time"
)

// Character visibility constants
const (
	CharacterVisibilityPrivate = "private"
	CharacterVisibilityPublic  = "public"
)

// Character status constants
const (
	CharacterStatusProcessing = "processing"
	CharacterStatusFinalized  = "finalized"
	CharacterStatusFailed     = "failed"
)

// Character represents a Sora character (cameo) for consistent character generation
type Character struct {
	ID                   int64      `db:"id" json:"id"`
	CameoID              string     `db:"cameo_id" json:"cameo_id"`                             // Sora's internal cameo ID
	CharacterID          string     `db:"character_id" json:"character_id"`                    // Sora's character ID after finalization
	Username             string     `db:"username" json:"username"`                            // Unique username for @mention
	DisplayName          string     `db:"display_name" json:"display_name"`                    // Display name
	ProfileURL           string     `db:"profile_url" json:"profile_url"`                      // Profile image URL
	InstructionSet       string     `db:"instruction_set" json:"instruction_set"`              // Character description/instructions
	SafetyInstructionSet string     `db:"safety_instruction_set" json:"safety_instruction_set"` // Safety instructions
	Visibility           string     `db:"visibility" json:"visibility"`                        // private or public
	Status               string     `db:"status" json:"status"`                                // processing, finalized, failed
	TokenID              int64      `db:"token_id" json:"token_id"`                            // Associated token ID
	ErrorMessage         string     `db:"error_message" json:"error_message,omitempty"`        // Error message if failed
	CreatedAt            time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt            *time.Time `db:"updated_at" json:"updated_at,omitempty"`
}

// CameoUploadResponse represents the response from uploading a character video
type CameoUploadResponse struct {
	CameoID    string `json:"cameo_id"`
	Status     string `json:"status"`
	ProfileURL string `json:"profile_url,omitempty"`
}

// CameoStatus represents the status of a cameo processing
type CameoStatus struct {
	CameoID    string `json:"cameo_id"`
	Status     string `json:"status"`
	ProfileURL string `json:"profile_url,omitempty"`
	Error      string `json:"error,omitempty"`
}

// FinalizeCharacterRequest represents the request to finalize a character
type FinalizeCharacterRequest struct {
	CameoID              string `json:"cameo_id"`
	Username             string `json:"username"`
	DisplayName          string `json:"display_name"`
	InstructionSet       string `json:"instruction_set"`
	SafetyInstructionSet string `json:"safety_instruction_set"`
	Visibility           string `json:"visibility"`
}

// FinalizeCharacterResponse represents the response from finalizing a character
type FinalizeCharacterResponse struct {
	CharacterID string `json:"character_id"`
	Username    string `json:"username"`
	ProfileURL  string `json:"profile_url"`
}

// SearchCharacterResult represents a character from search results
type SearchCharacterResult struct {
	CharacterID string `json:"character_id"`
	Username    string `json:"username"`
	DisplayName string `json:"display_name"`
	ProfileURL  string `json:"profile_url"`
	IsOwner     bool   `json:"is_owner"`
}
