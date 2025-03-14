import React from 'react';
import { Tag as ChakraTag, TagLabel, TagCloseButton, Tooltip, useColorModeValue, Box } from '@chakra-ui/react';
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
  // Enhanced algorithm to determine if text should be light or dark
  const getTextColor = (bgColor: string) => {
    // Convert hex to RGB
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate relative luminance (per WCAG 2.0)
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    
    // Return white for dark backgrounds and black for light backgrounds
    // Higher threshold (155) for better contrast
    return luminance < 155 ? 'white' : 'black';
  };

  const textColor = getTextColor(tag.color);
  
  // Create a slightly darker color for hover effect
  const getHoverColor = (hexColor: string) => {
    // Convert hex to RGB
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Darken each component by 15%
    const darken = (val: number) => Math.max(0, Math.floor(val * 0.85));
    
    // Convert back to hex
    return `#${darken(r).toString(16).padStart(2, '0')}${darken(g).toString(16).padStart(2, '0')}${darken(b).toString(16).padStart(2, '0')}`;
  };
  
  const hoverBgColor = getHoverColor(tag.color);
  
  return (
    <Tooltip label={isRemovable ? `Remove ${tag.name}` : tag.name} placement="top">
      <ChakraTag
        size={size}
        borderRadius="full"
        variant="solid"
        backgroundColor={tag.color}
        color={textColor}
        cursor={onClick ? 'pointer' : 'default'}
        onClick={onClick}
        m={1}
        fontWeight="medium"
        boxShadow="sm"
        transition="all 0.2s"
        _hover={{
          backgroundColor: hoverBgColor,
          boxShadow: 'md',
          transform: onClick ? 'translateY(-1px)' : 'none'
        }}
      >
        <TagLabel>{tag.name}</TagLabel>
        {isRemovable && onRemove && (
          <TagCloseButton 
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          />
        )}
      </ChakraTag>
    </Tooltip>
  );
}; 