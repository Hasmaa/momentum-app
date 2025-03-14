import { useState, useEffect, useRef, useCallback } from 'react';
import { PomodoroSession, PomodoroSettings } from '../types/pomodoro';
import { Task } from '../../../types';

// Default settings
const DEFAULT_SETTINGS: PomodoroSettings = {
  focusDuration: 25, // 25 minutes
  shortBreakDuration: 5, // 5 minutes
  longBreakDuration: 15, // 15 minutes
  longBreakInterval: 4, // After 4 pomodoros
  autoStartBreaks: false,
  autoStartPomodoros: false,
};

export const usePomodoro = (task?: Task | null) => {
  // State
  const [session, setSession] = useState<PomodoroSession>({
    taskId: task?.id || null,
    status: 'idle',
    timeRemaining: DEFAULT_SETTINGS.focusDuration * 60, // Convert to seconds
    totalFocusTime: 0,
    completedPomodoros: 0,
    currentCycle: 'focus',
  });
  
  const [settings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);
  const timerRef = useRef<number | null>(null);

  // Set task ID when task changes
  useEffect(() => {
    if (task) {
      setSession(prev => ({ ...prev, taskId: task.id }));
    }
  }, [task]);

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, []);

  // Update session state
  const updateSession = useCallback((updates: Partial<PomodoroSession>) => {
    setSession(prev => ({ ...prev, ...updates }));
  }, []);

  // Format time as MM:SS
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Start the timer
  const start = useCallback(() => {
    if (session.status === 'running') return;
    
    updateSession({ status: 'running' });
    
    timerRef.current = window.setInterval(() => {
      setSession(prev => {
        // Decrement time remaining
        if (prev.timeRemaining <= 0) {
          // Time's up, handle cycle completion
          if (prev.currentCycle === 'focus') {
            // Completed a focus session
            const completedPomodoros = prev.completedPomodoros + 1;
            const shouldTakeLongBreak = completedPomodoros % settings.longBreakInterval === 0;
            const nextCycle = shouldTakeLongBreak ? 'longBreak' : 'shortBreak';
            const breakDuration = shouldTakeLongBreak ? 
              settings.longBreakDuration : settings.shortBreakDuration;
            
            // Play sound or show notification
            const audio = new Audio('/sounds/bell.mp3');
            audio.play().catch(err => console.error('Error playing sound:', err));
            
            // Show browser notification
            if (Notification.permission === 'granted') {
              new Notification('Pomodoro completed!', {
                body: 'Time for a break!',
                icon: '/favicon.ico'
              });
            }
            
            return {
              ...prev,
              status: settings.autoStartBreaks ? 'running' : 'paused',
              currentCycle: nextCycle,
              timeRemaining: breakDuration * 60,
              completedPomodoros,
              totalFocusTime: prev.totalFocusTime + (settings.focusDuration * 60)
            };
          } else {
            // Completed a break
            // Play sound or show notification
            const audio = new Audio('/sounds/bell.mp3');
            audio.play().catch(err => console.error('Error playing sound:', err));
            
            // Show browser notification
            if (Notification.permission === 'granted') {
              new Notification('Break completed!', {
                body: 'Time to focus!',
                icon: '/favicon.ico'
              });
            }
            
            return {
              ...prev,
              status: settings.autoStartPomodoros ? 'running' : 'paused',
              currentCycle: 'focus',
              timeRemaining: settings.focusDuration * 60
            };
          }
        }
        
        // Normal countdown
        return {
          ...prev,
          timeRemaining: prev.timeRemaining - 1
        };
      });
    }, 1000);
    
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [session.status, settings, updateSession]);

  // Pause the timer
  const pause = useCallback(() => {
    if (session.status !== 'running') return;
    
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    updateSession({ status: 'paused' });
  }, [session.status, updateSession]);

  // Resume the timer
  const resume = useCallback(() => {
    if (session.status !== 'paused') return;
    start();
  }, [session.status, start]);

  // Reset the timer
  const reset = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setSession({
      taskId: session.taskId,
      status: 'idle',
      timeRemaining: settings.focusDuration * 60,
      totalFocusTime: session.totalFocusTime,
      completedPomodoros: session.completedPomodoros,
      currentCycle: 'focus'
    });
  }, [session.taskId, session.totalFocusTime, session.completedPomodoros, settings]);

  // Complete the current session
  const complete = useCallback(() => {
    pause();
    updateSession({ status: 'completed' });
  }, [pause, updateSession]);

  // Reset to a new task
  const changeTask = useCallback((newTask: Task | null) => {
    // If timer is running, stop it
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setSession({
      taskId: newTask?.id || null,
      status: 'idle',
      timeRemaining: settings.focusDuration * 60,
      totalFocusTime: 0,
      completedPomodoros: 0,
      currentCycle: 'focus'
    });
  }, [settings]);

  // Request notification permissions if we don't have them
  useEffect(() => {
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);

  return {
    session,
    formattedTime: formatTime(session.timeRemaining),
    cycleLabel: session.currentCycle === 'focus' ? 'Focus' : 
                session.currentCycle === 'shortBreak' ? 'Short Break' : 'Long Break',
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