import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  Heading,
  SimpleGrid,
  Collapse,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Tag,
  TagLabel,
  TagLeftIcon,
  useDisclosure
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
  FaSun,
  FaCog,
  FaKeyboard,
  FaChartBar,
  FaChevronDown,
  FaCalendar,
  FaLightbulb,
  FaListUl,
  FaCheckCircle,
  FaBell,
  FaClock
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
  onTaskComplete,
  onCreateTask
}) => {
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
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

  // Toggle settings view
  const toggleSettings = useCallback(() => {
    setShowSettings(prev => !prev);
  }, []);

  // Toggle keyboard shortcuts view
  const toggleKeyboardShortcuts = useCallback(() => {
    setShowKeyboardShortcuts(prev => !prev);
  }, []);
  
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
      
      // Reset the pomodoro modal by clearing the selected task
      // This will return the user to the task selection screen
      pomodoro.actions.reset();
      pomodoro.actions.changeTask(null);
      
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
  
  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when modal is open and not in input fields
      if (!isOpen || ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'escape':
          if (isFocusMode) {
            setIsFocusMode(false);
            e.preventDefault();
          }
          break;
        case ' ': // Space bar
          if (pomodoro.state.isRunning && !pomodoro.state.isPaused) {
            pomodoro.actions.pause();
          } else {
            pomodoro.state.isPaused ? pomodoro.actions.resume() : pomodoro.actions.start();
          }
          e.preventDefault();
          break;
        case 'r':
          pomodoro.actions.reset();
          e.preventDefault();
          break;
        case 'f':
          toggleFocusMode();
          e.preventDefault();
          break;
        case 'c':
          if (pomodoro.state.task) {
            handleCompleteTask();
          }
          e.preventDefault();
          break;
        case 'h':
          toggleHistory();
          e.preventDefault();
          break;
        case 's':
          toggleSettings();
          e.preventDefault();
          break;
        case 'k':
          toggleKeyboardShortcuts();
          e.preventDefault();
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFocusMode, pomodoro.state, pomodoro.actions, toggleFocusMode, handleCompleteTask, toggleHistory, toggleSettings, toggleKeyboardShortcuts]);
  
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
  
  // Calculate productivity stats
  const productivityStats = useMemo(() => {
    if (!pomodoro.state.task) return null;
    
    const taskSessions = completedSessions.filter(s => s.taskId === pomodoro.state.task?.id);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySessions = taskSessions.filter(s => new Date(s.startTime) >= today);
    
    const totalFocusTime = taskSessions.reduce((sum, session) => sum + session.duration, 0);
    const todayFocusTime = todaySessions.reduce((sum, session) => sum + session.duration, 0);
    
    const averageSessionDuration = taskSessions.length > 0 
      ? totalFocusTime / taskSessions.length 
      : 0;
    
    return {
      totalFocusTime,
      todayFocusTime,
      sessionsCompleted: taskSessions.length,
      todaySessions: todaySessions.length,
      averageSessionDuration
    };
  }, [pomodoro.state.task, completedSessions]);

  // Get next suggestion based on current state
  const getNextSuggestion = useCallback(() => {
    if (!pomodoro.state.task) {
      return {
        message: "Select a task to begin focusing",
        icon: FaListUl,
        action: null
      };
    }
    
    if (!pomodoro.state.isRunning && !pomodoro.state.isPaused) {
      return {
        message: "Start a Pomodoro session to begin focusing",
        icon: FaPlay,
        action: pomodoro.actions.start
      };
    }
    
    if (pomodoro.state.isPaused) {
      return {
        message: "Resume your Pomodoro session",
        icon: FaPlay,
        action: pomodoro.actions.resume
      };
    }
    
    return {
      message: "Focus on your task until the timer ends",
      icon: FaClock,
      action: null
    };
  }, [pomodoro.state, pomodoro.actions]);

  const nextSuggestion = getNextSuggestion();

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
            <VStack spacing={8} width="100%" maxWidth="500px" position="relative" zIndex={1}>
              {/* Floating exit button */}
              <Box position="absolute" top={-16} right={-4}>
                <Tooltip label="Exit focus mode (Esc)" placement="left">
                  <IconButton
                    icon={<FaTimes />}
                    aria-label="Exit focus mode"
                    variant="solid"
                    bg="whiteAlpha.300"
                    color={textColor}
                    _hover={{ bg: "whiteAlpha.500" }}
                    size="md"
                    isRound
                    onClick={toggleFocusMode}
                  />
                </Tooltip>
              </Box>
              
              {/* Task info */}
              {pomodoro.state.task && (
                <Text
                  fontSize="xl"
                  fontWeight="medium"
                  color={textColor}
                  textAlign="center"
                  textShadow="0 1px 2px rgba(0,0,0,0.1)"
                  letterSpacing="0.5px"
                  mt={8}
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
                  w="260px"
                  h="260px"
                  boxShadow="0 0 30px rgba(255,255,255,0.3)"
                  animation={`${breathingAnimation} ${
                    pomodoro.state.isPaused ? '0s' : '10s'
                  } infinite ease-in-out`}
                />
                
                <Box
                  bg={focusTimerBgColor}
                  borderRadius="full"
                  boxShadow="0px 10px 30px rgba(0, 0, 0, 0.15)"
                  p={14}
                  position="relative"
                  zIndex={1}
                  border="4px solid"
                  borderColor="whiteAlpha.400"
                >
                  <Text
                    fontSize="5xl"
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
              <Box position="relative" width="260px" height="8px" mt={4}>
                <Progress
                  value={percentComplete}
                  size="sm"
                  colorScheme={pomodoro.state.isPaused ? "yellow" : "teal"}
                  borderRadius="full"
                  height="8px"
                  width="100%"
                  boxShadow="0 2px 5px rgba(0,0,0,0.1)"
                  bg="whiteAlpha.300"
                />
              </Box>
              
              {/* Controls with shortcuts in tooltips */}
              <HStack spacing={6} mt={4}>
                {!pomodoro.state.isRunning || pomodoro.state.isPaused ? (
                  <Tooltip label="Start/Resume (Space)" placement="top">
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
                  </Tooltip>
                ) : (
                  <Tooltip label="Pause (Space)" placement="top">
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
                  </Tooltip>
                )}
                
                <Tooltip label="Reset timer (R)" placement="top">
                  <IconButton
                    aria-label="Reset Timer"
                    icon={<FaUndo />}
                    colorScheme="blue"
                    size="md"
                    isRound
                    variant="solid"
                    boxShadow="0 4px 10px rgba(0,0,0,0.15)"
                    _hover={{ transform: "translateY(-3px)", boxShadow: "0 6px 15px rgba(0,0,0,0.2)" }}
                    _active={{ transform: "translateY(0)", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}
                    transition="all 0.2s"
                    onClick={pomodoro.actions.reset}
                  />
                </Tooltip>
                
                {pomodoro.state.task && (
                  <Tooltip label="Complete task (C)" placement="top">
                    <IconButton
                      aria-label="Complete Task"
                      icon={<FaCheck />}
                      colorScheme="green"
                      size="md"
                      isRound
                      variant="solid"
                      boxShadow="0 4px 10px rgba(0,0,0,0.15)"
                      _hover={{ transform: "translateY(-3px)", boxShadow: "0 6px 15px rgba(0,0,0,0.2)" }}
                      _active={{ transform: "translateY(0)", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}
                      transition="all 0.2s"
                      onClick={handleCompleteTask}
                    />
                  </Tooltip>
                )}
              </HStack>
              
              {/* Status badge */}
              <Badge
                bg={statusColor}
                color="white"
                fontSize="sm"
                px={4}
                py={1}
                borderRadius="full"
                boxShadow="0 2px 5px rgba(0,0,0,0.1)"
                letterSpacing="1px"
                fontWeight="medium"
              >
                {pomodoro.state.isPaused ? 'PAUSED' : pomodoro.state.isRunning ? 'FOCUS' : 'READY'}
              </Badge>
              
              {/* Mini keyboard shortcut hint */}
              <HStack spacing={1} opacity={0.7} mt={0}>
                <IconButton
                  icon={<FaKeyboard size="10px" />}
                  aria-label="Show keyboard shortcuts"
                  size="xs"
                  variant="ghost"
                  color={textColor}
                  onClick={toggleKeyboardShortcuts}
                />
                <Text fontSize="xs" color={textColor}>
                  Press K for shortcuts
                </Text>
              </HStack>

              {/* Keyboard shortcuts panel */}
              <Collapse in={showKeyboardShortcuts} animateOpacity>
                <Box
                  bg="blackAlpha.300"
                  p={3}
                  borderRadius="md"
                  maxW="400px"
                  color={textColor}
                >
                  <Flex justify="space-between" align="center" mb={2}>
                    <Heading size="xs">Keyboard Shortcuts</Heading>
                    <IconButton 
                      icon={<FaTimes size="10px" />} 
                      aria-label="Close keyboard shortcuts" 
                      size="xs"
                      variant="ghost"
                      onClick={toggleKeyboardShortcuts}
                    />
                  </Flex>
                  <SimpleGrid columns={2} spacing={2}>
                    <Text fontSize="xs">Space: Start/Pause</Text>
                    <Text fontSize="xs">R: Reset Timer</Text>
                    <Text fontSize="xs">F: Toggle Focus Mode</Text>
                    <Text fontSize="xs">C: Complete Task</Text>
                    <Text fontSize="xs">H: Toggle History</Text>
                    <Text fontSize="xs">Esc: Exit Focus Mode</Text>
                  </SimpleGrid>
                </Box>
              </Collapse>

              {/* Inspirational message */}
              <Text
                color={textColor}
                fontSize="sm"
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

  // Render the standard modal UI
  return (
    <>
      <Modal isOpen={isOpen && !isFocusMode} onClose={onClose} size="xl" isCentered>
        <ModalOverlay backdropFilter="blur(2px)" />
        <ModalContent bg={bgColor} borderRadius="xl" boxShadow="xl">
          <ModalHeader display="flex" alignItems="center" justifyContent="space-between" pt={5} pb={4}>
            <HStack>
              <FaStopwatch />
              <Text>Pomodoro Timer</Text>
            </HStack>
            <HStack spacing={2}>
              <Tooltip label="Show keyboard shortcuts (K)">
                <IconButton
                  icon={<FaKeyboard />}
                  aria-label="Show keyboard shortcuts"
                  size="sm"
                  variant="ghost"
                  onClick={toggleKeyboardShortcuts}
                />
              </Tooltip>
              <Badge
                colorScheme={pomodoro.state.isPaused ? 'yellow' : pomodoro.state.isRunning ? 'red' : 'gray'}
                fontSize="sm"
                px={2}
                py={1}
                borderRadius="md"
              >
                {pomodoro.state.isPaused ? 'PAUSED' : pomodoro.state.isRunning ? 'FOCUS' : 'IDLE'}
              </Badge>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody pb={8} px={6}>
            {!pomodoro.state.task ? (
              // Task selection UI when no task is selected
              <VStack spacing={6} align="stretch">
                <Box 
                  textAlign="center" 
                  py={6}
                >
                  <Box
                    mx="auto"
                    boxSize="100px"
                    bg="blue.50"
                    _dark={{ bg: "blue.900" }}
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    mb={6}
                  >
                    <FaListUl size="32px" color={useColorModeValue('#3182CE', '#63B3ED')} />
                  </Box>
                  <Heading size="md" mb={2}>Select a Task to Focus On</Heading>
                  <Text color="gray.500" _dark={{ color: "gray.400" }} mb={8}>
                    Choose a task from your list to start the Pomodoro timer
                  </Text>

                  <Box 
                    borderRadius="lg" 
                    borderWidth="1px" 
                    borderColor={borderColor} 
                    overflow="hidden"
                    maxH="300px"
                    mb={6}
                  >
                    <Box p={4} bg={timerBgColor} borderBottomWidth="1px" borderColor={borderColor}>
                      <Text fontWeight="medium" fontSize="sm">Available Tasks</Text>
                    </Box>
                    
                    <Box maxH="240px" overflowY="auto" px={2}>
                      {tasks.filter(task => task.status !== 'completed').length === 0 ? (
                        <Box textAlign="center" py={8} px={4}>
                          <Text color="gray.500" _dark={{ color: "gray.400" }}>
                            You don't have any active tasks yet.
                          </Text>
                          <Button
                            mt={4}
                            size="sm"
                            onClick={() => {
                              onClose();
                              onCreateTask && onCreateTask();
                            }}
                            colorScheme="blue"
                            leftIcon={<FaListUl />}
                          >
                            Create a task first
                          </Button>
                        </Box>
                      ) : (
                        <VStack spacing={2} align="stretch" py={2}>
                          {tasks
                            .filter(task => task.status !== 'completed')
                            .map(task => (
                              <Box 
                                key={task.id}
                                p={3}
                                borderRadius="md"
                                _hover={{ 
                                  bg: useColorModeValue('gray.50', 'gray.700'),
                                  transform: 'translateY(-1px)',
                                  boxShadow: 'sm'
                                }}
                                cursor="pointer"
                                onClick={() => {
                                  const taskToSelect = tasks.find(t => t.id === task.id);
                                  if (taskToSelect) {
                                    pomodoro.actions.changeTask(taskToSelect);
                                  }
                                }}
                                transition="all 0.2s"
                                display="flex"
                                alignItems="center"
                                justifyContent="space-between"
                              >
                                <HStack>
                                  <Box
                                    w="10px"
                                    h="10px"
                                    borderRadius="full"
                                    bg={task.priority === 'high' ? 'red.400' : task.priority === 'medium' ? 'yellow.400' : 'green.400'}
                                  />
                                  <Text fontSize="sm" fontWeight="medium">{task.title}</Text>
                                </HStack>
                                <IconButton
                                  icon={<FaPlay />}
                                  aria-label="Start Pomodoro"
                                  size="xs"
                                  colorScheme="blue"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const taskToSelect = tasks.find(t => t.id === task.id);
                                    if (taskToSelect) {
                                      pomodoro.actions.changeTask(taskToSelect);
                                      pomodoro.actions.start();
                                    }
                                  }}
                                />
                              </Box>
                            ))
                          }
                        </VStack>
                      )}
                    </Box>
                  </Box>

                  <Collapse in={showKeyboardShortcuts} animateOpacity>
                    <Box
                      bg={timerBgColor}
                      p={3}
                      borderRadius="md"
                      mb={2}
                      fontSize="xs"
                    >
                      <Flex justify="space-between" align="center" mb={2}>
                        <Heading size="xs">Keyboard Shortcuts</Heading>
                        <IconButton 
                          icon={<FaTimes />} 
                          aria-label="Close keyboard shortcuts" 
                          size="xs"
                          variant="ghost"
                          onClick={toggleKeyboardShortcuts}
                        />
                      </Flex>
                      <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={2}>
                        <HStack>
                          <Tag size="sm" variant="subtle" colorScheme="blue" minW="50px" justifyContent="center">Space</Tag>
                          <Text fontSize="xs">Start/Pause timer</Text>
                        </HStack>
                        <HStack>
                          <Tag size="sm" variant="subtle" colorScheme="blue" minW="50px" justifyContent="center">F</Tag>
                          <Text fontSize="xs">Enter focus mode</Text>
                        </HStack>
                        <HStack>
                          <Tag size="sm" variant="subtle" colorScheme="blue" minW="50px" justifyContent="center">K</Tag>
                          <Text fontSize="xs">Toggle shortcuts</Text>
                        </HStack>
                      </SimpleGrid>
                    </Box>
                  </Collapse>
                </Box>
              </VStack>
            ) : (
              // Timer UI when a task is selected
              <VStack spacing={6} align="stretch">
                {/* Row 1: Suggestion + Timer stacked vertically */}
                <VStack spacing={4} align="stretch">
                  {/* Suggested next action */}
                  {nextSuggestion && (
                    <Flex
                      align="center"
                      p={3}
                      bg="blue.50"
                      color="blue.700"
                      borderRadius="md"
                      _dark={{
                        bg: "blue.900",
                        color: "blue.100"
                      }}
                    >
                      <Box mr={3} color="blue.500" _dark={{ color: "blue.300" }}>
                        <nextSuggestion.icon size={18} />
                      </Box>
                      <Text fontWeight="medium" fontSize="sm">
                        {nextSuggestion.message}
                      </Text>
                      {nextSuggestion.action && (
                        <Button
                          ml="auto"
                          size="xs"
                          colorScheme="blue"
                          onClick={nextSuggestion.action}
                        >
                          <HStack spacing={1}>
                            <nextSuggestion.icon />
                            <Text>Do it</Text>
                          </HStack>
                        </Button>
                      )}
                    </Flex>
                  )}

                  {/* Timer Display - now full width and more prominent */}
                  <Box
                    py={6}
                    px={4}
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
                      fontSize={{ base: "5xl", md: "6xl" }}
                      fontWeight="bold"
                      color={textColor}
                      fontFamily="mono"
                    >
                      {formatTime(pomodoro.state.time)}
                    </Text>
                  </Box>
                </VStack>

                {/* Row 2: Timer Controls */}
                <Flex justify="center" mt={-1}>
                  <HStack spacing={4}>
                    {!pomodoro.state.isRunning || pomodoro.state.isPaused ? (
                      <Tooltip label="Start/Resume (Space)" placement="top">
                        <IconButton
                          aria-label="Start Timer"
                          icon={<FaPlay />}
                          colorScheme="green"
                          size="lg"
                          isRound
                          onClick={pomodoro.state.isPaused ? pomodoro.actions.resume : pomodoro.actions.start}
                        />
                      </Tooltip>
                    ) : (
                      <Tooltip label="Pause (Space)" placement="top">
                        <IconButton
                          aria-label="Pause Timer"
                          icon={<FaPause />}
                          colorScheme="yellow"
                          size="lg"
                          isRound
                          onClick={pomodoro.actions.pause}
                        />
                      </Tooltip>
                    )}
                    
                    <Tooltip label="Reset timer (R)" placement="top">
                      <IconButton
                        aria-label="Reset Timer"
                        icon={<FaUndo />}
                        colorScheme="blue"
                        size="md"
                        isRound
                        onClick={pomodoro.actions.reset}
                      />
                    </Tooltip>
                    
                    {pomodoro.state.task && (
                      <Tooltip label="Mark task as completed (C)">
                        <IconButton
                          aria-label="Complete Task"
                          icon={<FaCheck />}
                          colorScheme="green"
                          size="md"
                          isRound
                          onClick={handleCompleteTask}
                        />
                      </Tooltip>
                    )}
                  </HStack>
                </Flex>
                
                {/* Row 3: Task Selection */}
                <Box mt={1}>
                  <Flex justify="space-between" mb={1}>
                    <Text fontWeight="medium" fontSize="sm">
                      Current Task
                    </Text>
                    <Button 
                      size="xs" 
                      variant="ghost" 
                      colorScheme="blue" 
                      leftIcon={<FaListUl size="10px" />}
                      onClick={() => pomodoro.actions.changeTask(null)}
                    >
                      Change Task
                    </Button>
                  </Flex>
                  
                  <Box
                    p={3}
                    borderRadius="md"
                    bg={timerBgColor}
                    borderWidth="1px"
                    borderColor={borderColor}
                  >
                    <HStack justify="space-between">
                      <HStack>
                        <Box
                          w="10px"
                          h="10px"
                          borderRadius="full"
                          bg={pomodoro.state.task?.priority === 'high' ? 'red.400' : pomodoro.state.task?.priority === 'medium' ? 'yellow.400' : 'green.400'}
                        />
                        <Text fontWeight="medium">{pomodoro.state.task.title}</Text>
                      </HStack>
                    </HStack>
                  </Box>
                </Box>

                {/* Keyboard shortcuts panel - made less obtrusive */}
                <Collapse in={showKeyboardShortcuts} animateOpacity>
                  <Box
                    bg={timerBgColor}
                    p={3}
                    borderRadius="md"
                    mb={2}
                    fontSize="xs"
                  >
                    <Flex justify="space-between" align="center" mb={2}>
                      <Heading size="xs">Keyboard Shortcuts</Heading>
                      <IconButton 
                        icon={<FaTimes />} 
                        aria-label="Close keyboard shortcuts" 
                        size="xs"
                        variant="ghost"
                        onClick={toggleKeyboardShortcuts}
                      />
                    </Flex>
                    <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={2}>
                      <HStack>
                        <Tag size="sm" variant="subtle" colorScheme="blue" minW="50px" justifyContent="center">Space</Tag>
                        <Text fontSize="xs">Start/Pause timer</Text>
                      </HStack>
                      <HStack>
                        <Tag size="sm" variant="subtle" colorScheme="blue" minW="50px" justifyContent="center">R</Tag>
                        <Text fontSize="xs">Reset timer</Text>
                      </HStack>
                      <HStack>
                        <Tag size="sm" variant="subtle" colorScheme="blue" minW="50px" justifyContent="center">F</Tag>
                        <Text fontSize="xs">Enter focus mode</Text>
                      </HStack>
                      <HStack>
                        <Tag size="sm" variant="subtle" colorScheme="blue" minW="50px" justifyContent="center">C</Tag>
                        <Text fontSize="xs">Complete task</Text>
                      </HStack>
                      <HStack>
                        <Tag size="sm" variant="subtle" colorScheme="blue" minW="50px" justifyContent="center">H</Tag>
                        <Text fontSize="xs">Toggle history</Text>
                      </HStack>
                      <HStack>
                        <Tag size="sm" variant="subtle" colorScheme="blue" minW="50px" justifyContent="center">K</Tag>
                        <Text fontSize="xs">Toggle shortcuts</Text>
                      </HStack>
                    </SimpleGrid>
                  </Box>
                </Collapse>
                
                {/* Row 4: Action Tabs */}
                <Tabs variant="soft-rounded" colorScheme="blue" size="sm" mt={2}>
                  <TabList>
                    <Tab>
                      <HStack spacing={1}>
                        <FaChartBar size="12px" />
                        <Text fontSize="sm">Stats</Text>
                      </HStack>
                    </Tab>
                    <Tab>
                      <HStack spacing={1}>
                        <FaHistory size="12px" />
                        <Text fontSize="sm">History</Text>
                      </HStack>
                    </Tab>
                    <Tab>
                      <HStack spacing={1}>
                        <FaCog size="12px" />
                        <Text fontSize="sm">Settings</Text>
                      </HStack>
                    </Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel px={0} pt={4}>
                      {/* Stats Panel - simplified */}
                      {pomodoro.state.task && productivityStats ? (
                        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                          <Box p={3} bg={timerBgColor} borderRadius="md" shadow="sm">
                            <Stat size="sm">
                              <StatLabel fontSize="xs">Today's Focus</StatLabel>
                              <StatNumber fontSize="xl">{formatTotalTime(productivityStats.todayFocusTime)}</StatNumber>
                              <StatHelpText fontSize="xs">{productivityStats.todaySessions} sessions today</StatHelpText>
                            </Stat>
                          </Box>
                          <Box p={3} bg={timerBgColor} borderRadius="md" shadow="sm">
                            <Stat size="sm">
                              <StatLabel fontSize="xs">Total Focus Time</StatLabel>
                              <StatNumber fontSize="xl">{formatTotalTime(productivityStats.totalFocusTime)}</StatNumber>
                              <StatHelpText fontSize="xs">{productivityStats.sessionsCompleted} total sessions</StatHelpText>
                            </Stat>
                          </Box>
                          <Box p={3} bg={timerBgColor} borderRadius="md" shadow="sm">
                            <Stat size="sm">
                              <StatLabel fontSize="xs">Average Session</StatLabel>
                              <StatNumber fontSize="xl">{formatTotalTime(productivityStats.averageSessionDuration)}</StatNumber>
                              <StatHelpText fontSize="xs">Per completed pomodoro</StatHelpText>
                            </Stat>
                          </Box>
                          <Box p={3} bg={timerBgColor} borderRadius="md" shadow="sm">
                            <Stat size="sm">
                              <StatLabel fontSize="xs">Current Streak</StatLabel>
                              <StatNumber fontSize="xl">{pomodoro.state.cycleCount}</StatNumber>
                              <StatHelpText fontSize="xs">Consecutive pomodoros</StatHelpText>
                            </Stat>
                          </Box>
                        </SimpleGrid>
                      ) : (
                        <Box textAlign="center" py={6} color={textColor} opacity={0.7}>
                          <FaChartBar size={24} style={{ margin: '0 auto 12px' }} />
                          <Text fontSize="sm">Select a task to see productivity stats</Text>
                        </Box>
                      )}
                    </TabPanel>
                    <TabPanel px={0} pt={4}>
                      {/* History Panel - simplified */}
                      {pomodoro.state.task ? (
                        <Box>
                          <Heading as="h3" size="xs" mb={3}>
                            Session History
                          </Heading>
                          
                          {completedSessions.filter(s => s.taskId === pomodoro.state.task?.id).length === 0 ? (
                            <Text color={textColor} opacity={0.7} textAlign="center" py={4} fontSize="sm">
                              No completed pomodoros for this task yet
                            </Text>
                          ) : (
                            <VStack align="stretch" spacing={2} maxH="180px" overflowY="auto">
                              {completedSessions
                                .filter(s => s.taskId === pomodoro.state.task?.id)
                                .map(session => (
                                  <Box
                                    key={session.id}
                                    p={2}
                                    borderRadius="md"
                                    bg={historyItemBg}
                                    borderWidth="1px"
                                    borderColor={borderColor}
                                  >
                                    <Flex justify="space-between" align="center">
                                      <Text fontSize="xs" fontWeight="medium">
                                        {formatDate(session.startTime)}
                                      </Text>
                                      <Badge colorScheme="green" fontSize="xs">
                                        {formatTotalTime(session.duration)}
                                      </Badge>
                                    </Flex>
                                  </Box>
                                ))
                              }
                            </VStack>
                          )}
                        </Box>
                      ) : (
                        <Box textAlign="center" py={6} color={textColor} opacity={0.7}>
                          <FaHistory size={24} style={{ margin: '0 auto 12px' }} />
                          <Text fontSize="sm">Select a task to see session history</Text>
                        </Box>
                      )}
                    </TabPanel>
                    <TabPanel px={0} pt={4}>
                      {/* Settings Panel - more streamlined */}
                      <VStack spacing={3} align="stretch">
                        <Flex justify="space-between" align="center">
                          <HStack>
                            <Text fontWeight="medium" fontSize="sm">Focus Mode</Text>
                            <Tooltip label="Enter distraction-free environment (F)">
                              <IconButton
                                aria-label="Enter Focus Mode"
                                icon={<FaCloud size="12px" />}
                                size="xs"
                                colorScheme="blue"
                                variant="ghost"
                                onClick={toggleFocusMode}
                              />
                            </Tooltip>
                          </HStack>
                          <Switch 
                            colorScheme="blue"
                            size="sm"
                            isChecked={isFocusMode}
                            onChange={toggleFocusMode}
                          />
                        </Flex>
                        <Divider />
                        <Flex justify="space-between" align="center">
                          <Text fontSize="sm">Auto-start Breaks</Text>
                          <Switch colorScheme="blue" size="sm" />
                        </Flex>
                        <Flex justify="space-between" align="center">
                          <Text fontSize="sm">Desktop Notifications</Text>
                          <Switch colorScheme="blue" size="sm" defaultChecked />
                        </Flex>
                        <Flex justify="space-between" align="center">
                          <Text fontSize="sm">Sound Alerts</Text>
                          <Switch colorScheme="blue" size="sm" defaultChecked />
                        </Flex>
                      </VStack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </VStack>
            )}
          </ModalBody>

          <ModalFooter pt={2}>
            <Button size="sm" mr={3} onClick={onClose} variant="ghost">Close</Button>
            {pomodoro.state.task && (
              <Button 
                colorScheme="blue"
                size="sm"
                onClick={toggleFocusMode}
              >
                <HStack spacing={1}>
                  <FaExpand />
                  <Text>Enter Focus Mode</Text>
                </HStack>
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Render Focus Mode UI when active */}
      {isFocusMode && renderFocusMode()}
    </>
  );
};

export default PomodoroModal; 