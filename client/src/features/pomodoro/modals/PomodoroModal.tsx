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
  Tooltip,
  Switch,
  Portal,
  SlideFade,
  Fade,
  Center,
  ScaleFade,
  Heading
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { 
  FaPlay, 
  FaPause, 
  FaUndo, 
  FaCheck, 
  FaStopwatch, 
  FaExpand, 
  FaCompress,
  FaTimes,
  FaHistory,
  FaCloud,
  FaSun
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Task } from '../../../types';
import { PomodoroModalProps } from '../types/pomodoro';
import { useGlobalPomodoro } from '../hooks/useGlobalPomodoro';
import { usePomodoroStore } from '../hooks/usePomodoroStore';

// Create a motion component with Chakra UI
const MotionBox = motion(Box);

// Animation for the breathing effect in focus mode
const breathingAnimation = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
`;

// Animation for floating clouds
const floatAnimation = keyframes`
  0% { transform: translateX(0) translateY(0); }
  50% { transform: translateX(10px) translateY(-10px); }
  100% { transform: translateX(0) translateY(0); }
`;

// Animation for smaller floating clouds
const floatSmallAnimation = keyframes`
  0% { transform: translateX(0) translateY(0); }
  50% { transform: translateX(-15px) translateY(-5px); }
  100% { transform: translateX(0) translateY(0); }
