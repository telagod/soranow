package services

import (
	"sync"
	"time"
)

// TaskFunc is a function that can be scheduled
type TaskFunc func()

// scheduledTask represents a scheduled task
type scheduledTask struct {
	name     string
	interval time.Duration
	task     TaskFunc
	ticker   *time.Ticker
	stopCh   chan struct{}
}

// Scheduler manages scheduled tasks
type Scheduler struct {
	tasks map[string]*scheduledTask
	mu    sync.RWMutex
	wg    sync.WaitGroup
}

// NewScheduler creates a new scheduler
func NewScheduler() *Scheduler {
	return &Scheduler{
		tasks: make(map[string]*scheduledTask),
	}
}

// AddTask adds a new scheduled task
func (s *Scheduler) AddTask(name string, interval time.Duration, task TaskFunc) {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Remove existing task with same name
	if existing, ok := s.tasks[name]; ok {
		close(existing.stopCh)
	}

	st := &scheduledTask{
		name:     name,
		interval: interval,
		task:     task,
		ticker:   time.NewTicker(interval),
		stopCh:   make(chan struct{}),
	}

	s.tasks[name] = st

	s.wg.Add(1)
	go s.runTask(st)
}

// runTask runs a scheduled task
func (s *Scheduler) runTask(st *scheduledTask) {
	defer s.wg.Done()

	for {
		select {
		case <-st.ticker.C:
			st.task()
		case <-st.stopCh:
			st.ticker.Stop()
			return
		}
	}
}

// RemoveTask removes a scheduled task
func (s *Scheduler) RemoveTask(name string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if task, ok := s.tasks[name]; ok {
		close(task.stopCh)
		delete(s.tasks, name)
	}
}

// Stop stops all scheduled tasks
func (s *Scheduler) Stop() {
	s.mu.Lock()
	for _, task := range s.tasks {
		close(task.stopCh)
	}
	s.tasks = make(map[string]*scheduledTask)
	s.mu.Unlock()

	s.wg.Wait()
}

// GetTaskNames returns the names of all scheduled tasks
func (s *Scheduler) GetTaskNames() []string {
	s.mu.RLock()
	defer s.mu.RUnlock()

	names := make([]string, 0, len(s.tasks))
	for name := range s.tasks {
		names = append(names, name)
	}
	return names
}

// IsRunning checks if a task is running
func (s *Scheduler) IsRunning(name string) bool {
	s.mu.RLock()
	defer s.mu.RUnlock()

	_, ok := s.tasks[name]
	return ok
}
