package services

import (
	"strings"
	"testing"
)

func TestGeneratePowToken(t *testing.T) {
	seed := "test_seed_123"
	difficulty := 4

	token, err := GeneratePowToken(seed, difficulty)
	if err != nil {
		t.Fatalf("Failed to generate PoW token: %v", err)
	}

	if token == "" {
		t.Error("Expected non-empty token")
	}

	// Token should contain the seed
	if !strings.Contains(token, seed) {
		t.Errorf("Token should contain seed, got: %s", token)
	}
}

func TestVerifyPowToken(t *testing.T) {
	seed := "test_seed_456"
	difficulty := 3

	token, err := GeneratePowToken(seed, difficulty)
	if err != nil {
		t.Fatalf("Failed to generate PoW token: %v", err)
	}

	// Verify the token
	valid := VerifyPowToken(token, seed, difficulty)
	if !valid {
		t.Error("Expected token to be valid")
	}
}

func TestVerifyPowToken_InvalidToken(t *testing.T) {
	seed := "test_seed_789"
	difficulty := 3

	// Invalid token should fail verification
	valid := VerifyPowToken("invalid_token", seed, difficulty)
	if valid {
		t.Error("Expected invalid token to fail verification")
	}
}

func TestGeneratePowToken_DifferentDifficulties(t *testing.T) {
	seed := "difficulty_test"

	// Test with different difficulties
	difficulties := []int{1, 2, 3}
	for _, diff := range difficulties {
		token, err := GeneratePowToken(seed, diff)
		if err != nil {
			t.Errorf("Failed with difficulty %d: %v", diff, err)
			continue
		}
		if token == "" {
			t.Errorf("Empty token for difficulty %d", diff)
		}
	}
}

func TestHashSHA3_512(t *testing.T) {
	input := "hello world"
	hash := HashSHA3_512(input)

	if hash == "" {
		t.Error("Expected non-empty hash")
	}

	// SHA3-512 produces 128 hex characters
	if len(hash) != 128 {
		t.Errorf("Expected hash length 128, got %d", len(hash))
	}

	// Same input should produce same hash
	hash2 := HashSHA3_512(input)
	if hash != hash2 {
		t.Error("Same input should produce same hash")
	}

	// Different input should produce different hash
	hash3 := HashSHA3_512("different input")
	if hash == hash3 {
		t.Error("Different input should produce different hash")
	}
}
