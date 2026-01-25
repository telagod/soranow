package services

import (
	"encoding/hex"
	"fmt"
	"strings"

	"golang.org/x/crypto/sha3"
)

// HashSHA3_512 computes SHA3-512 hash of the input string
func HashSHA3_512(input string) string {
	hash := sha3.New512()
	hash.Write([]byte(input))
	return hex.EncodeToString(hash.Sum(nil))
}

// GeneratePowToken generates a proof-of-work token
// The token format is: seed:nonce where the hash of the token
// starts with 'difficulty' number of zeros
func GeneratePowToken(seed string, difficulty int) (string, error) {
	prefix := strings.Repeat("0", difficulty)
	
	for nonce := 0; nonce < 10000000; nonce++ {
		token := fmt.Sprintf("%s:%d", seed, nonce)
		hash := HashSHA3_512(token)
		
		if strings.HasPrefix(hash, prefix) {
			return token, nil
		}
	}
	
	return "", fmt.Errorf("failed to find valid nonce within limit")
}

// VerifyPowToken verifies that a PoW token is valid
func VerifyPowToken(token, seed string, difficulty int) bool {
	// Check token contains the seed
	if !strings.HasPrefix(token, seed+":") {
		return false
	}
	
	// Verify hash has required prefix
	prefix := strings.Repeat("0", difficulty)
	hash := HashSHA3_512(token)
	
	return strings.HasPrefix(hash, prefix)
}
