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
  Progress,
  useColorModeValue,
  IconButton,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Badge,
  Tooltip,
  FormControl,
  FormLabel,
  Divider,
  useToast,
  Switch,
  Portal,
  Flex,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Select,
  Center,
} from '@chakra-ui/react';
import { 
  FaPlay, 
  FaPause, 
  FaUndo, 
  FaCheck,
  FaExpand,
  FaCompress,
  FaVolumeUp,
  FaVolumeMute,
  FaMusic,
  FaSun,
  FaMoon,
  FaTimes,
} from 'react-icons/fa';
import { Task } from '../../../types';
import { keyframes } from '@emotion/react';

// Define the animation keyframes
const floatAnimation = keyframes`
  0% { transform: translateY(0) rotate(0); }
  50% { transform: translateY(-10px) rotate(5deg); }
  100% { transform: translateY(0) rotate(0); }
`;

const floatSmallAnimation = keyframes`
  0% { transform: translateX(0) translateY(0); }
  50% { transform: translateX(-15px) translateY(-5px); }
  100% { transform: translateX(0) translateY(0); }
`;

const floatMediumAnimation = keyframes`
  0% { transform: translateX(0) translateY(0); }
  50% { transform: translateX(10px) translateY(-10px); }
  100% { transform: translateX(0) translateY(0); }
`;

const glowAnimation = keyframes`
  0% { opacity: 0.8; }
  50% { opacity: 1; }
  100% { opacity: 0.8; }
`;

// Sun-specific animations
const sunRotateAnimation = keyframes`
  0% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(90deg) scale(1.1); }
  50% { transform: rotate(180deg) scale(1); }
  75% { transform: rotate(270deg) scale(1.1); }
  100% { transform: rotate(360deg) scale(1); }
`;

// Moon-specific animations
const moonRockAnimation = keyframes`
  0% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
  100% { transform: rotate(-5deg); }
`;

// Add ambient sound options
const AMBIENT_SOUNDS = [
  { id: 'forest', name: 'Forest', url: '/sounds/forest-ambience.mp3' },
  { id: 'rain', name: 'Rain', url: '/sounds/gentle-rain.mp3' },
  { id: 'white-noise', name: 'White Noise', url: '/sounds/white-noise.mp3' },
  { id: 'meditation', name: 'Meditation Bells', url: '/sounds/meditation-bells.mp3' },
];

// Timer completion sounds - using local files except bell which was explicitly excluded
const COMPLETION_SOUNDS = {
  focus: '/sounds/meditation-bells.mp3',
  break: '/sounds/meditation-bells.mp3'
};

interface PomodoroModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onTaskComplete: (taskId: string) => Promise<void>;
}