`;

// Sun rotation animation
const sunRotateAnimation = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const PomodoroModal: React.FC<PomodoroModalProps> = ({
  isOpen,
  onClose,
  selectedTask,
  tasks,
  onTaskComplete
}) => {
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const lastSelectedTaskIdRef = useRef<string | null>(selectedTask?.id || null);
  const toast = useToast();

  // Initialize pomodoro hook with the selected task
  const pomodoro = useGlobalPomodoro(selectedTask);
  
  // Access the store to get completed sessions
  const completedSessions = usePomodoroStore(state => state.completedSessions);
  
  // Colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const timerBgColor = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  
  // Peaceful focus mode colors
  const focusBgColor = useColorModeValue(
    'linear-gradient(180deg, #87CEEB 0%, #E0F7FA 100%)',
    'linear-gradient(180deg, #1A202C 0%, #2D3748 100%)'
  );
  const focusTimerBgColor = useColorModeValue('#FFFFFF', '#2D3748');
  const cloudColor = useColorModeValue('#FFFFFF', '#4A5568');
  const cloudShadow = useColorModeValue('rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.3)');
  const sunColor = useColorModeValue('#FFD700', '#F6AD55');
  const breathingColor = useColorModeValue('rgba(255, 255, 255, 0.7)', 'rgba(74, 85, 104, 0.5)');
  const historyItemBg = useColorModeValue('gray.50', 'gray.700');
  
  // Handle focus mode toggle
  const toggleFocusMode = useCallback(() => {
    setIsFocusMode(prev => !prev);
  }, []);
  
  // Toggle history view
  const toggleHistory = useCallback(() => {
    setShowHistory(prev => !prev);
  }, []);
  
  // Handle ESC key to exit focus mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFocusMode) {
        setIsFocusMode(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode]);
  
  // Update task when selected task changes, only if it's a different task
  useEffect(() => {
    // Skip if it's the same task or null
    if (!selectedTask || selectedTask.id === lastSelectedTaskIdRef.current) {
      return;
    }
    
    lastSelectedTaskIdRef.current = selectedTask.id;
    
    // Change task in the pomodoro system
    pomodoro.actions.changeTask(selectedTask);
  }, [selectedTask, pomodoro.actions]);

  // Handle task selection change
  const handleTaskChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const taskId = e.target.value || null;
    
    if (!taskId) {
      pomodoro.actions.changeTask(null);
      return;
    }
    
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      pomodoro.actions.changeTask(task);
    }
  }, [tasks, pomodoro.actions]);

  // Handle task completion
  const handleCompleteTask = useCallback(async () => {
    if (!pomodoro.state.task) return;
    
    try {
      await onTaskComplete(pomodoro.state.task.id);
      
      toast({
        title: 'Task completed!',
        description: 'The task has been marked as completed.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Mark the timer as completed
      pomodoro.actions.complete();
      
      // Exit focus mode if active
      if (isFocusMode) {
        setIsFocusMode(false);
      }
    } catch (error) {
      toast({
        title: 'Failed to complete task.',
        description: 'There was an error updating the task status.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [pomodoro.state.task, pomodoro.actions, onTaskComplete, toast, isFocusMode]);

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
  
  // Format date for session history
  const formatDate = useCallback((timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  }, []);
  
  // Render the focus mode UI
  const renderFocusMode = () => {
    const percentComplete = (pomodoro.state.totalTime - pomodoro.state.time) / pomodoro.state.totalTime * 100;
    const statusColor = pomodoro.state.isPaused 
      ? 'yellow.400' 
      : pomodoro.state.isRunning 
        ? 'teal.400' 
        : 'blue.400';
    
    return (
      <Portal>
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          zIndex="9999"
          background={focusBgColor}
          overflow="hidden"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          p={8}
        >
          {/* Cloud decorations */}
          <Box position="absolute" top="5%" left="10%" zIndex={0}>
            <Box
              position="relative"
              width="120px"
              height="60px"
              animation={`${floatAnimation} 10s infinite ease-in-out`}
            >
              <Box
                position="absolute"
                width="120px"
                height="60px"
                bg={cloudColor}
                borderRadius="30px"
                boxShadow={`5px 5px 10px ${cloudShadow}`}
              />
              <Box
                position="absolute"
                top="-25px"
                left="25px"
                width="60px"
                height="60px"
                bg={cloudColor}
                borderRadius="50%"
                boxShadow={`2px 2px 8px ${cloudShadow}`}
              />
              <Box
                position="absolute"
                top="-30px"
                left="60px"
                width="70px"
                height="70px"
                bg={cloudColor}
                borderRadius="50%"
                boxShadow={`3px 3px 9px ${cloudShadow}`}
              />
              <Box
                position="absolute"
                top="-10px"
                left="80px"
                width="50px"
                height="50px"
                bg={cloudColor}
                borderRadius="50%"
                boxShadow={`4px 4px 10px ${cloudShadow}`}
              />
            </Box>
          </Box>

          <Box position="absolute" top="15%" right="15%" zIndex={0}>
            <Box
              position="relative"
              width="90px"
              height="45px"
              animation={`${floatSmallAnimation} 15s infinite ease-in-out`}
            >
              <Box
                position="absolute"
                width="90px"
                height="45px"
                bg={cloudColor}
                borderRadius="22.5px"
                boxShadow={`4px 4px 8px ${cloudShadow}`}
              />
              <Box
                position="absolute"
                top="-20px"
                left="15px"
                width="50px"
                height="50px"
                bg={cloudColor}
                borderRadius="50%"
                boxShadow={`2px 2px 6px ${cloudShadow}`}
              />
              <Box
                position="absolute"
                top="-25px"
                left="40px"
                width="60px"
                height="60px"
                bg={cloudColor}
                borderRadius="50%"
                boxShadow={`3px 3px 7px ${cloudShadow}`}
              />
            </Box>
          </Box>

          <Box position="absolute" bottom="20%" left="20%" zIndex={0}>
            <Box
              position="relative"
              width="100px"
              height="50px"
              animation={`${floatAnimation} 12s infinite ease-in-out 1s`}
            >
              <Box
                position="absolute"
                width="100px"
                height="50px"
                bg={cloudColor}
                borderRadius="25px"
                boxShadow={`4px 4px 8px ${cloudShadow}`}
              />
              <Box
                position="absolute"
                top="-20px"
                left="20px"
                width="45px"
                height="45px"
                bg={cloudColor}
                borderRadius="50%"
                boxShadow={`2px 2px 6px ${cloudShadow}`}
              />
              <Box
                position="absolute"
                top="-25px"
                left="50px"
                width="55px"
                height="55px"
                bg={cloudColor}
                borderRadius="50%"
                boxShadow={`3px 3px 7px ${cloudShadow}`}
              />
            </Box>
          </Box>

          {/* Sun decoration - only in light mode */}
          {useColorModeValue(
            <Box 
              position="absolute" 
              top="10%" 
              right="25%" 
              color={sunColor}
              animation={`${sunRotateAnimation} 60s linear infinite`}
              zIndex={0}
            >
              <FaSun size="80px" opacity={0.8} />
            </Box>,
            null
          )}

          {/* Main content */}
          <ScaleFade in={isFocusMode} initialScale={0.9}>
            <VStack spacing={8} width="100%" maxWidth="600px" position="relative" zIndex={1}>
              {/* Floating exit button */}
              <Box position="absolute" top={-12} right={0}>
                <IconButton
                  icon={<FaTimes />}
                  aria-label="Exit focus mode"
                  variant="solid"
                  bg="whiteAlpha.300"
                  color={textColor}
                  _hover={{ bg: "whiteAlpha.500" }}
                  size="lg"
                  isRound
                  onClick={toggleFocusMode}
                />
              </Box>
              
              {/* Task info */}
              {pomodoro.state.task && (
                <Text
                  fontSize="2xl"
                  fontWeight="medium"
                  color={textColor}
                  textAlign="center"
                  textShadow="0 1px 2px rgba(0,0,0,0.1)"
                  letterSpacing="0.5px"
                >
                  {pomodoro.state.task.title}
                </Text>
              )}
              
              {/* Timer container with breathing animation */}
              <Center position="relative" w="100%" mt={4}>
                <Box
                  position="absolute"
                  borderRadius="full"
                  bg={breathingColor}
                  w="300px"
                  h="300px"
                  boxShadow="0 0 30px rgba(255,255,255,0.3)"
                  animation={`${breathingAnimation} ${
                    pomodoro.state.isPaused ? '0s' : '10s'
                  } infinite ease-in-out`}
                />
                
                <Box
                  bg={focusTimerBgColor}
                  borderRadius="full"
                  boxShadow="0px 10px 30px rgba(0, 0, 0, 0.15)"
                  p={16}
                  position="relative"
                  zIndex={1}
                  border="4px solid"
                  borderColor="whiteAlpha.400"
                >
                  <Text
                    fontSize="7xl"
                    fontWeight="bold"
                    color={textColor}
                    fontFamily="mono"
                    letterSpacing="2px"
                    textShadow="0 1px 3px rgba(0,0,0,0.1)"
                  >
                    {formatTime(pomodoro.state.time)}
                  </Text>
                </Box>
              </Center>
              
              {/* Progress indicator */}
              <Box position="relative" width="320px" height="12px" mt={6}>
                <Progress
                  value={percentComplete}
                  size="md"
                  colorScheme={pomodoro.state.isPaused ? "yellow" : "teal"}
                  borderRadius="full"
                  height="12px"
                  width="100%"
                  boxShadow="0 2px 5px rgba(0,0,0,0.1)"
                  bg="whiteAlpha.300"
                />
              </Box>
              
              {/* Minimal controls with cute styling */}
              <HStack spacing={8} mt={6}>
                {!pomodoro.state.isRunning || pomodoro.state.isPaused ? (
                  <IconButton
                    aria-label="Start Timer"
                    icon={<FaPlay />}
                    colorScheme="green"
                    size="lg"
                    isRound
                    boxShadow="0 4px 10px rgba(0,0,0,0.15)"
                    _hover={{ transform: "translateY(-3px)", boxShadow: "0 6px 15px rgba(0,0,0,0.2)" }}
                    _active={{ transform: "translateY(0)", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}
                    transition="all 0.2s"
                    onClick={pomodoro.state.isPaused ? pomodoro.actions.resume : pomodoro.actions.start}
                  />
                ) : (
                  <IconButton
                    aria-label="Pause Timer"
                    icon={<FaPause />}
                    colorScheme="yellow"
                    size="lg"
                    isRound
                    boxShadow="0 4px 10px rgba(0,0,0,0.15)"
                    _hover={{ transform: "translateY(-3px)", boxShadow: "0 6px 15px rgba(0,0,0,0.2)" }}
                    _active={{ transform: "translateY(0)", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}
                    transition="all 0.2s"
                    onClick={pomodoro.actions.pause}
                  />
                )}
                
                <IconButton
                  aria-label="Reset Timer"
                  icon={<FaUndo />}
                  colorScheme="blue"
                  size="lg"
                  isRound
                  variant="solid"
                  boxShadow="0 4px 10px rgba(0,0,0,0.15)"
                  _hover={{ transform: "translateY(-3px)", boxShadow: "0 6px 15px rgba(0,0,0,0.2)" }}
                  _active={{ transform: "translateY(0)", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}
                  transition="all 0.2s"
                  onClick={pomodoro.actions.reset}
                />
                
                {pomodoro.state.task && (
                  <IconButton
                    aria-label="Complete Task"
                    icon={<FaCheck />}
                    colorScheme="green"
                    size="lg"
                    isRound
                    variant="solid"
                    boxShadow="0 4px 10px rgba(0,0,0,0.15)"
                    _hover={{ transform: "translateY(-3px)", boxShadow: "0 6px 15px rgba(0,0,0,0.2)" }}
                    _active={{ transform: "translateY(0)", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}
                    transition="all 0.2s"
                    onClick={handleCompleteTask}
                  />
                )}
              </HStack>
              
              {/* Status badge */}
              <Badge
                bg={statusColor}
                color="white"
                fontSize="md"
                px={6}
                py={2}
                borderRadius="full"
                boxShadow="0 2px 5px rgba(0,0,0,0.1)"
                letterSpacing="1px"
                fontWeight="medium"
              >
                {pomodoro.state.isPaused ? 'PAUSED' : pomodoro.state.isRunning ? 'FOCUS' : 'READY'}
              </Badge>

              {/* Inspirational message */}
              <Text
                color={textColor}
                fontSize="md"
                fontStyle="italic"
                textAlign="center"
                opacity={0.8}
                maxW="80%"
                mt={2}
              >
                {pomodoro.state.isRunning && !pomodoro.state.isPaused
                  ? "Take a deep breath and focus on the present moment."
                  : "Ready to achieve your goals? Take one step at a time."}
              </Text>
            </VStack>
          </ScaleFade>
        </Box>
      </Portal>
    );
  };

  // Render history view
  const renderHistory = () => {
    const taskSessions = pomodoro.state.task
      ? completedSessions.filter(s => s.taskId === pomodoro.state.task?.id)
      : [];
    
    return (
      <Box mt={4}>
        <Heading as="h3" size="md" mb={3}>
          Session History
        </Heading>
        
        {taskSessions.length === 0 ? (
          <Text color={textColor} opacity={0.7} textAlign="center" py={4}>
            No completed pomodoros for this task yet
          </Text>
        ) : (
          <VStack align="stretch" spacing={2} maxH="200px" overflowY="auto">
            {taskSessions.map(session => (
              <Box
                key={session.id}
                p={3}
                borderRadius="md"
                bg={historyItemBg}
                borderWidth="1px"
                borderColor={borderColor}
              >
                <Flex justify="space-between" align="center">
                  <Text fontSize="sm" fontWeight="medium">
                    {formatDate(session.startTime)}
                  </Text>
                  <Badge colorScheme="green">
                    {formatTotalTime(session.duration)}
                  </Badge>
                </Flex>
              </Box>
            ))}
          </VStack>
        )}
      </Box>
    );
  };

  return (
    <>
      <Modal isOpen={isOpen && !isFocusMode} onClose={onClose} size="lg" isCentered>
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
                  
                  {pomodoro.state.task && (
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
              
              {/* Focus Mode Toggle */}
              <Flex justify="space-between" align="center">
                <HStack>
                  <Text fontWeight="medium">Focus Mode</Text>
                  <Tooltip label="Enter peaceful cloud focus mode">
                    <IconButton
                      aria-label="Enter Focus Mode"
                      icon={<FaCloud />}
                      size="sm"
                      colorScheme="blue"
                      variant="ghost"
                      onClick={toggleFocusMode}
                    />
                  </Tooltip>
                </HStack>
                <Switch 
                  colorScheme="blue"
                  isChecked={isFocusMode}
                  onChange={toggleFocusMode}
                />
              </Flex>
              
              {/* Task Selection */}
              <Box>
                <Text fontWeight="medium" mb={2}>
                  Select Task
                </Text>
                <Select
                  value={pomodoro.state.task?.id || ''}
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
                  <StatLabel>Completed</StatLabel>
                  <StatNumber>{pomodoro.state.completedSessions}</StatNumber>
                  <StatHelpText>
                    <Button 
                      variant="link" 
                      size="xs" 
                      rightIcon={<FaHistory />}
                      onClick={toggleHistory}
                    >
                      {showHistory ? "Hide history" : "Show history"}
                    </Button>
                  </StatHelpText>
                </Stat>
              </Flex>
              
              {/* Session History */}
              {showHistory && pomodoro.state.task && renderHistory()}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Render Focus Mode UI when active */}
      {isFocusMode && renderFocusMode()}
    </>
  );
};

export default PomodoroModal; 