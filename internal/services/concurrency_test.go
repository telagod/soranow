package services

import (
	"sync"
	"sync/atomic"
	"testing"
	"time"
)

func TestConcurrencyManager_AcquireRelease(t *testing.T) {
	cm := NewConcurrencyManager()

	tokenID := int64(1)
	cm.SetLimit(tokenID, true, 2)  // image limit = 2

	// Acquire first slot
	if !cm.Acquire(tokenID, true) {
		t.Error("Expected to acquire first slot")
	}

	// Acquire second slot
	if !cm.Acquire(tokenID, true) {
		t.Error("Expected to acquire second slot")
	}

	// Third acquire should fail (non-blocking)
	if cm.TryAcquire(tokenID, true) {
		t.Error("Expected third acquire to fail")
	}

	// Release one slot
	cm.Release(tokenID, true)

	// Now should be able to acquire
	if !cm.TryAcquire(tokenID, true) {
		t.Error("Expected to acquire after release")
	}
}

func TestConcurrencyManager_SeparateImageVideo(t *testing.T) {
	cm := NewConcurrencyManager()

	tokenID := int64(1)
	cm.SetLimit(tokenID, true, 1)   // image limit = 1
	cm.SetLimit(tokenID, false, 1)  // video limit = 1

	// Acquire image slot
	if !cm.Acquire(tokenID, true) {
		t.Error("Expected to acquire image slot")
	}

	// Should still be able to acquire video slot
	if !cm.Acquire(tokenID, false) {
		t.Error("Expected to acquire video slot (separate from image)")
	}

	// Image slot should be full
	if cm.TryAcquire(tokenID, true) {
		t.Error("Expected image slot to be full")
	}

	// Video slot should be full
	if cm.TryAcquire(tokenID, false) {
		t.Error("Expected video slot to be full")
	}
}

func TestConcurrencyManager_UnlimitedConcurrency(t *testing.T) {
	cm := NewConcurrencyManager()

	tokenID := int64(1)
	cm.SetLimit(tokenID, true, -1)  // unlimited

	// Should be able to acquire many times
	for i := 0; i < 100; i++ {
		if !cm.Acquire(tokenID, true) {
			t.Errorf("Expected to acquire slot %d with unlimited concurrency", i)
		}
	}
}

func TestConcurrencyManager_ConcurrentAccess(t *testing.T) {
	cm := NewConcurrencyManager()

	tokenID := int64(1)
	limit := 5
	cm.SetLimit(tokenID, true, limit)

	var wg sync.WaitGroup
	var acquired int32
	var maxConcurrent int32
	var currentConcurrent int32

	// Try to acquire more than limit concurrently
	for i := 0; i < 20; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			if cm.Acquire(tokenID, true) {
				atomic.AddInt32(&acquired, 1)
				current := atomic.AddInt32(&currentConcurrent, 1)
				
				// Track max concurrent
				for {
					max := atomic.LoadInt32(&maxConcurrent)
					if current <= max || atomic.CompareAndSwapInt32(&maxConcurrent, max, current) {
						break
					}
				}

				time.Sleep(10 * time.Millisecond)
				atomic.AddInt32(&currentConcurrent, -1)
				cm.Release(tokenID, true)
			}
		}()
	}

	wg.Wait()

	if maxConcurrent > int32(limit) {
		t.Errorf("Max concurrent %d exceeded limit %d", maxConcurrent, limit)
	}
}

func TestConcurrencyManager_GetCurrentCount(t *testing.T) {
	cm := NewConcurrencyManager()

	tokenID := int64(1)
	cm.SetLimit(tokenID, true, 5)

	if cm.GetCurrentCount(tokenID, true) != 0 {
		t.Error("Expected initial count to be 0")
	}

	cm.Acquire(tokenID, true)
	cm.Acquire(tokenID, true)

	if cm.GetCurrentCount(tokenID, true) != 2 {
		t.Errorf("Expected count 2, got %d", cm.GetCurrentCount(tokenID, true))
	}

	cm.Release(tokenID, true)

	if cm.GetCurrentCount(tokenID, true) != 1 {
		t.Errorf("Expected count 1, got %d", cm.GetCurrentCount(tokenID, true))
	}
}

func TestConcurrencyManager_RemoveToken(t *testing.T) {
	cm := NewConcurrencyManager()

	tokenID := int64(1)
	cm.SetLimit(tokenID, true, 2)
	cm.Acquire(tokenID, true)

	cm.RemoveToken(tokenID)

	// After removal, should use default behavior
	if cm.GetCurrentCount(tokenID, true) != 0 {
		t.Error("Expected count to be 0 after removal")
	}
}
