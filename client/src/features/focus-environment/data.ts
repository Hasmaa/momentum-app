import { SoundTrack, EnvironmentPreset } from './types';
import { FaTree, FaWater, FaCloudRain, FaMugHot, FaMusic, FaSpa } from 'react-icons/fa';
import React from 'react';

// Default sound tracks
export const DEFAULT_SOUND_TRACKS: SoundTrack[] = [
  {
    id: 'forest-ambience',
    name: 'Forest Ambience',
    category: 'nature',
    src: '/sounds/forest-ambience.mp3',
    iconName: 'FaTree'
  },
  {
    id: 'ocean-waves',
    name: 'Ocean Waves',
    category: 'nature',
    src: '/sounds/ocean-waves.mp3',
    iconName: 'FaWater'
  },
  {
    id: 'gentle-rain',
    name: 'Gentle Rain',
    category: 'nature',
    src: '/sounds/gentle-rain.mp3',
    iconName: 'FaCloudRain'
  },
  {
    id: 'cafe-ambience',
    name: 'Café Ambience',
    category: 'ambient',
    src: '/sounds/cafe-ambience.mp3',
    iconName: 'FaMugHot'
  },
  {
    id: 'white-noise',
    name: 'White Noise',
    category: 'white-noise',
    src: '/sounds/white-noise.mp3',
    iconName: 'FaMusic'
  },
  {
    id: 'meditation-bells',
    name: 'Meditation Bells',
    category: 'meditation',
    src: '/sounds/meditation-bells.mp3',
    iconName: 'FaSpa'
  }
];

// Default environment presets
export const DEFAULT_PRESETS: EnvironmentPreset[] = [
  {
    id: 'forest-retreat',
    name: 'Forest Retreat',
    description: 'Immerse yourself in the peaceful sounds of a forest',
    soundTrackId: 'forest-ambience',
    volume: 0.6,
    enableDND: true,
    visualMode: 'standard',
    isDark: null,
    timerDuration: 25 * 60, // 25 minutes
    icon: React.createElement(FaTree)
  },
  {
    id: 'ocean-focus',
    name: 'Ocean Focus',
    description: 'Waves crashing on the shore to help you focus',
    soundTrackId: 'ocean-waves',
    volume: 0.5,
    enableDND: true,
    visualMode: 'standard',
    isDark: null,
    timerDuration: 25 * 60,
    icon: React.createElement(FaWater)
  },
  {
    id: 'rainy-day',
    name: 'Rainy Day',
    description: 'Gentle rain sounds for deep concentration',
    soundTrackId: 'gentle-rain',
    volume: 0.4,
    enableDND: true,
    visualMode: 'standard',
    isDark: true,
    timerDuration: 30 * 60, // 30 minutes
    icon: React.createElement(FaCloudRain)
  },
  {
    id: 'cafe-work',
    name: 'Café Workspace',
    description: 'The ambient buzz of a café to boost productivity',
    soundTrackId: 'cafe-ambience',
    volume: 0.3,
    enableDND: false,
    visualMode: 'standard',
    isDark: null,
    timerDuration: 25 * 60,
    icon: React.createElement(FaMugHot)
  },
  {
    id: 'deep-focus',
    name: 'Deep Focus',
    description: 'White noise to block distractions',
    soundTrackId: 'white-noise',
    volume: 0.4,
    enableDND: true,
    visualMode: 'minimal',
    isDark: true,
    timerDuration: 40 * 60, // 40 minutes
    icon: React.createElement(FaMusic)
  },
  {
    id: 'meditation-focus',
    name: 'Meditation Focus',
    description: 'Meditation bells for mindful productivity',
    soundTrackId: 'meditation-bells',
    volume: 0.5,
    enableDND: true,
    visualMode: 'minimal',
    isDark: null,
    timerDuration: 20 * 60, // 20 minutes
    icon: React.createElement(FaSpa)
  }
]; 