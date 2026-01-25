package services

import (
	"os"
	"path/filepath"
	"testing"
	"time"
)

func TestFileCache_NewCache(t *testing.T) {
	tmpDir := t.TempDir()
	cache := NewFileCache(tmpDir, 600, "http://localhost:8000")

	if cache == nil {
		t.Fatal("Expected non-nil cache")
	}
	if cache.baseDir != tmpDir {
		t.Errorf("Expected baseDir %s, got %s", tmpDir, cache.baseDir)
	}
}

func TestFileCache_SaveAndGet(t *testing.T) {
	tmpDir := t.TempDir()
	cache := NewFileCache(tmpDir, 600, "http://localhost:8000")

	// Save a file
	content := []byte("test content")
	url, err := cache.Save("test.txt", content)
	if err != nil {
		t.Fatalf("Failed to save file: %v", err)
	}

	if url == "" {
		t.Error("Expected non-empty URL")
	}

	// Get the file
	retrieved, err := cache.Get("test.txt")
	if err != nil {
		t.Fatalf("Failed to get file: %v", err)
	}

	if string(retrieved) != string(content) {
		t.Errorf("Expected content '%s', got '%s'", content, retrieved)
	}
}

func TestFileCache_GetNonExistent(t *testing.T) {
	tmpDir := t.TempDir()
	cache := NewFileCache(tmpDir, 600, "http://localhost:8000")

	_, err := cache.Get("nonexistent.txt")
	if err == nil {
		t.Error("Expected error for non-existent file")
	}
}

func TestFileCache_Delete(t *testing.T) {
	tmpDir := t.TempDir()
	cache := NewFileCache(tmpDir, 600, "http://localhost:8000")

	// Save a file
	content := []byte("test content")
	cache.Save("to_delete.txt", content)

	// Delete the file
	err := cache.Delete("to_delete.txt")
	if err != nil {
		t.Fatalf("Failed to delete file: %v", err)
	}

	// Verify it's deleted
	_, err = cache.Get("to_delete.txt")
	if err == nil {
		t.Error("Expected error after deletion")
	}
}

func TestFileCache_GetURL(t *testing.T) {
	tmpDir := t.TempDir()
	cache := NewFileCache(tmpDir, 600, "http://localhost:8000")

	url := cache.GetURL("test.png")
	expected := "http://localhost:8000/cache/test.png"
	if url != expected {
		t.Errorf("Expected URL '%s', got '%s'", expected, url)
	}
}

func TestFileCache_Cleanup(t *testing.T) {
	tmpDir := t.TempDir()
	cache := NewFileCache(tmpDir, 1, "http://localhost:8000") // 1 second timeout

	// Save a file
	content := []byte("test content")
	cache.Save("old_file.txt", content)

	// Wait for expiration
	time.Sleep(2 * time.Second)

	// Run cleanup
	cleaned := cache.Cleanup()

	if cleaned != 1 {
		t.Errorf("Expected 1 file cleaned, got %d", cleaned)
	}

	// Verify file is deleted
	_, err := cache.Get("old_file.txt")
	if err == nil {
		t.Error("Expected file to be cleaned up")
	}
}

func TestFileCache_SaveWithSubdir(t *testing.T) {
	tmpDir := t.TempDir()
	cache := NewFileCache(tmpDir, 600, "http://localhost:8000")

	// Save a file with subdirectory
	content := []byte("test content")
	url, err := cache.Save("images/test.png", content)
	if err != nil {
		t.Fatalf("Failed to save file: %v", err)
	}

	if url == "" {
		t.Error("Expected non-empty URL")
	}

	// Verify file exists
	filePath := filepath.Join(tmpDir, "images", "test.png")
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		t.Error("Expected file to exist")
	}
}

func TestFileCache_List(t *testing.T) {
	tmpDir := t.TempDir()
	cache := NewFileCache(tmpDir, 600, "http://localhost:8000")

	// Save multiple files
	cache.Save("file1.txt", []byte("content1"))
	cache.Save("file2.txt", []byte("content2"))
	cache.Save("file3.txt", []byte("content3"))

	files, err := cache.List()
	if err != nil {
		t.Fatalf("Failed to list files: %v", err)
	}

	if len(files) != 3 {
		t.Errorf("Expected 3 files, got %d", len(files))
	}
}
