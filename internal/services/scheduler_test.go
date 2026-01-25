package services

import (
	"sync/atomic"
	"testing"
	"time"
)

func TestScheduler_NewScheduler(t *testing.T) {
	scheduler := NewScheduler()

	if scheduler == nil {
		t.Fatal("Expected non-nil scheduler")
	}
}

func TestScheduler_AddTask(t *testing.T) {
	scheduler := NewScheduler()

	var counter int32
	task := func() {
		atomic.AddInt32(&counter, 1)
	}

	scheduler.AddTask("test_task", 100*time.Millisecond, task)

	// Wait for task to run a few times
	time.Sleep(350 * time.Millisecond)

	scheduler.Stop()

	count := atomic.LoadInt32(&counter)
	if count < 2 {
		t.Errorf("Expected task to run at least 2 times, got %d", count)
	}
}

func TestScheduler_RemoveTask(t *testing.T) {
	scheduler := NewScheduler()

	var counter int32
	task := func() {
		atomic.AddInt32(&counter, 1)
	}

	scheduler.AddTask("removable_task", 50*time.Millisecond, task)

	// Wait for task to run once
	time.Sleep(75 * time.Millisecond)

	// Remove the task
	scheduler.RemoveTask("removable_task")

	countAfterRemove := atomic.LoadInt32(&counter)

	// Wait more time
	time.Sleep(150 * time.Millisecond)

	scheduler.Stop()

	countFinal := atomic.LoadInt32(&counter)

	// Counter should not have increased much after removal
	if countFinal > countAfterRemove+1 {
		t.Errorf("Task continued running after removal: before=%d, after=%d", countAfterRemove, countFinal)
	}
}

func TestScheduler_Stop(t *testing.T) {
	scheduler := NewScheduler()

	var counter int32
	task := func() {
		atomic.AddInt32(&counter, 1)
	}

	scheduler.AddTask("stop_test", 50*time.Millisecond, task)

	// Wait for task to run
	time.Sleep(75 * time.Millisecond)

	scheduler.Stop()

	countAfterStop := atomic.LoadInt32(&counter)

	// Wait more time
	time.Sleep(150 * time.Millisecond)

	countFinal := atomic.LoadInt32(&counter)

	// Counter should not increase after stop
	if countFinal > countAfterStop {
		t.Errorf("Tasks continued after stop: before=%d, after=%d", countAfterStop, countFinal)
	}
}

func TestScheduler_MultipleTasks(t *testing.T) {
	scheduler := NewScheduler()

	var counter1, counter2 int32

	scheduler.AddTask("task1", 50*time.Millisecond, func() {
		atomic.AddInt32(&counter1, 1)
	})

	scheduler.AddTask("task2", 100*time.Millisecond, func() {
		atomic.AddInt32(&counter2, 1)
	})

	// Wait for tasks to run
	time.Sleep(250 * time.Millisecond)

	scheduler.Stop()

	count1 := atomic.LoadInt32(&counter1)
	count2 := atomic.LoadInt32(&counter2)

	if count1 < 3 {
		t.Errorf("Expected task1 to run at least 3 times, got %d", count1)
	}
	if count2 < 1 {
		t.Errorf("Expected task2 to run at least 1 time, got %d", count2)
	}
}

func TestScheduler_GetTaskNames(t *testing.T) {
	scheduler := NewScheduler()

	scheduler.AddTask("task_a", time.Hour, func() {})
	scheduler.AddTask("task_b", time.Hour, func() {})

	names := scheduler.GetTaskNames()

	if len(names) != 2 {
		t.Errorf("Expected 2 task names, got %d", len(names))
	}

	scheduler.Stop()
}
