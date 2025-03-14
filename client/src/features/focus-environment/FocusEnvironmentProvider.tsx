import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { SoundTrack, EnvironmentPreset, FocusEnvironmentContextType } from './types';
import { DEFAULT_SOUND_TRACKS, DEFAULT_PRESETS } from './data';
import { nanoid } from 'nanoid';
import { useLocalStorage } from '../../hooks/useLocalStorage'; // Assuming this exists or can be easily created

// Create context with default values
const FocusEnvironmentContext = createContext<FocusEnvironmentContextType | null>(null);

// Custom hook to use the context
export const useFocusEnvironment = () => {
  const context = useContext(FocusEnvironmentContext);
  if (!context) {
    throw new Error('useFocusEnvironment must be used within a FocusEnvironmentProvider');
  }
  return context;
};

interface FocusEnvironmentProviderProps {
  children: ReactNode;
}

export const FocusEnvironmentProvider: React.FC<FocusEnvironmentProviderProps> = ({ children }) => {
  // Local storage for persisting user preferences
  const [storedSoundTracks, setStoredSoundTracks] = useLocalStorage<SoundTrack[]>('focus-sound-tracks', []);
  const [storedPresets, setStoredPresets] = useLocalStorage<EnvironmentPreset[]>('focus-environment-presets', []);
  const [lastPresetId, setLastPresetId] = useLocalStorage<string | null>('focus-last-preset', null);
  
  // Refs for audio control
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // State
  const [currentSoundTrack, setCurrentSoundTrack] = useState<SoundTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.5);
  const [isDNDEnabled, setIsDNDEnabled] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string | null>(lastPresetId);
  
  // Combined sound tracks (defaults + user custom)
  const availableSoundTracks = [...DEFAULT_SOUND_TRACKS, ...storedSoundTracks.filter(st => st.isCustom)];
  
  // All presets
  const availablePresets = [...DEFAULT_PRESETS, ...storedPresets];
  
  // Effect to handle audio initialization
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);
  
  // Effect to apply volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);
  
  // Handle playing sound tracks
  const playSoundTrack = (soundTrackId: string) => {
    const track = availableSoundTracks.find(t => t.id === soundTrackId);
    if (!track) return;
    
    if (audioRef.current) {
      // If it's the same track and paused, just resume
      if (currentSoundTrack?.id === soundTrackId && audioRef.current.paused) {
        audioRef.current.play();
        setIsPlaying(true);
        return;
      }
      
      // Otherwise, load and play new track
      audioRef.current.src = track.src;
      audioRef.current.load();
      audioRef.current.play()
        .then(() => {
          setCurrentSoundTrack(track);
          setIsPlaying(true);
        })
        .catch(err => {
          console.error('Error playing audio:', err);
          setIsPlaying(false);
        });
    }
  };
  
  // Pause current track
  const pauseSoundTrack = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };
  
  // Stop and reset current track
  const stopSoundTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentSoundTrack(null);
    }
  };
  
  // Volume control
  const setVolume = (newVolume: number) => {
    // Ensure volume is between 0 and 1
    const normalizedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(normalizedVolume);
  };
  
  // Do Not Disturb toggle
  const toggleDND = () => {
    // In a web application, we can't directly control OS DND settings
    // But we can track the state and provide guidance to users
    setIsDNDEnabled(prev => !prev);
    
    // If available, we could show notifications or instructions here
    if (!isDNDEnabled) {
      // Could display a notification with instructions on how to enable DND on their OS
      console.log('Consider enabling Do Not Disturb mode on your device for better focus');
    }
  };
  
  // Apply a focus environment preset
  const applyPreset = (presetId: string) => {
    const preset = availablePresets.find(p => p.id === presetId);
    if (!preset) return;
    
    // Apply settings
    setVolumeState(preset.volume);
    setIsDNDEnabled(preset.enableDND);
    
    // If preset has a sound, play it
    if (preset.soundTrackId) {
      playSoundTrack(preset.soundTrackId);
    } else {
      stopSoundTrack();
    }
    
    // Set as active preset and save to storage
    setActivePresetId(presetId);
    setLastPresetId(presetId);
    
    // Here we could also adjust dark mode and other visual aspects
    // if we have access to those settings
  };
  
  // Add custom sound track
  const addCustomSoundTrack = (track: Omit<SoundTrack, 'id' | 'isCustom'>) => {
    const newTrack: SoundTrack = {
      ...track,
      id: `custom-${nanoid(6)}`,
      isCustom: true
    };
    
    setStoredSoundTracks(prev => [...prev, newTrack]);
    return newTrack.id;
  };
  
  // Remove custom sound track
  const removeCustomSoundTrack = (trackId: string) => {
    // Stop if it's currently playing
    if (currentSoundTrack?.id === trackId) {
      stopSoundTrack();
    }
    
    // Remove from storage
    setStoredSoundTracks(prev => prev.filter(track => track.id !== trackId));
  };
  
  // Save current settings as a new preset
  const saveCurrentAsPreset = (name: string, description: string, icon: ReactNode) => {
    const newPreset: EnvironmentPreset = {
      id: `custom-preset-${nanoid(6)}`,
      name,
      description,
      soundTrackId: currentSoundTrack?.id || null,
      volume,
      enableDND: isDNDEnabled,
      visualMode: 'standard', // Default
      isDark: null, // Follow system
      icon
    };
    
    setStoredPresets(prev => [...prev, newPreset]);
    return newPreset.id;
  };
  
  const contextValue: FocusEnvironmentContextType = {
    // State
    currentSoundTrack,
    isPlaying,
    volume,
    isDNDEnabled,
    activePresetId,
    availableSoundTracks,
    customSoundTracks: storedSoundTracks.filter(st => st.isCustom),
    availablePresets,
    
    // Actions
    playSoundTrack,
    pauseSoundTrack,
    stopSoundTrack,
    setVolume,
    toggleDND,
    applyPreset,
    addCustomSoundTrack,
    removeCustomSoundTrack,
    saveCurrentAsPreset
  };
  
  return (
    <FocusEnvironmentContext.Provider value={contextValue}>
      {children}
      {isDNDEnabled && (
        <div style={{ display: 'none' }}>
          {/* This could be where we put notification suppression logic */}
        </div>
      )}
    </FocusEnvironmentContext.Provider>
  );
}; 