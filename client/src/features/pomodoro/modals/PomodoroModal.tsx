import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Box,
  Select,
  Progress,
  useColorModeValue,
  Badge,
  IconButton,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Flex,
  useToast,
  Tooltip
} from '@chakra-ui/react';
import { FaPlay, FaPause, FaUndo, FaCheck, FaStopwatch } from 'react-icons/fa';
import { Task } from '../../../types';
import { PomodoroModalProps } from '../types/pomodoro';
import { useGlobalPomodoro } from '../hooks/useGlobalPomodoro';
import { usePomodoroStore } from '../hooks/usePomodoroStore';

const PomodoroModal: React.FC<PomodoroModalProps> = ({
  isOpen,
  onClose,
  selectedTask,
  tasks,
  onTaskComplete
}) => {
  const [taskId, setTaskId] = useState<string | null>(selectedTask?.id || null);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const lastSelectedTaskIdRef = useRef<string | null>(selectedTask?.id || null);
  const toast = useToast();

  // Convert tasks array to a map for easy lookup
  const tasksMap = tasks.reduce((acc, task) => {
    acc[task.id] = task;
    return acc;
  }, {} as Record<string, Task>);

  // Get current task
  const currentTask = taskId ? tasksMap[taskId] : null;

  // Initialize pomodoro hook
  const pomodoro = useGlobalPomodoro(currentTask);
  
  // Colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const timerBgColor = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  
  // Update task when selected task changes, only if it's a different task
  useEffect(() => {
    // Skip if it's the same task or null
    if (!selectedTask || selectedTask.id === lastSelectedTaskIdRef.current) {
      console.log('[PomodoroModal] Selected task unchanged, skipping update');
      return;
    }
    
    console.log('[PomodoroModal] Selected task changed:', selectedTask?.id);
    lastSelectedTaskIdRef.current = selectedTask.id;
    setTaskId(selectedTask.id);
    
    // Check if we already have this timer in the store
    const storeState = usePomodoroStore.getState();
    const existingTimer = storeState.getTimerByTaskId(selectedTask.id);
    
    if (existingTimer) {
      console.log('[PomodoroModal] Found existing timer for task:', selectedTask.id);
    } else {
      console.log('[PomodoroModal] No existing timer, creating new one for task:', selectedTask.id);
    }
    
    // Only change the task if it's different
    if (pomodoro.state.task?.id !== selectedTask.id) {
      pomodoro.actions.changeTask(selectedTask);
    }
  // Only run when selectedTask changes, not on every pomodoro action change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTask]);

  // Handle task selection change
  const handleTaskChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTaskId = e.target.value || null;
    console.log('[PomodoroModal] Task selection changed to:', newTaskId);
    
    // Skip if it's the same task
    if (newTaskId === taskId) {
      console.log('[PomodoroModal] Task unchanged, skipping update');
      return;
    }
    
    setTaskId(newTaskId);
    lastSelectedTaskIdRef.current = newTaskId;
    
    if (newTaskId) {
      const task = tasksMap[newTaskId];
      
      // Check if we already have this timer in the store
      const storeState = usePomodoroStore.getState();
      const existingTimer = storeState.getTimerByTaskId(newTaskId);
      
      if (existingTimer) {
        console.log('[PomodoroModal] Using existing timer for task:', newTaskId);
        // Do nothing, the useGlobalPomodoro hook will handle it
      } else {
        console.log('[PomodoroModal] Creating new timer for task:', newTaskId);
      }
      
      pomodoro.actions.changeTask(task);
    } else {
      pomodoro.actions.changeTask(null);
    }
  }, [taskId, tasksMap, pomodoro.actions]);

  // Handle task completion
  const handleCompleteTask = useCallback(async () => {
    if (!taskId) return;
    
    try {
      await onTaskComplete(taskId);
      setCompletedTasks(prev => [...prev, taskId]);
      
      toast({
        title: 'Task completed!',
        description: 'The task has been marked as completed.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Mark the timer as completed
      pomodoro.actions.complete();
      
      // Clear task selection
      setTaskId(null);
      lastSelectedTaskIdRef.current = null;
    } catch (error) {
      toast({
        title: 'Failed to complete task.',
        description: 'There was an error updating the task status.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [taskId, onTaskComplete, toast, pomodoro.actions]);

  // Format time as MM:SS
  const formatTime = useCallback((ms: number): string => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);
  
  // Format total time
  const formatTotalTime = useCallback((ms: number): string => {
    const totalSeconds = Math.ceil(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }, []);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay backdropFilter="blur(2px)" />
      <ModalContent bg={bgColor} borderRadius="xl" boxShadow="xl">
        <ModalHeader display="flex" alignItems="center" justifyContent="space-between">
          <HStack>
            <FaStopwatch />
            <Text>Pomodoro Timer</Text>
          </HStack>
          <Badge
            colorScheme={pomodoro.state.isPaused ? 'yellow' : pomodoro.state.isRunning ? 'red' : 'gray'}
            fontSize="sm"
            px={2}
            py={1}
            borderRadius="md"
          >
            {pomodoro.state.isPaused ? 'PAUSED' : pomodoro.state.isRunning ? 'FOCUS' : 'IDLE'}
          </Badge>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody pb={6}>
          <VStack spacing={6} align="stretch">
            {/* Timer Display */}
            <Box
              py={10}
              px={6}
              bg={timerBgColor}
              borderRadius="xl"
              textAlign="center"
              position="relative"
              overflow="hidden"
            >
              <Progress
                value={(pomodoro.state.totalTime - pomodoro.state.time) / pomodoro.state.totalTime * 100}
                size="xs"
                colorScheme={pomodoro.state.isPaused ? 'yellow' : pomodoro.state.isRunning ? 'red' : 'blue'}
                position="absolute"
                top={0}
                left={0}
                right={0}
                borderTopLeftRadius="xl"
                borderTopRightRadius="xl"
              />
              
              <Text
                fontSize="6xl"
                fontWeight="bold"
                color={textColor}
                fontFamily="mono"
              >
                {formatTime(pomodoro.state.time)}
              </Text>
              
              <HStack spacing={4} justify="center" mt={4}>
                {!pomodoro.state.isRunning || pomodoro.state.isPaused ? (
                  <IconButton
                    aria-label="Start Timer"
                    icon={<FaPlay />}
                    colorScheme="green"
                    size="lg"
                    isRound
                    onClick={pomodoro.state.isPaused ? pomodoro.actions.resume : pomodoro.actions.start}
                  />
                ) : (
                  <IconButton
                    aria-label="Pause Timer"
                    icon={<FaPause />}
                    colorScheme="yellow"
                    size="lg"
                    isRound
                    onClick={pomodoro.actions.pause}
                  />
                )}
                
                <IconButton
                  aria-label="Reset Timer"
                  icon={<FaUndo />}
                  colorScheme="blue"
                  size="lg"
                  isRound
                  onClick={pomodoro.actions.reset}
                />
                
                {taskId && (
                  <Tooltip label="Mark task as completed">
                    <IconButton
                      aria-label="Complete Task"
                      icon={<FaCheck />}
                      colorScheme="green"
                      size="lg"
                      isRound
                      onClick={handleCompleteTask}
                    />
                  </Tooltip>
                )}
              </HStack>
            </Box>
            
            {/* Task Selection */}
            <Box>
              <Text fontWeight="medium" mb={2}>
                Select Task
              </Text>
              <Select
                value={taskId || ''}
                onChange={handleTaskChange}
                placeholder="Select a task to focus on"
                borderColor={borderColor}
              >
                {tasks
                  .filter(task => task.status !== 'completed')
                  .map(task => (
                    <option key={task.id} value={task.id}>
                      {task.title}
                    </option>
                  ))}
              </Select>
            </Box>
            
            <Divider />
            
            {/* Stats */}
            <Flex justify="space-between">
              <Stat>
                <StatLabel>Focus Time</StatLabel>
                <StatNumber>{formatTotalTime(pomodoro.state.time)}</StatNumber>
                <StatHelpText>Current focus time</StatHelpText>
              </Stat>
              
              <Stat>
                <StatLabel>Cycles</StatLabel>
                <StatNumber>{pomodoro.state.cycleCount}</StatNumber>
                <StatHelpText>Pomodoro cycles</StatHelpText>
              </Stat>
              
              <Stat>
                <StatLabel>Tasks</StatLabel>
                <StatNumber>{completedTasks.length}</StatNumber>
                <StatHelpText>Completed during session</StatHelpText>
              </Stat>
            </Flex>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PomodoroModal; 