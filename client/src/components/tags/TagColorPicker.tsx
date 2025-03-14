import React from 'react';
import { Box, SimpleGrid, Tooltip, useColorModeValue, useTheme } from '@chakra-ui/react';
import { TAG_COLORS } from '../../services/TagService';

// Define semantic color mapping for tooltips
const COLOR_NAMES: Record<string, string> = {
  '#3182CE': 'Blue',
  '#38A169': 'Green',
  '#E53E3E': 'Red',
  '#DD6B20': 'Orange',
  '#805AD5': 'Purple',
  '#D69E2E': 'Yellow',
  '#00B5D8': 'Cyan',
  '#ED64A6': 'Pink',
  '#667EEA': 'Indigo',
  '#9F7AEA': 'Lavender',
  '#4FD1C5': 'Teal',
  '#718096': 'Gray',
};

interface TagColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

export const TagColorPicker: React.FC<TagColorPickerProps> = ({
  selectedColor,
  onColorSelect,
}) => {
  const theme = useTheme();
  const borderColor = useColorModeValue('gray.300', 'gray.600');

  return (
    <Box>
      <SimpleGrid columns={6} spacing={2}>
        {TAG_COLORS.map((color) => (
          <Tooltip key={color} label={COLOR_NAMES[color] || color} placement="top">
            <Box
              w="30px"
              h="30px"
              borderRadius="md"
              bg={color}
              cursor="pointer"
              onClick={() => onColorSelect(color)}
              borderWidth={selectedColor === color ? '2px' : '1px'}
              borderColor={selectedColor === color ? 'blue.500' : borderColor}
              _hover={{ transform: 'scale(1.08)', transition: 'transform 0.2s' }}
              transition="all 0.2s"
              boxShadow={selectedColor === color ? 'md' : 'none'}
            />
          </Tooltip>
        ))}
      </SimpleGrid>
    </Box>
  );
}; 