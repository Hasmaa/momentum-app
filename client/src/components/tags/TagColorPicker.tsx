import React from 'react';
import { Box, SimpleGrid, Tooltip, useColorModeValue } from '@chakra-ui/react';
import { TAG_COLORS } from '../../services/TagService';

interface TagColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

export const TagColorPicker: React.FC<TagColorPickerProps> = ({
  selectedColor,
  onColorSelect,
}) => {
  const borderColor = useColorModeValue('gray.300', 'gray.600');

  return (
    <Box>
      <SimpleGrid columns={6} spacing={2}>
        {TAG_COLORS.map((color) => (
          <Tooltip key={color} label={color} placement="top">
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
            />
          </Tooltip>
        ))}
      </SimpleGrid>
    </Box>
  );
}; 