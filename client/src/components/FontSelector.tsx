import React, { useEffect, useState } from 'react';
import { 
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  Text,
  Icon,
  HStack
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { FaFont } from 'react-icons/fa';
import { fonts, fontNames, FontOption, setFont, getCurrentFont, createTheme } from '../theme';
import { useTheme } from '@chakra-ui/react';

interface FontSelectorProps {
  onFontChange?: (font: FontOption) => void;
}

const FontSelector: React.FC<FontSelectorProps> = ({ onFontChange }) => {
  const [selectedFont, setSelectedFont] = useState<FontOption>(getCurrentFont());
  const buttonBg = useColorModeValue('white', 'gray.700');
  const menuBg = useColorModeValue('white', 'gray.700');
  const theme = useTheme();
  
  useEffect(() => {
    // Set the initial font from localStorage if available
    setSelectedFont(getCurrentFont());
  }, []);

  const handleFontChange = (font: FontOption) => {
    setSelectedFont(font);
    setFont(font);
    
    // Update the Chakra theme with the new font
    document.documentElement.style.setProperty('--chakra-fonts-heading', fonts[font]);
    document.documentElement.style.setProperty('--chakra-fonts-body', fonts[font]);
    
    // Call the optional callback
    if (onFontChange) {
      onFontChange(font);
    }
  };

  return (
    <Menu>
      <MenuButton
        as={Button}
        rightIcon={<ChevronDownIcon />}
        leftIcon={<Icon as={FaFont} />}
        bg={buttonBg}
        size="sm"
        borderRadius="md"
        _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
      >
        <Text fontSize="sm">Font: {fontNames[selectedFont]}</Text>
      </MenuButton>
      <MenuList bg={menuBg} zIndex={1001}>
        {Object.entries(fontNames).map(([key, displayName]) => (
          <MenuItem 
            key={key} 
            onClick={() => handleFontChange(key as FontOption)}
            fontFamily={fonts[key as FontOption]}
            fontWeight={key === selectedFont ? 'bold' : 'normal'}
            bg={key === selectedFont ? useColorModeValue('gray.100', 'gray.600') : 'transparent'}
          >
            {displayName}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default FontSelector; 