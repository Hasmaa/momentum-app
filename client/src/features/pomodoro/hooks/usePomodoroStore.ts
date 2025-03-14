import { create } from 'zustand';
import { Task } from '../../../types';

export interface PomodoroTimer {
  id: string;
  taskId: string | null;
  task: Task | null;
  remainingTime: number;
  totalTime: number;
  cycleCount: number;
  isRunning: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  lastUpdated: number; // Timestamp for tracking updates
}

interface PomodoroStore {
  activeTimers: PomodoroTimer[];
  addTimer: (timer: Omit<PomodoroTimer, 'id' | 'lastUpdated'>) => string;
  removeTimer: (id: string) => void;
  updateTimer: (id: string, updates: Partial<PomodoroTimer>) => void;
  getTimerByTaskId: (taskId: string) => PomodoroTimer | undefined;
  getRunningTimersCount: () => number;
}

export const usePomodoroStore = create<PomodoroStore>((set, get) => ({
  activeTimers: [],

  addTimer: (timer) => {
    const id = `timer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();
    console.log(`[PomodoroStore] Adding new timer ${id} for task ${timer.taskId || 'no task'}`);
    
    set((state) => {
      // Check if we already have a timer for this task
      if (timer.taskId) {
        const existingTimer = state.activeTimers.find(t => t.taskId === timer.taskId);
        if (existingTimer) {
          console.log(`[PomodoroStore] Already have timer ${existingTimer.id} for task ${timer.taskId}, not adding duplicate`);
          return state; // Don't add a duplicate timer
        }
      }
      
      return {
        activeTimers: [
          ...state.activeTimers,
          { ...timer, id, lastUpdated: now }
        ]
      };
    });
    
    // Log the current state after the update
    console.log(`[PomodoroStore] State after adding timer: ${get().activeTimers.length} timers, ${get().getRunningTimersCount()} running`);
    
    return id;
  },

  removeTimer: (id) => {
    console.log(`[PomodoroStore] Removing timer ${id}`);
    set((state) => ({
      activeTimers: state.activeTimers.filter((timer) => timer.id !== id)
    }));
    
    // Log the current state after the update
    console.log(`[PomodoroStore] State after removing timer: ${get().activeTimers.length} timers, ${get().getRunningTimersCount()} running`);
  },

  updateTimer: (id, updates) => {
    const now = Date.now();
    console.log(`[PomodoroStore] Updating timer ${id}`, updates);
    
    set((state) => ({
      activeTimers: state.activeTimers.map((timer) =>
        timer.id === id ? { ...timer, ...updates, lastUpdated: now } : timer
      )
    }));
    
    // Log the current state after the update
    const timer = get().activeTimers.find(t => t.id === id);
    console.log(`[PomodoroStore] State after updating timer: ${get().activeTimers.length} timers, ${get().getRunningTimersCount()} running`);
    if (timer) {
      console.log(`[PomodoroStore] Timer ${id} is now: isRunning=${timer.isRunning}, isPaused=${timer.isPaused}, isCompleted=${timer.isCompleted}`);
    }
  },

  getTimerByTaskId: (taskId) => {
    return get().activeTimers.find((timer) => timer.taskId === taskId);
  },
  
  getRunningTimersCount: () => {
    const runningCount = get().activeTimers.filter(
      (timer) => timer.isRunning && !timer.isPaused && !timer.isCompleted
    ).length;
    console.log(`[PomodoroStore] Running timers count: ${runningCount} out of ${get().activeTimers.length} total`);
    return runningCount;
  }
})); 