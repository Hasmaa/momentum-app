import { Task } from '../../../types';

export interface PomodoroSession {
  taskId: string | null;
  status: 'idle' | 'running' | 'paused' | 'completed';
  timeRemaining: number; // in seconds
  totalFocusTime: number; // in seconds
  completedPomodoros: number;
  currentCycle: 'focus' | 'shortBreak' | 'longBreak';
}

export interface PomodoroSettings {
  focusDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  longBreakInterval: number; // number of pomodoros before a long break
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
}

export interface PomodoroStats {
  totalFocusTime: number; // in seconds
  completedPomodoros: number;
  completedTasks: number;
}

export interface PomodoroButtonProps {
  onClick: () => void;
  task?: Task;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  colorScheme?: string;
  variant?: string;
  isCompact?: boolean;
}

export interface PomodoroModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTask: Task | null;
  tasks: Task[];
  onTaskComplete: (taskId: string) => Promise<void>;
} 