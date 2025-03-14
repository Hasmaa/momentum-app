import { useState, useEffect, useCallback, useRef } from 'react';
import { Task } from '../../../types';
import { usePomodoroStore, DEFAULT_POMODORO_TIME } from './usePomodoroStore';
import { useToast } from '@chakra-ui/react';

export interface PomodoroState {
  time: number;
  totalTime: number;
  isRunning: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  cycleCount: number;
  task: Task | null;
  completedSessions: number;
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
  const intervalRef = useRef<number | null>(null);
  const [state, setState] = useState<PomodoroState>({
    time: DEFAULT_POMODORO_TIME,
    totalTime: DEFAULT_POMODORO_TIME,
    isRunning: false,
    isPaused: false,
    isCompleted: false,
    cycleCount: 1,
    task: initialTask,
    completedSessions: initialTask ? store.getCompletedPomodorosForTask(initialTask.id) : 0
  });

  // Sync with store when component mounts
  useEffect(() => {
    // If we have a timer in the store, use its state
    if (store.timer) {
      setState({
        time: store.timer.remainingTime,
        totalTime: store.timer.totalTime,
        isRunning: store.timer.isRunning,
        isPaused: store.timer.isPaused,
        isCompleted: false,
        cycleCount: store.timer.cycleCount,
        task: store.timer.task,
        completedSessions: store.timer.taskId ? store.getCompletedPomodorosForTask(store.timer.taskId) : 0
      });
    } else if (initialTask) {
      // If we have an initial task but no timer, update the task
      setState(prev => ({
        ...prev,
        task: initialTask,
        completedSessions: store.getCompletedPomodorosForTask(initialTask.id)
      }));
    }
    
    // Set up a timer to update the remaining time
    const updateTimer = () => {
      if (store.timer && store.timer.isRunning && !store.timer.isPaused) {
        store.updateTimer({
          remainingTime: Math.max(0, store.timer.remainingTime - 1000)
        });
        
        // If time is up, complete the timer
        if (store.timer.remainingTime <= 0) {
          store.completeTimer(true);
          
          const taskTitle = store.timer.task?.title || "your task";
          toast({
            title: "Pomodoro completed!",
            description: `You've completed a pomodoro session for "${taskTitle}"`,
            status: "success",
            duration: 5000,
            isClosable: true
          });
        }
      }
    };
    
    intervalRef.current = window.setInterval(updateTimer, 1000);
    
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [store, initialTask, toast]);
  
  // Sync with store when timer changes
  useEffect(() => {
    const unsubscribe = usePomodoroStore.subscribe(
      () => {
        const timer = store.timer;
        
        if (timer) {
          setState(prev => ({
            ...prev,
            time: timer.remainingTime,
            totalTime: timer.totalTime,
            isRunning: timer.isRunning,
            isPaused: timer.isPaused,
            isCompleted: false,
            cycleCount: timer.cycleCount,
            task: timer.task,
            completedSessions: timer.taskId ? store.getCompletedPomodorosForTask(timer.taskId) : 0
          }));
        } else {
          // Timer was completed or removed
          setState(prev => ({
            ...prev,
            isRunning: false,
            isPaused: false,
            isCompleted: true,
            // Keep the task and update completed sessions
            completedSessions: prev.task?.id ? store.getCompletedPomodorosForTask(prev.task.id) : 0
          }));
        }
      }
    );
    
    return () => unsubscribe();
  }, [store]);
  
  // Start the timer
  const start = useCallback(() => {
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
    
    store.startTimer(state.task, state.totalTime);
  }, [state.task, state.totalTime, store, toast]);
  
  // Pause the timer
  const pause = useCallback(() => {
    store.pauseTimer();
  }, [store]);
  
  // Resume the timer
  const resume = useCallback(() => {
    store.resumeTimer();
  }, [store]);
  
  // Reset the timer
  const reset = useCallback(() => {
    store.resetTimer();
  }, [store]);
  
  // Complete the timer
  const complete = useCallback(() => {
    store.completeTimer(true);
  }, [store]);
  
  // Change the task
  const changeTask = useCallback((task: Task | null) => {
    // Skip if it's the same task
    if (task?.id === state.task?.id) {
      return;
    }
    
    // Update task in the store if a timer is running
    store.setTask(task);
    
    // Update local state
    setState(prev => ({
      ...prev,
      task,
      completedSessions: task?.id ? store.getCompletedPomodorosForTask(task.id) : 0
    }));
  }, [state.task?.id, store]);
  
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