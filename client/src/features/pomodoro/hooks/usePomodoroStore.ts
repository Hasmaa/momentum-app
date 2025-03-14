import { create } from 'zustand';
import { Task } from '../../../types';

export interface CompletedPomodoroSession {
  id: string;
  taskId: string;
  taskTitle: string;
  startTime: number;
  endTime: number;
  duration: number;
}

export interface PomodoroTimer {
  taskId: string | null;
  task: Task | null;
  remainingTime: number;
  totalTime: number;
  cycleCount: number;
  isRunning: boolean;
  isPaused: boolean;
  startTime: number | null;
  lastResumeTime: number | null;
}

interface PomodoroStore {
  // Single global timer
  timer: PomodoroTimer | null;
  // History of completed sessions
  completedSessions: CompletedPomodoroSession[];
  // Set current task
  setTask: (task: Task | null) => void;
  // Start timer
  startTimer: (task: Task | null, duration?: number) => void;
  // Pause timer
  pauseTimer: () => void;
  // Resume timer
  resumeTimer: () => void;
  // Reset timer
  resetTimer: () => void;
  // Complete timer and add to history
  completeTimer: (wasCompleted: boolean) => void;
  // Update timer
  updateTimer: (updates: Partial<PomodoroTimer>) => void;
  // Check if a timer is active
  isTimerActive: () => boolean;
  // Get total completed pomodoros for a task
  getCompletedPomodorosForTask: (taskId: string) => number;
}

export const DEFAULT_POMODORO_TIME = 25 * 60 * 1000; // 25 minutes in ms
export const DEFAULT_SHORT_BREAK = 5 * 60 * 1000; // 5 minutes in ms
export const DEFAULT_LONG_BREAK = 15 * 60 * 1000; // 15 minutes in ms

export const usePomodoroStore = create<PomodoroStore>((set, get) => ({
  timer: null,
  completedSessions: [],

  setTask: (task) => {
    console.log('[PomodoroStore] Setting task:', task?.id || 'none');
    
    set((state) => {
      // If we have an active timer, update its task
      if (state.timer) {
        return {
          timer: {
            ...state.timer,
            taskId: task?.id || null,
            task: task
          }
        };
      }
      return state;
    });
  },

  startTimer: (task, duration = DEFAULT_POMODORO_TIME) => {
    console.log(`[PomodoroStore] Starting timer for task: ${task?.id || 'no task'}`);
    const now = Date.now();
    
    set({
      timer: {
        taskId: task?.id || null,
        task: task,
        remainingTime: duration,
        totalTime: duration,
        cycleCount: 1,
        isRunning: true,
        isPaused: false,
        startTime: now,
        lastResumeTime: now
      }
    });
  },

  pauseTimer: () => {
    console.log('[PomodoroStore] Pausing timer');
    
    set((state) => {
      if (!state.timer) return state;
      
      return {
        timer: {
          ...state.timer,
          isPaused: true,
          isRunning: true, // Still considered running, just paused
        }
      };
    });
  },

  resumeTimer: () => {
    console.log('[PomodoroStore] Resuming timer');
    const now = Date.now();
    
    set((state) => {
      if (!state.timer) return state;
      
      return {
        timer: {
          ...state.timer,
          isPaused: false,
          isRunning: true,
          lastResumeTime: now
        }
      };
    });
  },

  resetTimer: () => {
    console.log('[PomodoroStore] Resetting timer');
    
    set((state) => {
      if (!state.timer) return state;
      
      return {
        timer: {
          ...state.timer,
          remainingTime: state.timer.totalTime,
          isRunning: false,
          isPaused: false,
          startTime: null,
          lastResumeTime: null
        }
      };
    });
  },

  completeTimer: (wasCompleted = true) => {
    console.log('[PomodoroStore] Completing timer');
    const now = Date.now();
    
    set((state) => {
      if (!state.timer || !state.timer.taskId) {
        return {
          timer: null
        };
      }
      
      // Only add to completed sessions if this is a legitimate completion
      // (not a reset or skip)
      if (wasCompleted && state.timer.taskId) {
        const session: CompletedPomodoroSession = {
          id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          taskId: state.timer.taskId,
          taskTitle: state.timer.task?.title || 'Unknown Task',
          startTime: state.timer.startTime || now - state.timer.totalTime,
          endTime: now,
          duration: state.timer.totalTime
        };
        
        return {
          timer: null,
          completedSessions: [...state.completedSessions, session]
        };
      }
      
      return {
        timer: null
      };
    });
  },

  updateTimer: (updates) => {
    console.log('[PomodoroStore] Updating timer:', updates);
    
    set((state) => {
      if (!state.timer) return state;
      
      return {
        timer: {
          ...state.timer,
          ...updates
        }
      };
    });
  },

  isTimerActive: () => {
    const state = get();
    return !!state.timer && state.timer.isRunning;
  },

  getCompletedPomodorosForTask: (taskId) => {
    const state = get();
    return state.completedSessions.filter(session => session.taskId === taskId).length;
  }
})); 