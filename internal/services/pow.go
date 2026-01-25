package services

import (
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"math/rand"
	"strings"
	"time"

	"golang.org/x/crypto/sha3"
)

const (
	POWMaxIteration = 500000
	ChatGPTBaseURL  = "https://chatgpt.com"
	SentinelFlow    = "sora_2_create_task"
)

var (
	POWCores = []int{8, 16, 24, 32}
	POWScripts = []string{
		"https://cdn.oaistatic.com/_next/static/cXh69klOLzS0Gy2joLDRS/_ssgManifest.js?dpl=453ebaec0d44c2decab71692e1bfe39be35a24b3",
	}
	POWDPL = []string{"prod-f501fe933b3edf57aea882da888e1a544df99840"}
	POWNavigatorKeys = []string{
		"registerProtocolHandler−function registerProtocolHandler() { [native code] }",
		"storage−[object StorageManager]",
		"locks−[object LockManager]",
		"appCodeName−Mozilla",
		"permissions−[object Permissions]",
		"webdriver−false",
		"vendor−Google Inc.",
		"mediaDevices−[object MediaDevices]",
		"cookieEnabled−true",
		"product−Gecko",
		"productSub−20030107",
		"hardwareConcurrency−32",
		"onLine−true",
	}
	POWDocumentKeys = []string{"_reactListeningo743lnnpvdg", "location"}
	POWWindowKeys = []string{
		"0", "window", "self", "document", "name", "location",
		"navigator", "screen", "innerWidth", "innerHeight",
		"localStorage", "sessionStorage", "crypto", "performance",
		"fetch", "setTimeout", "setInterval", "console",
	}
	DesktopUserAgents = []string{
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
		"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
		"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
	}
)

// HashSHA3_512 computes SHA3-512 hash of the input bytes
func HashSHA3_512(input []byte) []byte {
	hash := sha3.New512()
	hash.Write(input)
	return hash.Sum(nil)
}

// HashSHA3_512String computes SHA3-512 hash of the input string and returns hex
func HashSHA3_512String(input string) string {
	return hex.EncodeToString(HashSHA3_512([]byte(input)))
}

// GetPowParseTime generates time string for PoW (EST timezone)
func GetPowParseTime() string {
	loc := time.FixedZone("EST", -5*60*60)
	now := time.Now().In(loc)
	return now.Format("Mon Jan 02 2006 15:04:05") + " GMT-0500 (Eastern Standard Time)"
}

// GetPowConfig generates PoW config array with browser fingerprint
func GetPowConfig(userAgent string) []interface{} {
	screenSizes := []int{1920 + 1080, 2560 + 1440, 1920 + 1200, 2560 + 1600}

	return []interface{}{
		screenSizes[rand.Intn(len(screenSizes))],
		GetPowParseTime(),
		4294705152,
		0, // [3] dynamic - will be replaced
		userAgent,
		POWScripts[rand.Intn(len(POWScripts))],
		POWDPL[rand.Intn(len(POWDPL))],
		"en-US",
		"en-US,es-US,en,es",
		0, // [9] dynamic - will be replaced
		POWNavigatorKeys[rand.Intn(len(POWNavigatorKeys))],
		POWDocumentKeys[rand.Intn(len(POWDocumentKeys))],
		POWWindowKeys[rand.Intn(len(POWWindowKeys))],
		float64(time.Now().UnixNano()) / 1e6,
		fmt.Sprintf("%08x-%04x-%04x-%04x-%012x",
			rand.Uint32(), rand.Uint32()&0xffff, rand.Uint32()&0xffff,
			rand.Uint32()&0xffff, rand.Uint64()&0xffffffffffff),
		"",
		POWCores[rand.Intn(len(POWCores))],
		float64(time.Now().UnixMilli()) - float64(time.Now().UnixNano())/1e6,
	}
}

