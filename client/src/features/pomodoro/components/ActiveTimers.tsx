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
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  useBreakpointValue
} from '@chakra-ui/react';
import { FaClock, FaTimes } from 'react-icons/fa';
import { usePomodoroStore } from '../hooks/usePomodoroStore';
import MiniTimer from './MiniTimer';

interface ActiveTimersProps {
  onSelectTask: (taskId: string) => void;
  onCompleteTask: (taskId: string) => Promise<void>;
}

export const ActiveTimers: React.FC<ActiveTimersProps> = React.memo(({ 
  onSelectTask, 
  onCompleteTask 
}) => {
  // Get timers directly from the store to stay in sync
  const activeTimers = usePomodoroStore(state => state.activeTimers);
  const getRunningTimersCount = usePomodoroStore(state => state.getRunningTimersCount);
  const removeTimer = usePomodoroStore(state => state.removeTimer);
  
  const [activeCount, setActiveCount] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const timerRef = useRef<number | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Use a drawer on mobile, popover on desktop
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  // Colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const buttonBg = useColorModeValue('gray.100', 'gray.700');
  const hoverBg = useColorModeValue('gray.200', 'gray.600');

  // Update active count when timers change or every second
  useEffect(() => {
    console.log('[ActiveTimers] Setting up timer effect');
    
    // Function to update active count
    const updateActiveCount = () => {
      const runningCount = getRunningTimersCount();
      console.log(`[ActiveTimers] Current count: ${runningCount} running timers out of ${activeTimers.length} total`);
      setActiveCount(runningCount);
    };
    
    // Initial update
    updateActiveCount();
    
    // Set up interval for time-based updates (for timer progress)
    timerRef.current = window.setInterval(updateActiveCount, 1000);
    
    // Clean up on unmount
    return () => {
      console.log('[ActiveTimers] Cleaning up timer effect');
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [activeTimers, getRunningTimersCount]); // Depend on the array and function to update when store changes
  
  const handleSelectTask = useCallback((taskId: string) => {
    console.log('[ActiveTimers] Selecting task:', taskId);
    onSelectTask(taskId);
    onClose();
  }, [onSelectTask, onClose]);
  
  const handleCompleteTask = useCallback(async (taskId: string) => {
    console.log('[ActiveTimers] Completing task:', taskId);
    await onCompleteTask(taskId);
  }, [onCompleteTask]);
  
  // Memoize the timer list to prevent rebuilding on every render
  const timerListMemo = useMemo(() => {
    console.log('[ActiveTimers] Building memoized timer list. Total timers:', activeTimers.length);
    
    if (activeTimers.length === 0) {
      return (
        <Text color="gray.500" textAlign="center" py={4}>
          No active timers
        </Text>
      );
    }
    
    return activeTimers.map((timer) => {
      console.log('[ActiveTimers] Adding timer to list:', timer.id, 'Status:', timer.isRunning ? 'running' : timer.isPaused ? 'paused' : 'idle');
      return (
        <Box 
          key={timer.id}
          mb={2}
          p={2}
          borderRadius="md"
          borderWidth="1px"
          onClick={() => timer.taskId ? handleSelectTask(timer.taskId) : null}
          cursor={timer.taskId ? "pointer" : "default"}
          _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
        >
          <MiniTimer 
            timer={timer}
          />
        </Box>
      );
    });
  }, [activeTimers, handleSelectTask]);
  
  // Determine if there are any running timers
  const hasRunningTimers = useMemo(() => 
    activeCount > 0,
    [activeCount]
  );
  
  // Memoize the clear all handler
  const handleClearAll = useCallback(() => {
    console.log('[ActiveTimers] Clearing all timers');
    // Get a copy of the timers first so we're not modifying during iteration
    const timersToRemove = [...activeTimers];
    timersToRemove.forEach(timer => {
      removeTimer(timer.id);
    });
    onClose();
  }, [activeTimers, removeTimer, onClose]);
  
  if (isMobile) {
    return (
      <>
        <IconButton
          icon={<FaClock />}
          aria-label="View active timers"
          position="fixed"
          bottom={6}
          right={6}
          size="lg"
          colorScheme={hasRunningTimers ? "red" : "gray"}
          borderRadius="full"
          boxShadow="lg"
          zIndex={5}
          onClick={onOpen}
        />
        {activeCount > 0 && (
          <Badge
            position="fixed"
            bottom="60px"
            right="10px"
            colorScheme="red"
            borderRadius="full"
            zIndex={6}
          >
            {activeCount}
          </Badge>
        )}
        
        <Drawer
          isOpen={isOpen}
          placement="right"
          onClose={onClose}
          size="sm"
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader borderBottomWidth="1px">
              Active Pomodoro Timers
            </DrawerHeader>
            <DrawerBody>
              <VStack align="stretch" spacing={3} maxH="400px" overflowY="auto">
                {timerListMemo}
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </>
    );
  }
  
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
        >
          <IconButton
            icon={<FaClock />}
            aria-label="View active timers"
            size="md"
            variant={isHovering || isOpen ? "solid" : "ghost"}
            colorScheme={hasRunningTimers ? "red" : "gray"}
            bg={isHovering || isOpen ? (hasRunningTimers ? "red.500" : buttonBg) : "transparent"}
            _hover={{ bg: hasRunningTimers ? "red.600" : hoverBg }}
          />
          {activeCount > 0 && (
            <Badge
              position="absolute"
              top="-2px"
              right="-2px"
              colorScheme="red"
              borderRadius="full"
              fontSize="xs"
            >
              {activeCount}
            </Badge>
          )}
        </Box>
      </PopoverTrigger>
      
      <PopoverContent width="320px" shadow="lg">
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader fontWeight="semibold">
          Active Pomodoro Timers
        </PopoverHeader>
        <PopoverBody p={3}>
          <VStack align="stretch" spacing={3} maxH="400px" overflowY="auto">
            {timerListMemo}
          </VStack>
        </PopoverBody>
        {activeTimers.length > 0 && (
          <PopoverFooter p={3}>
            <HStack justifyContent="flex-end">
              <Button 
                size="sm"
                leftIcon={<FaTimes />}
                onClick={handleClearAll}
              >
                Clear All
              </Button>
            </HStack>
          </PopoverFooter>
        )}
      </PopoverContent>
    </Popover>
  );
});

// Add display name for debugging
ActiveTimers.displayName = "ActiveTimers"; 