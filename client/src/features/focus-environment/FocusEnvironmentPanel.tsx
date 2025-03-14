import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Heading,
  Icon,
  SimpleGrid,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Badge,
  useColorModeValue,
  IconButton,
  Tooltip,
  Collapse,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useDisclosure,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Flex,
  Switch,
} from '@chakra-ui/react';
import { FaPause, FaPlay, FaPlus, FaTrash, FaSave, FaUpload, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { useFocusEnvironment } from './FocusEnvironmentProvider';
import { SoundTrack } from './types';

// Audio upload component
const AudioUploader: React.FC<{ onUpload: (track: Omit<SoundTrack, 'id' | 'isCustom'>) => void }> = ({ onUpload }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'nature' | 'ambient' | 'white-noise' | 'meditation' | 'custom'>('custom');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      
      // Auto-set name if not already set
      if (!name) {
        const fileName = e.target.files[0].name;
        setName(fileName.replace(/\.[^/.]+$/, "")); // Remove extension
      }
    }
  };

  const handleUpload = () => {
    if (!file || !name) return;
    
    setIsUploading(true);
    
    // In a production app, you'd upload to a server
    // Here we create a local URL
    const src = URL.createObjectURL(file);
    
    // Pass the new track to parent
    onUpload({
      name,
      category,
      src
    });
    
    // Reset form
    setName('');
    setCategory('custom');
    setFile(null);
    setIsUploading(false);
  };

  return (
    <VStack spacing={4} align="stretch">
      <FormControl isRequired>
        <FormLabel>Sound Name</FormLabel>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Custom Sound" />
      </FormControl>
      
      <FormControl>
        <FormLabel>Category</FormLabel>
        <HStack spacing={3} wrap="wrap">
          {['nature', 'ambient', 'white-noise', 'meditation', 'custom'].map((cat) => (
            <Button
              key={cat}
              size="sm"
              colorScheme={category === cat ? 'blue' : 'gray'}
              onClick={() => setCategory(cat as any)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Button>
          ))}
        </HStack>
      </FormControl>
      
      <FormControl isRequired>
        <FormLabel>Audio File</FormLabel>
        <Input type="file" accept="audio/*" onChange={handleFileChange} />
        <Text fontSize="xs" mt={1} color="gray.500">
          MP3, WAV, or OGG formats recommended
        </Text>
      </FormControl>
      
      <Button
        leftIcon={<FaUpload />}
        colorScheme="blue"
        isLoading={isUploading}
        isDisabled={!file || !name}
        onClick={handleUpload}
      >
        Add Sound
      </Button>
    </VStack>
  );
};

// Preset creator component
const PresetCreator: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { saveCurrentAsPreset } = useFocusEnvironment();

  const handleSave = () => {
    if (!name) return;
    
    // Save the current settings as a new preset
    saveCurrentAsPreset(name, description, <FaPlay />);
    onClose();
  };

  return (
    <VStack spacing={4} align="stretch">
      <FormControl isRequired>
        <FormLabel>Preset Name</FormLabel>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Focus Preset" />
      </FormControl>
      
      <FormControl>
        <FormLabel>Description</FormLabel>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your preset..."
          resize="vertical"
        />
      </FormControl>
      
      <Button
        leftIcon={<FaSave />}
        colorScheme="blue"
        isDisabled={!name}
        onClick={handleSave}
      >
        Save Preset
      </Button>
    </VStack>
  );
};