// SolvePow executes PoW calculation using SHA3-512 hash collision
func SolvePow(seed string, difficulty string, configList []interface{}) (string, bool) {
	diffLen := len(difficulty) / 2
	seedBytes := []byte(seed)
	targetDiff, _ := hex.DecodeString(difficulty)

	// Build static parts of JSON
	part1, _ := json.Marshal(configList[:3])
	part2, _ := json.Marshal(configList[4:9])
	part3, _ := json.Marshal(configList[10:])

	staticPart1 := string(part1[:len(part1)-1]) + ","
	staticPart2 := "," + string(part2[1:len(part2)-1]) + ","
	staticPart3 := "," + string(part3[1:])

	for i := 0; i < POWMaxIteration; i++ {
		dynamicI := fmt.Sprintf("%d", i)
		dynamicJ := fmt.Sprintf("%d", i>>1)

		finalJSON := staticPart1 + dynamicI + staticPart2 + dynamicJ + staticPart3
		b64Encoded := base64.StdEncoding.EncodeToString([]byte(finalJSON))

		hashInput := append(seedBytes, []byte(b64Encoded)...)
		hashValue := HashSHA3_512(hashInput)

		// Compare first diffLen bytes
		match := true
		for k := 0; k < diffLen && k < len(hashValue) && k < len(targetDiff); k++ {
			if hashValue[k] > targetDiff[k] {
				match = false
				break
			} else if hashValue[k] < targetDiff[k] {
				break
			}
		}

		if match {
			return b64Encoded, true
		}
	}

	// Return error token if failed
	errorToken := "wQ8Lk5FbGpA2NcR9dShT6gYjU7VxZ4D" + base64.StdEncoding.EncodeToString([]byte(`"`+seed+`"`))
	return errorToken, false
}

// GetPowToken generates initial PoW token
func GetPowToken(userAgent string) string {
	configList := GetPowConfig(userAgent)
	seed := fmt.Sprintf("%f", rand.Float64())
	difficulty := "0fffff"
	solution, _ := SolvePow(seed, difficulty, configList)
	return "gAAAAAC" + solution
}

// BuildSentinelToken builds openai-sentinel-token from PoW response
func BuildSentinelToken(flow, reqID, powToken string, resp map[string]interface{}, userAgent string) string {
	finalPowToken := powToken

	// Check if PoW is required
	if proofofwork, ok := resp["proofofwork"].(map[string]interface{}); ok {
		if required, ok := proofofwork["required"].(bool); ok && required {
			seed, _ := proofofwork["seed"].(string)
			difficulty, _ := proofofwork["difficulty"].(string)
			if seed != "" && difficulty != "" {
				configList := GetPowConfig(userAgent)
				solution, _ := SolvePow(seed, difficulty, configList)
				finalPowToken = "gAAAAAB" + solution
			}
		}
	}

	if !strings.HasSuffix(finalPowToken, "~S") {
		finalPowToken = finalPowToken + "~S"
	}

	turnstileDx := ""
	if turnstile, ok := resp["turnstile"].(map[string]interface{}); ok {
		turnstileDx, _ = turnstile["dx"].(string)
	}
	token, _ := resp["token"].(string)

	tokenPayload := map[string]string{
		"p":    finalPowToken,
		"t":    turnstileDx,
		"c":    token,
		"id":   reqID,
		"flow": flow,
	}

	jsonBytes, _ := json.Marshal(tokenPayload)
	return string(jsonBytes)
}

// GeneratePowToken generates a simple proof-of-work token (legacy)
func GeneratePowToken(seed string, difficulty int) (string, error) {
	prefix := strings.Repeat("0", difficulty)

	for nonce := 0; nonce < 10000000; nonce++ {
		token := fmt.Sprintf("%s:%d", seed, nonce)
		hash := HashSHA3_512String(token)

		if strings.HasPrefix(hash, prefix) {
			return token, nil
		}
	}

	return "", fmt.Errorf("failed to find valid nonce within limit")
}

// VerifyPowToken verifies that a PoW token is valid (legacy)
func VerifyPowToken(token, seed string, difficulty int) bool {
	if !strings.HasPrefix(token, seed+":") {
		return false
	}

	prefix := strings.Repeat("0", difficulty)
	hash := HashSHA3_512String(token)

	return strings.HasPrefix(hash, prefix)
}
