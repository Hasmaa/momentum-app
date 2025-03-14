import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  IconButton,
  Box,
  Text,
  VStack,
  HStack,
  Badge,
  Button,
  useColorModeValue,
  useDisclosure,
  Tooltip,
  Progress,
  Flex
} from '@chakra-ui/react';
import { FaClock, FaTimes, FaPlay, FaPause } from 'react-icons/fa';
import { usePomodoroStore } from '../hooks/usePomodoroStore';

interface ActiveTimersProps {
  onOpenPomodoro: () => void;
}

export const ActiveTimers: React.FC<ActiveTimersProps> = React.memo(({ 
  onOpenPomodoro
}) => {
  // Get the timer from the store
  const timer = usePomodoroStore(state => state.timer);
  const isActive = usePomodoroStore(state => state.isTimerActive());
  const pauseTimer = usePomodoroStore(state => state.pauseTimer);
  const resumeTimer = usePomodoroStore(state => state.resumeTimer);
  const completeTimer = usePomodoroStore(state => state.completeTimer);
  
  const [timeDisplay, setTimeDisplay] = useState('');
  const [progress, setProgress] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const timerRef = useRef<number | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const buttonBg = useColorModeValue('gray.100', 'gray.700');
  const hoverBg = useColorModeValue('gray.200', 'gray.600');

  // Format time as MM:SS
  const formatTime = useCallback((ms: number) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Update time display when timer changes
  useEffect(() => {
    if (!timer) {
      setTimeDisplay('00:00');
      setProgress(0);
      return;
    }
    
    const updateDisplay = () => {
      if (timer) {
        setTimeDisplay(formatTime(timer.remainingTime));
        setProgress((timer.totalTime - timer.remainingTime) / timer.totalTime * 100);
      }
    };
    
    updateDisplay();
    
    // Set up interval to update display
    timerRef.current = window.setInterval(updateDisplay, 1000);
    
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [timer, formatTime]);

  // Handle click on the task
  const handleViewPomodoro = useCallback(() => {
    onOpenPomodoro();
    onClose();
  }, [onOpenPomodoro, onClose]);
  
  // Toggle pause/resume
  const handleTogglePause = useCallback(() => {
    if (!timer) return;
    
    if (timer.isPaused) {
      resumeTimer();
    } else {
      pauseTimer();
    }
  }, [timer, pauseTimer, resumeTimer]);
  
  // Cancel the timer
  const handleCancelTimer = useCallback(() => {
    if (!timer) return;
    completeTimer(false);
    onClose();
  }, [timer, completeTimer, onClose]);
  
  return (
    <Popover
      isOpen={isOpen}
      onOpen={onOpen}
      onClose={onClose}
      placement="bottom-end"
      closeOnBlur={true}
      gutter={12}
    >
      <PopoverTrigger>
        <Box
          position="relative"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          display="inline-flex"
          alignItems="center"
          cursor="pointer"
          onClick={timer ? onOpen : onOpenPomodoro}
        >
          {isActive ? (
            <Badge
              colorScheme="red"
              borderRadius="full"
              px={2}
              py={1}
              fontWeight="bold"
            >
              {timeDisplay}
            </Badge>
          ) : (
            <Box 
              width="6px" 
              height="6px" 
              borderRadius="full" 
              bg={isHovering ? "gray.400" : "transparent"}
            />
          )}
        </Box>
      </PopoverTrigger>
      
      {timer && (
        <PopoverContent width="320px" shadow="lg">
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverHeader fontWeight="semibold">
            Active Pomodoro
          </PopoverHeader>
          <PopoverBody p={3}>
            <VStack align="stretch" spacing={3}>
              <Box 
                p={3}
                borderRadius="md"
                borderWidth="1px"
                bg={useColorModeValue('gray.50', 'gray.700')}
              >
                <Flex justifyContent="space-between" alignItems="center" mb={2}>
                  <Text fontWeight="bold" fontSize="md" isTruncated maxWidth="70%">
                    {timer.task?.title || 'Untitled Task'}
                  </Text>
                  <Badge 
                    colorScheme={timer.isPaused ? 'yellow' : 'green'} 
                    fontSize="xs"
                  >
                    {timer.isPaused ? 'PAUSED' : 'RUNNING'}
                  </Badge>
                </Flex>
                
                <Text fontSize="2xl" fontWeight="bold" textAlign="center" my={2} fontFamily="mono">
                  {timeDisplay}
                </Text>
                
                <Progress 
                  value={progress} 
                  size="sm" 
                  colorScheme="blue" 
                  borderRadius="full" 
                  mb={3}
                />
                
                <HStack spacing={3} justifyContent="center">
                  <Tooltip label={timer.isPaused ? "Resume" : "Pause"}>
                    <IconButton
                      icon={timer.isPaused ? <FaPlay /> : <FaPause />}
                      aria-label={timer.isPaused ? "Resume timer" : "Pause timer"}
                      size="sm"
                      colorScheme={timer.isPaused ? "green" : "yellow"}
                      onClick={handleTogglePause}
                    />
                  </Tooltip>
                  
                  <Button size="sm" colorScheme="blue" onClick={handleViewPomodoro}>
                    View Details
                  </Button>
                </HStack>
              </Box>
            </VStack>
          </PopoverBody>
          <PopoverFooter p={3}>
            <HStack justifyContent="flex-end">
              <Button 
                size="sm"
                leftIcon={<FaTimes />}
                variant="ghost"
                colorScheme="red"
                onClick={handleCancelTimer}
              >
                Cancel Timer
              </Button>
            </HStack>
          </PopoverFooter>
        </PopoverContent>
      )}
    </Popover>
  );
});

// Add display name for debugging
ActiveTimers.displayName = "ActiveTimers"; 