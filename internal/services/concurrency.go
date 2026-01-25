package services

import (
	"sync"
)

// ConcurrencyManager manages per-token concurrency limits
type ConcurrencyManager struct {
	imageSem map[int64]*semaphore
	videoSem map[int64]*semaphore
	mu       sync.RWMutex
}

type semaphore struct {
	limit   int
	current int
	cond    *sync.Cond
	mu      sync.Mutex
}

func newSemaphore(limit int) *semaphore {
	s := &semaphore{limit: limit}
	s.cond = sync.NewCond(&s.mu)
	return s
}

func (s *semaphore) acquire() bool {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Unlimited concurrency
	if s.limit < 0 {
		s.current++
		return true
	}

	// Wait until slot available
	for s.current >= s.limit {
		s.cond.Wait()
	}
	s.current++
	return true
}

func (s *semaphore) tryAcquire() bool {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Unlimited concurrency
	if s.limit < 0 {
		s.current++
		return true
	}

	if s.current >= s.limit {
		return false
	}
	s.current++
	return true
}

func (s *semaphore) release() {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.current > 0 {
		s.current--
		s.cond.Signal()
	}
}

func (s *semaphore) getCurrent() int {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.current
}

// NewConcurrencyManager creates a new concurrency manager
func NewConcurrencyManager() *ConcurrencyManager {
	return &ConcurrencyManager{
		imageSem: make(map[int64]*semaphore),
		videoSem: make(map[int64]*semaphore),
	}
}

// SetLimit sets the concurrency limit for a token
func (cm *ConcurrencyManager) SetLimit(tokenID int64, forImage bool, limit int) {
	cm.mu.Lock()
	defer cm.mu.Unlock()

	if forImage {
		cm.imageSem[tokenID] = newSemaphore(limit)
	} else {
		cm.videoSem[tokenID] = newSemaphore(limit)
	}
}

// getSemaphore returns the semaphore for a token, creating one if needed
func (cm *ConcurrencyManager) getSemaphore(tokenID int64, forImage bool) *semaphore {
	cm.mu.RLock()
	var sem *semaphore
	if forImage {
		sem = cm.imageSem[tokenID]
	} else {
		sem = cm.videoSem[tokenID]
	}
	cm.mu.RUnlock()

	if sem == nil {
		cm.mu.Lock()
		// Double-check after acquiring write lock
		if forImage {
			if cm.imageSem[tokenID] == nil {
				cm.imageSem[tokenID] = newSemaphore(-1) // default unlimited
			}
			sem = cm.imageSem[tokenID]
		} else {
			if cm.videoSem[tokenID] == nil {
				cm.videoSem[tokenID] = newSemaphore(-1) // default unlimited
			}
			sem = cm.videoSem[tokenID]
		}
		cm.mu.Unlock()
	}

	return sem
}

// Acquire blocks until a slot is available
func (cm *ConcurrencyManager) Acquire(tokenID int64, forImage bool) bool {
	sem := cm.getSemaphore(tokenID, forImage)
	return sem.acquire()
}

// TryAcquire attempts to acquire a slot without blocking
func (cm *ConcurrencyManager) TryAcquire(tokenID int64, forImage bool) bool {
	sem := cm.getSemaphore(tokenID, forImage)
	return sem.tryAcquire()
}

// Release releases a slot
func (cm *ConcurrencyManager) Release(tokenID int64, forImage bool) {
	sem := cm.getSemaphore(tokenID, forImage)
	sem.release()
}

// GetCurrentCount returns the current number of acquired slots
func (cm *ConcurrencyManager) GetCurrentCount(tokenID int64, forImage bool) int {
	cm.mu.RLock()
	var sem *semaphore
	if forImage {
		sem = cm.imageSem[tokenID]
	} else {
		sem = cm.videoSem[tokenID]
	}
	cm.mu.RUnlock()

	if sem == nil {
		return 0
	}
	return sem.getCurrent()
}

// RemoveToken removes all semaphores for a token
func (cm *ConcurrencyManager) RemoveToken(tokenID int64) {
	cm.mu.Lock()
	defer cm.mu.Unlock()

	delete(cm.imageSem, tokenID)
	delete(cm.videoSem, tokenID)
}