export const FocusEnvironmentPanel: React.FC = () => {
  const {
    availableSoundTracks,
    currentSoundTrack,
    isPlaying,
    volume,
    isDNDEnabled,
    availablePresets,
    activePresetId,
    playSoundTrack,
    pauseSoundTrack,
    stopSoundTrack,
    setVolume,
    toggleDND,
    applyPreset,
    addCustomSoundTrack,
    removeCustomSoundTrack,
  } = useFocusEnvironment();

  const { isOpen: isUploadOpen, onOpen: onUploadOpen, onClose: onUploadClose } = useDisclosure();
  const { isOpen: isPresetOpen, onOpen: onPresetOpen, onClose: onPresetClose } = useDisclosure();
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const activeBg = useColorModeValue('blue.50', 'blue.900');
  
  const [showAll, setShowAll] = useState(false);

  // Group sound tracks by category
  const categories = Array.from(new Set(availableSoundTracks.map(track => track.category)));
  
  const handleUpload = (track: Omit<SoundTrack, 'id' | 'isCustom'>) => {
    addCustomSoundTrack(track);
    onUploadClose();
  };

  const handleTogglePlayback = (soundTrackId: string) => {
    if (currentSoundTrack?.id === soundTrackId && isPlaying) {
      pauseSoundTrack();
    } else {
      playSoundTrack(soundTrackId);
    }
  };

  return (
    <Box width="100%">
      <VStack spacing={6} align="stretch">
        <HStack justifyContent="space-between" align="center">
          <Heading size="md">Focus Environment</Heading>
          <Tooltip label="Save current settings as preset">
            <IconButton
              icon={<FaSave />}
              aria-label="Save as preset"
              variant="ghost"
              onClick={onPresetOpen}
            />
          </Tooltip>
        </HStack>
        
        {/* Environment Presets */}
        <Box>
          <Text fontWeight="semibold" mb={2}>Presets</Text>
          <SimpleGrid columns={{ base: 2, md: 3 }} spacing={3}>
            {availablePresets.map((preset) => (
              <Button
                key={preset.id}
                onClick={() => applyPreset(preset.id)}
                colorScheme={activePresetId === preset.id ? 'blue' : 'gray'}
                variant={activePresetId === preset.id ? 'solid' : 'outline'}
                height="auto"
                py={2}
                justifyContent="flex-start"
              >
                <VStack align="start" spacing={0}>
                  <Text>{preset.name}</Text>
                  {preset.description && (
                    <Text fontSize="xs" color="gray.500" noOfLines={1}>
                      {preset.description}
                    </Text>
                  )}
                </VStack>
              </Button>
            ))}
          </SimpleGrid>
        </Box>
        
        {/* Volume & DND Controls */}
        <HStack spacing={6}>
          <Box flex={1}>
            <HStack>
              <Icon as={volume === 0 ? FaVolumeMute : FaVolumeUp} />
              <Slider
                aria-label="Volume"
                value={volume}
                onChange={setVolume}
                min={0}
                max={1}
                step={0.01}
                flex={1}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </HStack>
          </Box>
          
          <HStack>
            <Text fontSize="sm">Do Not Disturb</Text>
            <Switch isChecked={isDNDEnabled} onChange={toggleDND} colorScheme="blue" />
          </HStack>
        </HStack>
        
        {/* Sound Tracks */}
        <Tabs variant="soft-rounded" colorScheme="blue" size="sm">
          <TabList>
            <Tab>All Sounds</Tab>
            {categories.map(category => (
              <Tab key={category}>{category.charAt(0).toUpperCase() + category.slice(1)}</Tab>
            ))}
          </TabList>
          
          <TabPanels>
            <TabPanel px={0}>
              <VStack spacing={2} align="stretch">
                {availableSoundTracks.slice(0, showAll ? undefined : 6).map((track) => (
                  <Flex
                    key={track.id}
                    bg={currentSoundTrack?.id === track.id ? activeBg : cardBg}
                    p={3}
                    borderRadius="md"
                    justify="space-between"
                    align="center"
                    _hover={{ bg: hoverBg }}
                  >
                    <HStack>
                      <IconButton
                        icon={currentSoundTrack?.id === track.id && isPlaying ? <FaPause /> : <FaPlay />}
                        aria-label={isPlaying ? "Pause" : "Play"}
                        size="sm"
                        onClick={() => handleTogglePlayback(track.id)}
                      />
                      <VStack spacing={0} align="start">
                        <Text fontWeight="medium">{track.name}</Text>
                        <Badge size="sm" colorScheme={track.isCustom ? 'purple' : 'blue'}>
                          {track.category}
                        </Badge>
                      </VStack>
                    </HStack>
                    
                    {track.isCustom && (
                      <IconButton
                        icon={<FaTrash />}
                        aria-label="Delete sound"
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => removeCustomSoundTrack(track.id)}
                      />
                    )}
                  </Flex>
                ))}
                
                {availableSoundTracks.length > 6 && (
                  <Button variant="ghost" size="sm" onClick={() => setShowAll(!showAll)}>
                    {showAll ? 'Show Less' : `Show All (${availableSoundTracks.length})`}
                  </Button>
                )}
                
                <Button
                  leftIcon={<FaPlus />}
                  variant="outline"
                  mt={2}
                  onClick={onUploadOpen}
                >
                  Add Custom Sound
                </Button>
              </VStack>
            </TabPanel>
            
            {/* Category tabs */}
            {categories.map(category => (
              <TabPanel key={category} px={0}>
                <VStack spacing={2} align="stretch">
                  {availableSoundTracks
                    .filter(track => track.category === category)
                    .map((track) => (
                      <Flex
                        key={track.id}
                        bg={currentSoundTrack?.id === track.id ? activeBg : cardBg}
                        p={3}
                        borderRadius="md"
                        justify="space-between"
                        align="center"
                        _hover={{ bg: hoverBg }}
                      >
                        <HStack>
                          <IconButton
                            icon={currentSoundTrack?.id === track.id && isPlaying ? <FaPause /> : <FaPlay />}
                            aria-label={isPlaying ? "Pause" : "Play"}
                            size="sm"
                            onClick={() => handleTogglePlayback(track.id)}
                          />
                          <Text fontWeight="medium">{track.name}</Text>
                        </HStack>
                        
                        {track.isCustom && (
                          <IconButton
                            icon={<FaTrash />}
                            aria-label="Delete sound"
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => removeCustomSoundTrack(track.id)}
                          />
                        )}
                      </Flex>
                  ))}
                </VStack>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </VStack>
      
      {/* Upload Modal */}
      <Modal isOpen={isUploadOpen} onClose={onUploadClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Custom Sound</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <AudioUploader onUpload={handleUpload} />
          </ModalBody>
        </ModalContent>
      </Modal>
      
      {/* Preset Modal */}
      <Modal isOpen={isPresetOpen} onClose={onPresetClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Save Current Settings as Preset</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <PresetCreator onClose={onPresetClose} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}; 