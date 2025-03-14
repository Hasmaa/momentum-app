import React, { useState, useEffect } from 'react';
import {
  Box,
  HStack,
  Text,
  Select,
  useColorModeValue,
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Divider,
  useBreakpointValue,
  ButtonGroup,
  Tooltip
} from '@chakra-ui/react';
import { ChevronDownIcon, SmallCloseIcon } from '@chakra-ui/icons';
import { MdFilterAlt, MdFilterAltOff } from 'react-icons/md';
import { Tag, TagFilters } from '../../types';
import { TagService } from '../../services/TagService';
import { TagBadge } from './TagBadge';

interface TagFilterBarProps {
  tagFilters: TagFilters;
  onTagFiltersChange: (filters: TagFilters) => void;
  onClearTagFilters: () => void;
}

export const TagFilterBar: React.FC<TagFilterBarProps> = ({
  tagFilters,
  onTagFiltersChange,
  onClearTagFilters,
}) => {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const displayLabels = useBreakpointValue({ base: false, md: true });
  
  // Load all available tags
  useEffect(() => {
    setAllTags(TagService.getTags());
  }, [tagFilters]);
  
  // Handle adding a tag to filter
  const handleTagSelect = (tag: Tag) => {
    if (!tagFilters.selectedTags.some(t => t.id === tag.id)) {
      const updatedTags = [...tagFilters.selectedTags, tag];
      onTagFiltersChange({
        ...tagFilters,
        selectedTags: updatedTags,
      });
    }
  };
  
  // Handle removing a tag from filter
  const handleTagRemove = (tagId: string) => {
    const updatedTags = tagFilters.selectedTags.filter(tag => tag.id !== tagId);
    onTagFiltersChange({
      ...tagFilters,
      selectedTags: updatedTags,
    });
  };
  
  // Handle match type change (any/all)
  const handleMatchTypeChange = (matchType: 'any' | 'all') => {
    onTagFiltersChange({
      ...tagFilters,
      matchType,
    });
  };
  
  // Check if there are any active filters
  const hasActiveFilters = tagFilters.selectedTags.length > 0;
  
  return (
    <Box 
      p={3} 
      borderWidth="1px" 
      borderRadius="md" 
      bg={bgColor} 
      borderColor={borderColor}
      position="relative"
    >
      <Flex direction={{ base: 'column', md: 'row' }} alignItems={{ base: 'flex-start', md: 'center' }} gap={4}>
        <HStack spacing={2} mb={{ base: 2, md: 0 }} mr={{ base: 0, md: 4 }}>
          {displayLabels && (
            <Text fontWeight="bold" fontSize="sm" whiteSpace="nowrap">
              Filter by Tags:
            </Text>
          )}
          <Tooltip label="Filter by tags">
            <IconButton
              icon={<MdFilterAlt />}
              aria-label="Filter by tags"
              size="sm"
              variant="ghost"
              display={{ base: 'flex', md: 'none' }}
            />
          </Tooltip>
          
          <Menu closeOnSelect={false}>
            <MenuButton 
              as={Button} 
              rightIcon={<ChevronDownIcon />}
              size="sm"
              variant="outline"
              colorScheme={hasActiveFilters ? "blue" : "gray"}
            >
              {hasActiveFilters ? `${tagFilters.selectedTags.length} selected` : 'Select Tags'}
            </MenuButton>
            <MenuList maxH="300px" overflowY="auto" zIndex={1000}>
              {allTags.length > 0 ? (
                <>
                  {allTags.map((tag) => (
                    <MenuItem 
                      key={tag.id} 
                      onClick={() => handleTagSelect(tag)}
                      isDisabled={tagFilters.selectedTags.some(t => t.id === tag.id)}
                    >
                      <TagBadge tag={tag} />
                    </MenuItem>
                  ))}
                </>
              ) : (
                <MenuItem isDisabled>No tags available</MenuItem>
              )}
            </MenuList>
          </Menu>
        </HStack>
        
        {hasActiveFilters && (
          <>
            <Divider orientation="vertical" height="24px" mx={2} display={{ base: 'none', md: 'block' }} />
            <Divider my={2} display={{ base: 'block', md: 'none' }} />
            
            <HStack spacing={2} mb={{ base: 2, md: 0 }} mr={{ base: 0, md: 4 }}>
              {displayLabels && (
                <Text fontSize="sm" whiteSpace="nowrap">
                  Match:
                </Text>
              )}
              <Select
                value={tagFilters.matchType}
                onChange={(e) => handleMatchTypeChange(e.target.value as 'any' | 'all')}
                size="sm"
                width="auto"
              >
                <option value="any">Any Tag</option>
                <option value="all">All Tags</option>
              </Select>
            </HStack>
            
            <Divider orientation="vertical" height="24px" mx={2} display={{ base: 'none', md: 'block' }} />
            <Divider my={2} display={{ base: 'block', md: 'none' }} />
            
            <ButtonGroup size="sm">
              <Tooltip label="Clear all tag filters">
                <Button
                  leftIcon={<MdFilterAltOff />}
                  onClick={onClearTagFilters}
                  size="sm"
                  colorScheme="red"
                  variant="outline"
                >
                  {displayLabels ? 'Clear Filters' : ''}
                </Button>
              </Tooltip>
            </ButtonGroup>
          </>
        )}
      </Flex>
      
      {hasActiveFilters && (
        <Box mt={3}>
          <Flex flexWrap="wrap" gap={2}>
            {tagFilters.selectedTags.map((tag) => (
              <TagBadge
                key={tag.id}
                tag={tag}
                isRemovable
                onRemove={() => handleTagRemove(tag.id)}
              />
            ))}
          </Flex>
        </Box>
      )}
    </Box>
  );
}; 