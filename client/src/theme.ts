import { extendTheme, ThemeConfig } from '@chakra-ui/react';

// Define available fonts
export const fonts = {
  inter: "'Inter', sans-serif",
  roboto: "'Roboto', sans-serif",
  poppins: "'Poppins', sans-serif",
  sourceSansPro: "'Source Sans Pro', sans-serif",
  lato: "'Lato', sans-serif",
  merriweather: "'Merriweather', serif",
  ibmPlexSans: "'IBM Plex Sans', sans-serif",
  nunitoSans: "'Nunito Sans', sans-serif",
};

// Font display names for UI
export const fontNames = {
  inter: "Inter",
  roboto: "Roboto",
  poppins: "Poppins",
  sourceSansPro: "Source Sans Pro",
  lato: "Lato",
  merriweather: "Merriweather",
  ibmPlexSans: "IBM Plex Sans",
  nunitoSans: "Nunito Sans",
};

// Default font
export type FontOption = keyof typeof fonts;
export const defaultFont: FontOption = 'inter';

// Get the current font from localStorage or use default
export const getCurrentFont = (): FontOption => {
  if (typeof window === 'undefined') return defaultFont;
  return (localStorage.getItem('selectedFont') as FontOption) || defaultFont;
};

// Set the font in localStorage
export const setFont = (font: FontOption) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('selectedFont', font);
  }
};

// Configuration for the theme
const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: true,
};

// Create theme function that accepts a font parameter
export const createTheme = (selectedFont: FontOption = getCurrentFont()) => {
  return extendTheme({
    config,
    fonts: {
      heading: fonts[selectedFont],
      body: fonts[selectedFont],
    },
    colors: {
      brand: {
        50: '#e3f2fd',
        100: '#bbdefb',
        200: '#90caf9',
        300: '#64b5f6',
        400: '#42a5f5',
        500: '#2196f3',
        600: '#1e88e5',
        700: '#1976d2',
        800: '#1565c0',
        900: '#0d47a1',
      },
    },
  });
};

// Default theme instance
const theme = createTheme();

export default theme; 