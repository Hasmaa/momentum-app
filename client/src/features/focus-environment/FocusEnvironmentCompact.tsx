import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  Badge,
  Slide,
  Button,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  useColorModeValue,
  Tooltip,
  Icon,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from '@chakra-ui/react';
import { 
  FaMusic, 
  FaVolumeUp, 
  FaVolumeMute,
  FaPlay, 
  FaPause, 
  FaStopCircle, 
  FaCog, 
  FaChevronUp, 
  FaChevronDown, 
  FaRandom
} from 'react-icons/fa';
import { useFocusEnvironment } from './FocusEnvironmentProvider';
import { FocusEnvironmentPanel } from './FocusEnvironmentPanel';

interface FocusEnvironmentCompactProps {
  isMinimal?: boolean;
}

export const FocusEnvironmentCompact: React.FC<FocusEnvironmentCompactProps> = ({ isMinimal = false }) => {
  const {
    currentSoundTrack,
    isPlaying,
    volume,
    availablePresets,
    activePresetId,
    playSoundTrack,
    pauseSoundTrack,
    stopSoundTrack,
    setVolume,
    applyPreset,
  } = useFocusEnvironment();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const controlsDisclosure = useDisclosure({ defaultIsOpen: !isMinimal });
  
  // Colors for theming
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const soundBgColor = useColorModeValue('white', 'gray.800');
  const soundBgActiveColor = useColorModeValue('blue.50', 'blue.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Play a random sound
  const playRandomSound = () => {
    if (!activePresetId && availablePresets.length > 0) {
      // If no active preset, pick a random one
      const randomIndex = Math.floor(Math.random() * availablePresets.length);
      applyPreset(availablePresets[randomIndex].id);
    } else if (currentSoundTrack) {
      // If sound already playing, just toggle play/pause
      if (isPlaying) {
        pauseSoundTrack();
      } else {
        playSoundTrack(currentSoundTrack.id);
      }
    } else if (availablePresets.length > 0) {
      // Apply a random preset
      const randomIndex = Math.floor(Math.random() * availablePresets.length);
      applyPreset(availablePresets[randomIndex].id);
    }
  };

  // Handle play/pause toggle
  const togglePlayback = () => {
    if (!currentSoundTrack) return;
    
    if (isPlaying) {
      pauseSoundTrack();
    } else {
      playSoundTrack(currentSoundTrack.id);
    }
  };

  // Render the main media controls
  const renderMainControls = () => (
    <HStack spacing={2} width="100%" justify="space-between">
      <HStack>
        <IconButton
          icon={<FaMusic />}
          aria-label="Sound settings"
          size="sm"
          variant="ghost"
          onClick={onOpen}
        />
        {currentSoundTrack && (
          <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
            {currentSoundTrack.name}
            <Badge ml={2} size="sm" colorScheme="blue">
              {currentSoundTrack.category}
            </Badge>
          </Text>
        )}
      </HStack>
      
      <HStack spacing={1}>
        {!currentSoundTrack && (
          <Tooltip label="Play random focus sound">
            <IconButton
              icon={<FaRandom />}
              aria-label="Random sound"
              size="sm"
              variant="ghost"
              onClick={playRandomSound}
            />
          </Tooltip>
        )}
        
        {currentSoundTrack && (
          <>
            <IconButton
              icon={isPlaying ? <FaPause /> : <FaPlay />}
              aria-label={isPlaying ? "Pause" : "Play"}
              size="sm"
              variant="ghost"
              onClick={togglePlayback}
            />
            <IconButton
              icon={<FaStopCircle />}
              aria-label="Stop"
              size="sm"
              variant="ghost"
              onClick={stopSoundTrack}
            />
          </>
        )}
        
        {!isMinimal && (
          <IconButton
            icon={controlsDisclosure.isOpen ? <FaChevronUp /> : <FaChevronDown />}
            aria-label={controlsDisclosure.isOpen ? "Hide controls" : "Show controls"}
            size="sm"
            variant="ghost"
            onClick={controlsDisclosure.isOpen 
              ? controlsDisclosure.onClose 
              : controlsDisclosure.onOpen}
          />
        )}
      </HStack>
    </HStack>
  );

  // Render the expanded controls (volume, etc.)
  const renderExpandedControls = () => (
    <Box width="100%" mt={2}>
      <HStack spacing={2}>
        <Icon as={volume === 0 ? FaVolumeMute : FaVolumeUp} boxSize={3} />
        <Slider
          aria-label="Volume"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={setVolume}
          size="sm"
          flex={1}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>
      </HStack>
      
      {activePresetId && (
        <Text fontSize="xs" color="gray.500" mt={1}>
          Preset: {availablePresets.find(p => p.id === activePresetId)?.name || 'Custom'}
        </Text>
      )}
    </Box>
  );

  return (
    <>
      <Box
        width="100%"
        p={2}
        borderRadius="md"
        bg={bgColor}
        borderColor={borderColor}
        borderWidth="1px"
      >
        <VStack spacing={1} align="stretch">
          {renderMainControls()}
          {!isMinimal && controlsDisclosure.isOpen && renderExpandedControls()}
        </VStack>
      </Box>
      
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Focus Environment</DrawerHeader>
          <DrawerBody>
            <FocusEnvironmentPanel />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}; 