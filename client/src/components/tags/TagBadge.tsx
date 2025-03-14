import React from 'react';
import { Tag as ChakraTag, TagLabel, TagCloseButton, Tooltip, useColorModeValue } from '@chakra-ui/react';
import { Tag } from '../../types';

interface TagBadgeProps {
  tag: Tag;
  onRemove?: () => void;
  isRemovable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const TagBadge: React.FC<TagBadgeProps> = ({
  tag,
  onRemove,
  isRemovable = false,
  size = 'md',
  onClick,
}) => {
  // Determine text color based on background brightness
  const getTextColor = (bgColor: string) => {
    // Simple algorithm to determine if text should be light or dark
    // Convert hex to RGB
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate brightness (perceived)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    // If brightness is high, return dark text color, otherwise light
    return brightness > 128 ? '#000' : '#fff';
  };

  const textColor = getTextColor(tag.color);
  const hoverBgColor = useColorModeValue(
    `${tag.color}dd`, // Slightly darker in light mode
    `${tag.color}bb`  // Slightly lighter in dark mode
  );

  return (
    <Tooltip label={isRemovable ? `Remove ${tag.name}` : tag.name} placement="top">
      <ChakraTag
        size={size}
        borderRadius="full"
        variant="solid"
        backgroundColor={tag.color}
        color={textColor}
        cursor={onClick ? 'pointer' : 'default'}
        _hover={onClick ? { backgroundColor: hoverBgColor } : undefined}
        onClick={onClick}
        mb={1}
        mr={1}
      >
        <TagLabel>{tag.name}</TagLabel>
        {isRemovable && <TagCloseButton onClick={(e) => {
          e.stopPropagation();
          onRemove && onRemove();
        }} />}
      </ChakraTag>
    </Tooltip>
  );
}; 