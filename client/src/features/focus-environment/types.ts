import { ReactNode } from 'react';

export type SoundCategory = 'nature' | 'ambient' | 'white-noise' | 'meditation' | 'custom';

export interface SoundTrack {
  id: string;
  name: string;
  category: SoundCategory;
  src: string;
  iconName?: string;
  isCustom?: boolean;
  duration?: number; // in seconds
}

export interface EnvironmentPreset {
  id: string;
  name: string;
  description: string;
  soundTrackId: string | null;
  volume: number;
  enableDND: boolean;
  visualMode: 'standard' | 'minimal' | 'zen';
  isDark: boolean | null; // null means follows system
  timerDuration?: number; // in minutes
  icon: ReactNode;
}

export interface FocusEnvironmentContextType {
  // Current state
  currentSoundTrack: SoundTrack | null;
  isPlaying: boolean;
  volume: number;
  isDNDEnabled: boolean;
  activePresetId: string | null;
  
  // Sound tracks
  availableSoundTracks: SoundTrack[];
  customSoundTracks: SoundTrack[];
  
  // Presets 
  availablePresets: EnvironmentPreset[];
  
  // Actions
  playSoundTrack: (soundTrackId: string) => void;
  pauseSoundTrack: () => void;
  stopSoundTrack: () => void;
  setVolume: (volume: number) => void;
  toggleDND: () => void;
  applyPreset: (presetId: string) => void;
  addCustomSoundTrack: (track: Omit<SoundTrack, 'id' | 'isCustom'>) => string;
  removeCustomSoundTrack: (trackId: string) => void;
  saveCurrentAsPreset: (name: string, description: string, icon: ReactNode) => string;
} 