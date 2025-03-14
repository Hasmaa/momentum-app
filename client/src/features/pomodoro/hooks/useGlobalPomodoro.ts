import { useState, useEffect, useCallback, useRef } from 'react';
import { Task } from '../../../types';
import { usePomodoroStore } from './usePomodoroStore';
import { useToast } from '@chakra-ui/react';

export interface PomodoroState {
  time: number;
  totalTime: number;
  isRunning: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  cycleCount: number;
  task: Task | null;
}

export interface PomodoroActions {
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  complete: () => void;
  changeTask: (task: Task | null) => void;
}

export interface PomodoroHook {
  state: PomodoroState;
  actions: PomodoroActions;
}

/**
 * Custom hook to manage a global Pomodoro timer
 */
export const useGlobalPomodoro = (initialTask: Task | null = null): PomodoroHook => {
  const store = usePomodoroStore();
  const toast = useToast();
  const [timerId, setTimerId] = useState<string | null>(null);
  const lastTaskIdRef = useRef<string | null>(initialTask?.id || null);
  const [state, setState] = useState<PomodoroState>({
    time: 25 * 60 * 1000, // 25 minutes in ms
    totalTime: 25 * 60 * 1000,
    isRunning: false,
    isPaused: false,
    isCompleted: false,
    cycleCount: 1,
    task: initialTask
  });

  // Debug when task changes
  useEffect(() => {
    console.log('[useGlobalPomodoro] Task changed:', state.task?.id);
  }, [state.task?.id]);

  // Debug when timer ID changes
  useEffect(() => {
    console.log('[useGlobalPomodoro] Timer ID changed:', timerId);
  }, [timerId]);

  // If we have a task ID, check if there's already a timer for it
  useEffect(() => {
    if (state.task?.id && state.task.id !== lastTaskIdRef.current) {
      lastTaskIdRef.current = state.task.id;
      
      const existingTimer = store.getTimerByTaskId(state.task.id);
      if (existingTimer) {
        console.log(`[useGlobalPomodoro] Found existing timer for task ${state.task.id}:`, existingTimer);
        // Use the existing timer
        setTimerId(existingTimer.id);
        
        setState({
          time: existingTimer.remainingTime,
          totalTime: existingTimer.totalTime,
          isRunning: existingTimer.isRunning,
          isPaused: existingTimer.isPaused,
          isCompleted: existingTimer.isCompleted,
          cycleCount: existingTimer.cycleCount,
          task: existingTimer.task
        });
      }
    }
  }, [state.task?.id, store]);

  const start = useCallback(() => {
    console.log('[useGlobalPomodoro] Starting timer for task:', state.task?.id);
    
    if (!state.task) {
      toast({
        title: "No task selected",
        description: "Please select a task before starting the timer",
        status: "warning",
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    // Create a timer in the store if we don't have one
    if (!timerId) {
      console.log('[useGlobalPomodoro] Creating new timer in store');
      const newTimerId = store.addTimer({
        taskId: state.task.id,
        task: state.task,
        remainingTime: state.time,
        totalTime: state.totalTime,
        cycleCount: state.cycleCount,
        isRunning: true,
        isPaused: false,
        isCompleted: false
      });
      
      setTimerId(newTimerId);
      setState(prev => ({
        ...prev,
        isRunning: true,
        isPaused: false
      }));
    } else {
      // Update the existing timer
      console.log('[useGlobalPomodoro] Updating existing timer');
      store.updateTimer(timerId, {
        isRunning: true,
        isPaused: false
      });
      
      setState(prev => ({
        ...prev,
        isRunning: true,
        isPaused: false
      }));
    }
  }, [state.task, state.time, state.totalTime, state.cycleCount, store, timerId, toast]);

  const pause = useCallback(() => {
    console.log('[useGlobalPomodoro] Pausing timer:', timerId);
    if (timerId) {
      store.updateTimer(timerId, {
        isRunning: true,
        isPaused: true
      });
      
      setState(prev => ({
        ...prev,
        isPaused: true
      }));
    }
  }, [timerId, store]);

  const resume = useCallback(() => {
    console.log('[useGlobalPomodoro] Resuming timer:', timerId);
    if (timerId) {
      store.updateTimer(timerId, {
        isRunning: true,
        isPaused: false
      });
      
      setState(prev => ({
        ...prev,
        isPaused: false
      }));
    }
  }, [timerId, store]);

  const reset = useCallback(() => {
    console.log('[useGlobalPomodoro] Resetting timer:', timerId);
    if (timerId) {
      store.updateTimer(timerId, {
        remainingTime: state.totalTime,
        isRunning: false,
        isPaused: false
      });
      
      setState(prev => ({
        ...prev,
        time: prev.totalTime,
        isRunning: false,
        isPaused: false
      }));
    }
  }, [timerId, store, state.totalTime]);

  const complete = useCallback(() => {
    console.log('[useGlobalPomodoro] Completing timer:', timerId);
    if (timerId) {
      // Mark the timer as completed
      store.updateTimer(timerId, {
        isCompleted: true,
        isRunning: false
      });
      
      // Optionally remove the timer
      store.removeTimer(timerId);
      
      // Reset local state
      setTimerId(null);
      setState(prev => ({
        ...prev,
        isRunning: false,
        isPaused: false,
        isCompleted: true
      }));
      
      toast({
        title: "Pomodoro completed!",
        description: `You've completed a pomodoro session for "${state.task?.title}"`,
        status: "success",
        duration: 5000,
        isClosable: true
      });
    }
  }, [timerId, store, state.task?.title, toast]);

  const changeTask = useCallback((task: Task | null) => {
    // Skip if it's the same task
    if (task?.id === state.task?.id) {
      console.log('[useGlobalPomodoro] Task unchanged, skipping update');
      return;
    }
    
    console.log('[useGlobalPomodoro] Changing task to:', task?.id);
    
    // If we have a current timer, update it or remove it
    if (timerId) {
      if (task) {
        // Update the task on the existing timer
        store.updateTimer(timerId, {
          taskId: task.id,
          task: task
        });
      } else {
        // Remove the timer if there's no task
        store.removeTimer(timerId);
        setTimerId(null);
      }
    }
    
    // Check if the new task already has a timer
    if (task?.id) {
      const existingTimer = store.getTimerByTaskId(task.id);
      if (existingTimer) {
        console.log(`[useGlobalPomodoro] Found existing timer for task ${task.id}:`, existingTimer);
        // Use the existing timer
        setTimerId(existingTimer.id);
        
        setState({
          time: existingTimer.remainingTime,
          totalTime: existingTimer.totalTime,
          isRunning: existingTimer.isRunning,
          isPaused: existingTimer.isPaused,
          isCompleted: existingTimer.isCompleted,
          cycleCount: existingTimer.cycleCount,
          task: existingTimer.task
        });
        
        return;
      }
    }
    
    // Set the last task ID ref to the new task ID
    lastTaskIdRef.current = task?.id || null;
    
    // Update state with the new task
    setState(prev => ({
      ...prev,
      task,
      isRunning: false,
      isPaused: false,
      isCompleted: false
    }));
  }, [timerId, store, state.task?.id]);

  // Listen for updates to the timer in the store
  useEffect(() => {
    if (!timerId) return;
    
    // Set up an interval to update the timer every second
    const interval = setInterval(() => {
      const timer = timerId ? store.activeTimers.find(t => t.id === timerId) : null;
      
      if (timer) {
        // Update our local state to match the store
        setState({
          time: timer.remainingTime,
          totalTime: timer.totalTime,
          isRunning: timer.isRunning,
          isPaused: timer.isPaused,
          isCompleted: timer.isCompleted,
          cycleCount: timer.cycleCount,
          task: timer.task
        });
        
        // If timer is running and not paused, decrement the time
        if (timer.isRunning && !timer.isPaused && !timer.isCompleted) {
          const newTime = Math.max(0, timer.remainingTime - 1000);
          
          // Update the store
          store.updateTimer(timerId, {
            remainingTime: newTime
          });
          
          // If time is up, handle completion
          if (newTime === 0) {
            console.log('[useGlobalPomodoro] Timer completed naturally');
            store.updateTimer(timerId, {
              isCompleted: true,
              isRunning: false
            });
            
            toast({
              title: "Pomodoro completed!",
              description: `You've completed a pomodoro session for "${timer.task?.title}"`,
              status: "success",
              duration: 5000,
              isClosable: true
            });
          }
        }
      } else {
        // Timer was removed from store, clear our reference
        console.log('[useGlobalPomodoro] Timer not found in store, clearing reference');
        clearInterval(interval);
        setTimerId(null);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [timerId, store, toast]);

  return {
    state,
    actions: {
      start,
      pause,
      resume,
      reset,
      complete,
      changeTask
    }
  };
}; 