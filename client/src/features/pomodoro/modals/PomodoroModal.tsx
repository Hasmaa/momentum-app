import React, { useState, useEffect } from 'react';
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
import { FaPlay, FaPause, FaUndo, FaCheck, FaStopwatch, FaHourglassHalf } from 'react-icons/fa';
import { Task } from '../../../types';
import { PomodoroModalProps } from '../types/pomodoro';
import { usePomodoro } from '../hooks/usePomodoro';

const PomodoroModal: React.FC<PomodoroModalProps> = ({
  isOpen,
  onClose,
  selectedTask,
  tasks,
  onTaskComplete
}) => {
  const [taskId, setTaskId] = useState<string | null>(selectedTask?.id || null);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const toast = useToast();

  // Convert tasks array to a map for easy lookup
  const tasksMap = tasks.reduce((acc, task) => {
    acc[task.id] = task;
    return acc;
  }, {} as Record<string, Task>);

  // Get current task
  const currentTask = taskId ? tasksMap[taskId] : null;

  // Initialize pomodoro hook
  const pomodoro = usePomodoro(currentTask);
  
  // Colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const timerBgColor = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  
  // Cycle colors
  const cycleColors = {
    focus: 'red',
    shortBreak: 'green',
    longBreak: 'blue'
  };
  
  // Update task when selected task changes
  useEffect(() => {
    if (selectedTask) {
      setTaskId(selectedTask.id);
      pomodoro.actions.changeTask(selectedTask);
    }
  }, [selectedTask]);

  // Handle task selection change
  const handleTaskChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTaskId = e.target.value || null;
    setTaskId(newTaskId);
    
    if (newTaskId) {
      const task = tasksMap[newTaskId];
      pomodoro.actions.changeTask(task);
    } else {
      pomodoro.actions.changeTask(null);
    }
  };

  // Handle task completion
  const handleCompleteTask = async () => {
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
      
      // Reset timer
      pomodoro.actions.reset();
      
      // Clear task selection
      setTaskId(null);
    } catch (error) {
      toast({
        title: 'Failed to complete task.',
        description: 'There was an error updating the task status.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Calculate progress percentage
  const getProgressPercentage = (): number => {
    if (pomodoro.session.currentCycle === 'focus') {
      const totalTime = 25 * 60; // 25 minutes in seconds
      return ((totalTime - pomodoro.session.timeRemaining) / totalTime) * 100;
    } else if (pomodoro.session.currentCycle === 'shortBreak') {
      const totalTime = 5 * 60; // 5 minutes in seconds
      return ((totalTime - pomodoro.session.timeRemaining) / totalTime) * 100;
    } else {
      const totalTime = 15 * 60; // 15 minutes in seconds
      return ((totalTime - pomodoro.session.timeRemaining) / totalTime) * 100;
    }
  };

  // Format total focus time
  const formatTotalTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

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
            colorScheme={cycleColors[pomodoro.session.currentCycle]}
            fontSize="sm"
            px={2}
            py={1}
            borderRadius="md"
          >
            {pomodoro.cycleLabel}
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
                value={getProgressPercentage()}
                size="xs"
                colorScheme={cycleColors[pomodoro.session.currentCycle]}
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
                {pomodoro.formattedTime}
              </Text>
              
              <HStack spacing={4} justify="center" mt={4}>
                {pomodoro.session.status === 'idle' || pomodoro.session.status === 'paused' ? (
                  <IconButton
                    aria-label="Start Timer"
                    icon={<FaPlay />}
                    colorScheme="green"
                    size="lg"
                    isRound
                    onClick={pomodoro.session.status === 'idle' ? pomodoro.actions.start : pomodoro.actions.resume}
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
                <StatNumber>{formatTotalTime(pomodoro.session.totalFocusTime)}</StatNumber>
                <StatHelpText>Total time focused</StatHelpText>
              </Stat>
              
              <Stat>
                <StatLabel>Pomodoros</StatLabel>
                <StatNumber>{pomodoro.session.completedPomodoros}</StatNumber>
                <StatHelpText>Completed cycles</StatHelpText>
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