import React, { useEffect, useState, useCallback, memo, useRef } from 'react';
import { Box, Text, Progress, Flex, Badge, useColorModeValue } from '@chakra-ui/react';
import { PomodoroTimer, usePomodoroStore } from '../hooks/usePomodoroStore';

interface MiniTimerProps {
  timer: PomodoroTimer;
}

const MiniTimer: React.FC<MiniTimerProps> = memo(({ timer }) => {
  const [timeDisplay, setTimeDisplay] = useState('');
  const [progress, setProgress] = useState(0);
  const [updateKey, setUpdateKey] = useState(0); // Force re-render when needed
  const intervalRef = useRef<number | null>(null);
  const timerIdRef = useRef<string>(timer.id);
  const store = usePomodoroStore();

  // Format time as MM:SS
  const formatTime = useCallback((ms: number) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);
  
  // Clear interval helper function
  const clearTimerInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);
  
  // Reset timer display when timer changes
  useEffect(() => {
    // If the timer ID changes, update our ref
    if (timer.id !== timerIdRef.current) {
      timerIdRef.current = timer.id;
    }
    
    console.log(`[MiniTimer] Timer updated: ${timer.id}, isRunning: ${timer.isRunning}, isPaused: ${timer.isPaused}`);
    setUpdateKey(prev => prev + 1);
    
    // Always clear previous interval when timer state changes
    clearTimerInterval();
    
    return () => {
      clearTimerInterval();
    };
  }, [timer.id, timer.isRunning, timer.isPaused, timer.isCompleted, clearTimerInterval]);

  // Update timer display at regular intervals
  useEffect(() => {
    if (!timer) return;
    
    const updateDisplay = () => {
      setTimeDisplay(formatTime(timer.remainingTime));
      setProgress((timer.totalTime - timer.remainingTime) / timer.totalTime * 100);
    };
    
    // Initial update
    updateDisplay();
    
    // Only set interval if timer is running and not paused
    if (timer.isRunning && !timer.isPaused && !timer.isCompleted) {
      console.log(`[MiniTimer] Starting interval for timer ${timer.id}`);
      
      // Clear any existing interval first
      clearTimerInterval();
      
      // Set new interval
      intervalRef.current = window.setInterval(() => {
        const currentTimer = store.activeTimers.find(t => t.id === timerIdRef.current);
        if (currentTimer) {
          setTimeDisplay(formatTime(currentTimer.remainingTime));
          setProgress((currentTimer.totalTime - currentTimer.remainingTime) / currentTimer.totalTime * 100);
        } else {
          // Timer no longer exists in store, clear interval
          clearTimerInterval();
        }
      }, 1000);
    } else if (timer.isPaused) {
      console.log(`[MiniTimer] Timer ${timer.id} is paused`);
    } else if (timer.isCompleted) {
      console.log(`[MiniTimer] Timer ${timer.id} is completed`);
    } else {
      console.log(`[MiniTimer] Timer ${timer.id} is stopped`);
    }
    
    return () => {
      clearTimerInterval();
    };
  }, [timer, formatTime, updateKey, clearTimerInterval, store.activeTimers]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearTimerInterval();
    };
  }, [clearTimerInterval]);

  const handlePause = useCallback(() => {
    console.log(`[MiniTimer] Pausing timer ${timer.id}`);
    store.updateTimer(timer.id, { isRunning: true, isPaused: true });
  }, [store, timer.id]);
  
  const handleResume = useCallback(() => {
    console.log(`[MiniTimer] Resuming timer ${timer.id}`);
    store.updateTimer(timer.id, { isRunning: true, isPaused: false });
  }, [store, timer.id]);
  
  const handleStop = useCallback(() => {
    console.log(`[MiniTimer] Stopping timer ${timer.id}`);
    store.removeTimer(timer.id);
  }, [store, timer.id]);

  if (!timer) return null;

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={1}>
        <Text fontWeight="bold" fontSize="sm" isTruncated maxWidth="70%">
          {timer.task?.title || 'Untitled Task'}
        </Text>
        <Badge 
          colorScheme={timer.isPaused ? 'yellow' : timer.isRunning ? 'green' : 'gray'} 
          fontSize="xs"
        >
          {timer.isPaused ? 'PAUSED' : timer.isRunning ? 'RUNNING' : 'IDLE'}
        </Badge>
      </Flex>
      <Progress 
        value={progress} 
        size="sm" 
        colorScheme="blue" 
        borderRadius="full" 
        mb={1}
      />
      <Flex justifyContent="space-between" fontSize="xs">
        <Text>{timeDisplay}</Text>
        <Text>Cycle: {timer.cycleCount}</Text>
      </Flex>
    </Box>
  );
});

MiniTimer.displayName = 'MiniTimer';

export default MiniTimer; 