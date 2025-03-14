import React, { useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  useColorModeValue,
  Divider,
  Icon,
  HStack,
  Tooltip,
} from '@chakra-ui/react';
import { FaVolumeUp, FaMusic, FaSpa } from 'react-icons/fa';
import { FocusEnvironmentCompact } from './FocusEnvironmentCompact';
import { useFocusEnvironment } from './FocusEnvironmentProvider';

interface PomodoroFocusEnvironmentProps {
  /**
   * Current Pomodoro timer state
   */
  pomodoroState: {
    isRunning: boolean;
    currentSession: {
      type: 'focus' | 'break' | 'longBreak' | null;
    } | null;
  };
  /**
   * Whether the component should be rendered in a minimal mode
   */
  isMinimal?: boolean;
}

/**
 * Component that integrates the Focus Environment with the Pomodoro timer
 */
export const PomodoroFocusEnvironment: React.FC<PomodoroFocusEnvironmentProps> = ({
  pomodoroState,
  isMinimal = false,
}) => {
  const { currentSoundTrack, isPlaying, pauseSoundTrack, playSoundTrack, applyPreset, availablePresets } = useFocusEnvironment();
  
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Auto-play sound when timer is running and in focus mode
  useEffect(() => {
    // When pomodoro starts, consider playing sound
    if (pomodoroState.isRunning && pomodoroState.currentSession?.type === 'focus') {
      // If we have a sound track but it's not playing, start it
      if (currentSoundTrack && !isPlaying) {
        playSoundTrack(currentSoundTrack.id);
      } 
      // If we don't have a sound track, maybe play a default one
      else if (!currentSoundTrack && availablePresets.length > 0) {
        // Find a focus-oriented preset
        const focusPreset = availablePresets.find(p => 
          p.name.toLowerCase().includes('focus') || 
          p.name.toLowerCase().includes('productivity')
        );
        if (focusPreset) {
          applyPreset(focusPreset.id);
        } else {
          // Just use the first preset if none are specifically for focus
          applyPreset(availablePresets[0].id);
        }
      }
    } 
    // When timer stops, pause sound
    else if (!pomodoroState.isRunning && isPlaying) {
      pauseSoundTrack();
    }
  }, [
    pomodoroState.isRunning, 
    pomodoroState.currentSession?.type,
    isPlaying,
    currentSoundTrack,
    playSoundTrack,
    pauseSoundTrack,
    availablePresets,
    applyPreset
  ]);
  
  if (isMinimal) {
    return <FocusEnvironmentCompact isMinimal={true} />;
  }
  
  return (
    <VStack
      spacing={4}
      align="stretch"
      p={4}
      borderRadius="md"
      bg={bgColor}
      borderColor={borderColor}
      borderWidth="1px"
      width="100%"
    >
      <HStack justify="space-between">
        <Heading size="sm" display="flex" alignItems="center">
          <Icon as={FaMusic} mr={2} />
          Focus Environment
        </Heading>
        <Tooltip label="Enhance your focus with ambient sounds and customizable environment settings">
          <Icon as={FaSpa} color="green.500" />
        </Tooltip>
      </HStack>
      
      <Text fontSize="sm" color="gray.500">
        Enhance your Pomodoro sessions with ambient sounds to create your ideal focus environment.
      </Text>
      
      <Divider />
      
      <FocusEnvironmentCompact />
    </VStack>
  );
}; 