const PomodoroModal: React.FC<PomodoroModalProps> = ({
  isOpen,
  onClose,
  tasks,
  onTaskComplete
}) => {
  // Timer state
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [time, setTime] = useState(25 * 60 * 1000); // Default 25 minutes in ms
  const [totalTime, setTotalTime] = useState(25 * 60 * 1000);
  const [isBreak, setIsBreak] = useState(false);
  
  // Timer settings
  const [focusTime, setFocusTime] = useState(25); // in minutes
  const [breakTime, setBreakTime] = useState(5); // in minutes
  
  // Completed tasks during this session
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  
  // Focus mode state
  const [isFocusMode, setIsFocusMode] = useState(false);
  
  // Sound player state
  const [currentSound, setCurrentSound] = useState<string | null>(null);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Timer interval reference - fix TypeScript error
  const [intervalId, setIntervalId] = useState<number | null>(null);
  
  const toast = useToast();
  
  // Colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const timerBgColor = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Focus and Break colors - changed to make focus blue and break green
  const focusColor = "blue.500";
  const breakColor = "green.500";
  
  // Focus mode colors and styles
  const focusBgColor = useColorModeValue(
    'linear-gradient(180deg, #87CEEB 0%, #E0F7FA 100%)',
    'linear-gradient(180deg, #1A202C 0%, #2D3748 100%)'
  );
  
  // Handle sound mute toggle
  const handleMuteToggle = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Handle sound volume change
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  // Handle sound selection change
  const handleSoundChange = (soundId: string) => {
    setCurrentSound(soundId === 'none' ? null : soundId);
    
    if (audioRef.current) {
      // Stop any current audio
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      
      if (soundId === 'none') {
        audioRef.current.src = '';
      } else {
        const sound = AMBIENT_SOUNDS.find(s => s.id === soundId);
        if (sound) {
          // Set the new sound source
          audioRef.current.src = sound.url;
          audioRef.current.load();
          
          // Only autoplay if timer is running and not paused
          if (isRunning && !isPaused) {
            audioRef.current.play().catch(err => {
              console.error('Error playing sound:', err);
              toast({
                title: 'Could not play sound',
                description: 'There was an issue playing the selected sound.',
                status: 'error',
                duration: 3000,
                isClosable: true,
              });
            });
          }
        }
      }
    }
  };

  // Play ambient sound
  const playAmbientSound = () => {
    if (audioRef.current && currentSound) {
      const sound = AMBIENT_SOUNDS.find(s => s.id === currentSound);
      if (sound) {
        if (audioRef.current.paused) {
          // Make sure we have the correct source
          const currentSrc = audioRef.current.src;
          const expectedSrc = new URL(sound.url, window.location.origin).href;
          if (currentSrc !== expectedSrc) {
            audioRef.current.src = sound.url;
            audioRef.current.load();
          }
          
          // Try to play with error handling
          audioRef.current.play().catch(err => {
            console.error('Error playing sound:', err);
            toast({
              title: 'Could not play sound',
              description: 'This may be due to browser restrictions. Try interacting with the page first.',
              status: 'error',
              duration: 3000,
              isClosable: true,
            });
          });
        }
      }
    }
  };

  // Pause ambient sound
  const pauseAmbientSound = () => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }
  };

  // Stop ambient sound
  const stopAmbientSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };
  
  // Initialize audio with the preloaded sound
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
      audioRef.current.volume = volume / 100;
      audioRef.current.muted = isMuted;
      
      // If there's a current sound selected, load it
      if (currentSound) {
        const sound = AMBIENT_SOUNDS.find(s => s.id === currentSound);
        if (sound) {
          audioRef.current.src = sound.url;
          audioRef.current.load();
        }
      }
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);
  
  // Update audio volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);
  
  // Update audio muted state when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);
  
  // Start timer
  const startTimer = useCallback(() => {
    if (isRunning && !isPaused) return;
    
    if (!isPaused) {
      // Set initial time based on mode
      const initialTime = isBreak ? breakTime * 60 * 1000 : focusTime * 60 * 1000;
      setTime(initialTime);
      setTotalTime(initialTime);
    }
    
    setIsRunning(true);
    setIsPaused(false);
    
    // Start ambient sound if selected
    if (currentSound && audioRef.current) {
      audioRef.current.play().catch(error => {
        console.error("Audio play failed:", error);
      });
    }
    
    const id = window.setInterval(() => {
      setTime(prevTime => {
        if (prevTime <= 1000) {
          // Timer completed
          clearInterval(id);
  
          // Play completion sound
          const completionSound = new Audio(
            isBreak 
              ? COMPLETION_SOUNDS.break
              : COMPLETION_SOUNDS.focus
          );
          completionSound.play().catch(e => console.error("Couldn't play completion sound", e));
          
          // Switch between focus and break
          if (isBreak) {
            toast({
              title: 'Break ended!',
              description: 'Time to focus again.',
              status: 'info',
              duration: 3000,
              isClosable: true,
            });
            setIsBreak(false);
            setIsRunning(false);
            return focusTime * 60 * 1000;
          } else {
            toast({
              title: 'Focus session completed!',
              description: 'Time for a break.',
              status: 'success',
              duration: 3000,
              isClosable: true,
            });
            setIsBreak(true);
            setIsRunning(false);
            return breakTime * 60 * 1000;
          }
        }
        return prevTime - 1000;
      });
    }, 1000);
    
    setIntervalId(id);
    
    return () => clearInterval(id);
  }, [isRunning, isPaused, isBreak, focusTime, breakTime, toast, currentSound]);

  // Pause timer
  const pauseTimer = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    
    setIsPaused(true);
    
    // Pause ambient sound
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [intervalId]);
  
  // Reset timer
  const resetTimer = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    
    const resetTime = isBreak ? breakTime * 60 * 1000 : focusTime * 60 * 1000;
    setTime(resetTime);
    setTotalTime(resetTime);
    setIsRunning(false);
    setIsPaused(false);
    
    // Pause ambient sound
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [intervalId, isBreak, focusTime, breakTime]);

  // Toggle focus mode
  const toggleFocusMode = useCallback(() => {
    setIsFocusMode(prev => !prev);
  }, []);

  // Change timer settings
  const updateTimerSettings = useCallback(() => {
    if (!isRunning) {
      // Only update time if timer is not running
      setTime(focusTime * 60 * 1000);
      setTotalTime(focusTime * 60 * 1000);
    }
  }, [focusTime, isRunning]);
  
  // Effect to update timer settings when values change
  useEffect(() => {
    updateTimerSettings();
  }, [focusTime, breakTime, updateTimerSettings]);

  // Handle task completion
  const handleTaskComplete = useCallback(async (taskId: string) => {
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
    } catch (error) {
      toast({
        title: 'Failed to complete task.',
        description: 'There was an error updating the task status.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [onTaskComplete, toast]);
  
  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);
  
  // Format time as MM:SS
  const formatTime = useCallback((ms: number): string => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);
  
  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when modal is open and not in input fields
      if (!isOpen || ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ': // Space bar
          if (isRunning && !isPaused) {
            pauseTimer();
          } else {
            startTimer();
          }
          e.preventDefault();
          break;
        case 'r':
          resetTimer();
          e.preventDefault();
          break;
        case 'f':
          toggleFocusMode();
          e.preventDefault();
          break;
        case 'escape':
          if (isFocusMode) {
            setIsFocusMode(false);
            e.preventDefault();
          }
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isRunning, isPaused, isFocusMode, startTimer, pauseTimer, resetTimer, toggleFocusMode]);
  
  // Render Focus Mode UI
  const renderFocusMode = () => {
    const isDarkMode = useColorModeValue(false, true);
    const cloudColor = useColorModeValue('#FFFFFF', '#4A5568');
    const cloudShadow = useColorModeValue('rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.3)');
    
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
              animation={`${floatMediumAnimation} 10s infinite ease-in-out`}
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
              animation={`${floatMediumAnimation} 12s infinite ease-in-out 1s`}
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

          {/* Sun/Moon decoration */}
          <Box
            position="absolute"
            top="20%"
            left="30%"
            transform="translateX(-50%)"
            zIndex={0}
          >
            {isDarkMode ? (
              <Box animation={`${moonRockAnimation} 4s infinite ease-in-out`}>
                <FaMoon size={60} color="#E2E8F0" opacity={0.8} />
              </Box>
            ) : (
              <Box animation={`${sunRotateAnimation} 20s infinite linear`}>
                <FaSun size={80} color="#FFD700" opacity={0.8} />
              </Box>
            )}
          </Box>

          {/* Main content - Horizontal Layout */}
          <Flex 
            position="relative" 
            zIndex={1} 
            width="90%" 
            maxWidth="1200px" 
            justifyContent="center"
            gap={8}
          >
            {/* Exit button */}
            <Box position="absolute" top={-16} right={-4}>
              <Tooltip label="Exit focus mode (Esc)" placement="left">
                <IconButton
                  icon={<FaCompress />}
                  aria-label="Exit focus mode"
                  colorScheme="whiteAlpha"
                  size="md"
                  isRound
                  onClick={toggleFocusMode}
                />
              </Tooltip>
            </Box>

            {/* Left Column: Timer and Controls */}
            <VStack 
              spacing={6} 
              align="center" 
              width={{ base: "100%", md: "50%" }}
              maxWidth="500px"
            >
              {/* Timer display */}
              <Center position="relative" mb={6}>
                <Box
                  position="absolute"
                  w="260px"
                  h="260px"
                  borderRadius="full"
                  bg={useColorModeValue("whiteAlpha.300", "blackAlpha.300")}
                  boxShadow="0 0 20px rgba(255,255,255,0.2)"
                />
                
                <Box
                  bg={useColorModeValue("white", "gray.800")}
                  borderRadius="full"
                  boxShadow="0px 10px 30px rgba(0, 0, 0, 0.15)"
                  p={14}
                  position="relative"
                  zIndex={1}
                >
                  <Text
                    fontSize="5xl"
                    fontWeight="bold"
                    color={textColor}
                    fontFamily="mono"
                  >
                    {formatTime(time)}
                  </Text>
                </Box>
              </Center>

              {/* Timer progress */}
              <Box width="300px" height="6px" mb={2}>
                <Progress
                  value={(totalTime - time) / totalTime * 100}
                  size="sm"
                  colorScheme={isPaused ? "yellow" : isBreak ? "green" : "blue"}
                  borderRadius="full"
                />
              </Box>

              {/* Status text */}
              <Badge
                colorScheme={isPaused ? "yellow" : isBreak ? "green" : "blue"}
                fontSize="md"
                px={4}
                py={2}
                borderRadius="full"
                mb={4}
              >
                {isPaused ? "PAUSED" : isBreak ? "BREAK TIME" : "FOCUS TIME"}
              </Badge>

              {/* Timer Controls */}
              <HStack spacing={4}>
                {!isRunning || isPaused ? (
                  <IconButton
                    aria-label="Start Timer"
                    icon={<FaPlay />}
                    colorScheme={isBreak ? "green" : "blue"}
                    size="lg"
                    isRound
                    onClick={startTimer}
                  />
                ) : (
                  <IconButton
                    aria-label="Pause Timer"
                    icon={<FaPause />}
                    colorScheme="yellow"
                    size="lg"
                    isRound
                    onClick={pauseTimer}
                  />
                )}
                
                <IconButton
                  aria-label="Reset Timer"
                  icon={<FaUndo />}
                  colorScheme="gray"
                  size="md"
                  isRound
                  onClick={resetTimer}
                />
              </HStack>

              {/* Sound selector and controls */}
              <Box 
                mt={4} 
                p={4} 
                borderRadius="lg" 
                bg={useColorModeValue("whiteAlpha.500", "blackAlpha.500")}
                width="300px"
              >
                <Flex align="center" mb={3} justifyContent="space-between">
                  <HStack spacing={1}>
                    <FaMusic size="14px" />
                    <Text fontWeight="medium" fontSize="sm">Ambient Sound</Text>
                  </HStack>
                </Flex>
                
                <Select 
                  size="sm" 
                  value={currentSound || "none"} 
                  onChange={(e) => handleSoundChange(e.target.value)}
                  mb={3}
                >
                  <option value="none">No sound</option>
                  {AMBIENT_SOUNDS.map(sound => (
                    <option key={sound.id} value={sound.id}>
                      {sound.name}
                    </option>
                  ))}
                </Select>
                
                {currentSound && (
                  <>
                    <HStack spacing={3} mb={2} justifyContent="center">
                      <IconButton
                        aria-label="Play Sound"
                        icon={<FaPlay />}
                        size="sm"
                        variant="ghost"
                        colorScheme="gray"
                        onClick={playAmbientSound}
                      />
                      <IconButton
                        aria-label="Pause Sound"
                        icon={<FaPause />}
                        size="sm"
                        variant="ghost"
                        colorScheme="gray"
                        onClick={pauseAmbientSound}
                      />
                      <IconButton
                        aria-label="Stop Sound"
                        icon={<FaTimes />}
                        size="sm"
                        variant="ghost"
                        colorScheme="gray"
                        onClick={stopAmbientSound}
                      />
                      <IconButton
                        aria-label={isMuted ? "Unmute" : "Mute"}
                        icon={isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                        size="sm"
                        variant="ghost"
                        colorScheme="gray"
                        onClick={handleMuteToggle}
                      />
                    </HStack>
                    
                    <HStack spacing={2} align="center">
                      <Text fontSize="xs">Volume:</Text>
                      <Slider
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        min={0}
                        max={100}
                        size="sm"
                        flex="1"
                      >
                        <SliderTrack>
                          <SliderFilledTrack />
                        </SliderTrack>
                        <SliderThumb />
                      </Slider>
                    </HStack>
                  </>
                )}
              </Box>
            </VStack>

            {/* Right Column: Task Tracking */}
            <VStack 
              spacing={6} 
              align="stretch" 
              width={{ base: "100%", md: "50%" }}
              maxWidth="500px"
              display={{ base: "none", md: "flex" }}
              bg={useColorModeValue("whiteAlpha.500", "blackAlpha.500")}
              p={5}
              borderRadius="xl"
              h="fit-content"
              maxH="600px"
            >
              {/* Tasks completed */}
              <Box>
                <Text fontWeight="medium" mb={2}>
                  Tasks completed this session:
                </Text>
                
                {completedTasks.length === 0 ? (
                  <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.400")} textAlign="center" py={2}>
                    No tasks completed yet
                  </Text>
                ) : (
                  <VStack align="stretch" spacing={2} maxH="150px" overflowY="auto">
                    {completedTasks.map(taskId => {
                      const task = tasks.find(t => t.id === taskId);
                      return task ? (
                        <Box
                          key={taskId}
                          p={2}
                          borderRadius="md"
                          bg={useColorModeValue("whiteAlpha.500", "blackAlpha.400")}
                          borderWidth="1px"
                          borderColor={useColorModeValue("whiteAlpha.700", "whiteAlpha.300")}
                        >
                          <Text fontSize="sm">{task.title}</Text>
                        </Box>
                      ) : null;
                    })}
                  </VStack>
                )}
              </Box>
              
              <Divider />
              
              {/* Available Tasks */}
              <Box>
                <Text fontWeight="medium" mb={2}>
                  Available tasks:
                </Text>
                
                <VStack align="stretch" spacing={2} maxH="250px" overflowY="auto">
                  {tasks
                    .filter(task => task.status !== 'completed' && !completedTasks.includes(task.id))
                    .map(task => (
                      <HStack
                        key={task.id}
                        p={2}
                        borderRadius="md"
                        bg={useColorModeValue("whiteAlpha.500", "blackAlpha.400")}
                        borderWidth="1px"
                        borderColor={useColorModeValue("whiteAlpha.700", "whiteAlpha.300")}
                        justify="space-between"
                      >
                        <Text fontSize="sm">{task.title}</Text>
                        <IconButton
                          icon={<FaCheck />}
                          aria-label="Complete task"
                          size="xs"
                          colorScheme="green"
                          variant="ghost"
                          onClick={() => handleTaskComplete(task.id)}
                        />
                      </HStack>
                    ))
                  }
                </VStack>
              </Box>
            </VStack>
          </Flex>
        </Box>
      </Portal>
    );
  };
    
  return (
    <>
      <Modal isOpen={isOpen && !isFocusMode} onClose={onClose} size="4xl" isCentered>
        <ModalOverlay backdropFilter="blur(2px)" />
        <ModalContent bg={bgColor} borderRadius="xl" boxShadow="xl" >
          <ModalHeader display="flex" alignItems="center" justifyContent="space-between" pt={5} pb={4} pr={12}>
            <Text>Pomodoro Timer</Text>
            <Badge
              colorScheme={isPaused ? 'yellow' : isRunning ? (isBreak ? 'green' : 'blue') : 'gray'}
              px={2}
              py={1}
              borderRadius="md"
            >
              {isPaused ? 'PAUSED' : isRunning ? (isBreak ? 'BREAK' : 'FOCUS') : 'READY'}
            </Badge>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody pb={6} px={6}>
            <Flex 
              align="stretch"
              gap={6}
            >
              {/* Left Column: Timer and Controls */}
              <VStack spacing={6} align="stretch" flex="1">
                {/* Timer Settings */}
                <HStack spacing={4} align="flex-end">
                  <FormControl>
                    <FormLabel fontSize="sm">Focus Time (min)</FormLabel>
                    <NumberInput 
                      min={1} 
                      max={60} 
                      value={focusTime}
                      onChange={(_, value) => setFocusTime(value)}
                      isDisabled={isRunning}
                      size="sm"
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel fontSize="sm">Break Time (min)</FormLabel>
                    <NumberInput 
                      min={1} 
                      max={30} 
                      value={breakTime}
                      onChange={(_, value) => setBreakTime(value)}
                      isDisabled={isRunning}
                      size="sm"
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </HStack>
                
                <Divider />
                
                {/* Timer Display */}
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
                    value={(totalTime - time) / totalTime * 100}
                    size="xs"
                    colorScheme={isPaused ? 'yellow' : isBreak ? 'green' : 'blue'}
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
                    {formatTime(time)}
                  </Text>
                  
                  <Text fontSize="sm" mt={2} color={isBreak ? breakColor : focusColor} fontWeight="medium">
                    {isBreak ? 'BREAK TIME' : 'FOCUS TIME'}
                  </Text>
                </Box>
                
                {/* Timer Controls */}
                <HStack justify="center" spacing={4} mt={2}>
                  {!isRunning || isPaused ? (
                    <Tooltip label="Start/Resume (Space)" placement="top">
                      <IconButton
                        aria-label="Start Timer"
                        icon={<FaPlay />}
                        colorScheme={isBreak ? "green" : "blue"}
                        size="lg"
                        isRound
                        onClick={startTimer}
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
                        onClick={pauseTimer}
                      />
                    </Tooltip>
                  )}
                  
                  <Tooltip label="Reset timer (R)" placement="top">
                    <IconButton
                      aria-label="Reset Timer"
                      icon={<FaUndo />}
                      colorScheme="gray"
                      size="md"
                      isRound
                      onClick={resetTimer}
                    />
                  </Tooltip>
                  
                  <Tooltip label="Focus mode (F)" placement="top">
                    <IconButton
                      aria-label="Enter Focus Mode"
                      icon={<FaExpand />}
                      colorScheme="purple"
                      variant="outline"
                      size="md"
                      isRound
                      onClick={toggleFocusMode}
                    />
                  </Tooltip>
                </HStack>
                
                {/* Sound Controls */}
                <Box p={3} bg={timerBgColor} borderRadius="md" mt={2}>
                  <Flex align="center" mb={2}>
                    <HStack spacing={1}>
                      <FaMusic size="14px" />
                      <Text fontSize="sm" fontWeight="medium">Ambient Sound</Text>
                    </HStack>
                  </Flex>
                  
                  <HStack spacing={3} mb={2}>
                    <Select
                      size="sm"
                      value={currentSound || "none"}
                      onChange={(e) => handleSoundChange(e.target.value)}
                      maxW="100%"
                    >
                      <option value="none">No sound</option>
                      {AMBIENT_SOUNDS.map(sound => (
                        <option key={sound.id} value={sound.id}>
                          {sound.name}
                        </option>
                      ))}
                    </Select>
                  </HStack>
                  
                  {currentSound && (
                    <>
                      <HStack spacing={3} mb={2} justifyContent="center">
                        <IconButton
                          aria-label="Play Sound"
                          icon={<FaPlay />}
                          size="sm"
                          variant="ghost"
                          colorScheme="gray"
                          onClick={playAmbientSound}
                        />
                        <IconButton
                          aria-label="Pause Sound"
                          icon={<FaPause />}
                          size="sm"
                          variant="ghost"
                          colorScheme="gray"
                          onClick={pauseAmbientSound}
                        />
                        <IconButton
                          aria-label="Stop Sound"
                          icon={<FaTimes />}
                          size="sm"
                          variant="ghost"
                          colorScheme="gray"
                          onClick={stopAmbientSound}
                        />
                        <IconButton
                          aria-label={isMuted ? "Unmute" : "Mute"}
                          icon={isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                          size="sm"
                          variant="ghost"
                          colorScheme="gray"
                          onClick={handleMuteToggle}
                        />
                      </HStack>
                      
                      <HStack spacing={2} align="center">
                        <Text fontSize="xs">Volume:</Text>
                        <Slider
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          min={0}
                          max={100}
                          size="sm"
                          flex="1"
                        >
                          <SliderTrack>
                            <SliderFilledTrack />
                          </SliderTrack>
                          <SliderThumb />
                        </Slider>
                      </HStack>
                    </>
                  )}
                </Box>
              </VStack>
              
              {/* Right Column: Task Tracking */}
              <VStack 
                spacing={6} 
                align="stretch" 
                flex="1"
                bg={timerBgColor}
                p={4}
                borderRadius="md"
                maxH="600px"
              >
                {/* Tasks completed */}
                <Box>
                  <Text fontWeight="medium" mb={2}>
                    Tasks completed this session:
                  </Text>
                  
                  {completedTasks.length === 0 ? (
                    <Text fontSize="sm" color="gray.500" textAlign="center" py={2}>
                      No tasks completed yet
                    </Text>
                  ) : (
                    <VStack align="stretch" spacing={2} maxH="150px" overflowY="auto">
                      {completedTasks.map(taskId => {
                        const task = tasks.find(t => t.id === taskId);
                        return task ? (
                          <Box
                            key={taskId}
                            p={2}
                            borderRadius="md"
                            bg={useColorModeValue("white", "gray.700")}
                            borderWidth="1px"
                            borderColor={borderColor}
                          >
                            <Text fontSize="sm">{task.title}</Text>
                          </Box>
                        ) : null;
                      })}
                    </VStack>
                  )}
                </Box>
                
                <Divider />
                
                {/* Available Tasks */}
                <Box flex="1">
                  <Text fontWeight="medium" mb={2}>
                    Available tasks:
                  </Text>
                  
                  <VStack align="stretch" spacing={2} maxH="220px" overflowY="auto">
                    {tasks
                      .filter(task => task.status !== 'completed' && !completedTasks.includes(task.id))
                      .map(task => (
                        <HStack
                          key={task.id}
                          p={2}
                          borderRadius="md"
                          bg={useColorModeValue("white", "gray.700")}
                          borderWidth="1px"
                          borderColor={borderColor}
                          justify="space-between"
                        >
                          <Text fontSize="sm">{task.title}</Text>
                          <IconButton
                            icon={<FaCheck />}
                            aria-label="Complete task"
                            size="xs"
                            colorScheme="green"
                            variant="ghost"
                            onClick={() => handleTaskComplete(task.id)}
                          />
                        </HStack>
                      ))
                    }
                  </VStack>
                </Box>
              </VStack>
            </Flex>
          </ModalBody>

          <ModalFooter pt={2}>
            <HStack spacing={2}>
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="auto-switch" mb="0" fontSize="xs">
                  Auto-start breaks
                </FormLabel>
                <Switch id="auto-switch" size="sm" colorScheme="blue" />
              </FormControl>
              
              <Button onClick={onClose} size="sm">Close</Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Focus Mode */}
      {isFocusMode && renderFocusMode()}
    </>
  );
};

export default PomodoroModal; 