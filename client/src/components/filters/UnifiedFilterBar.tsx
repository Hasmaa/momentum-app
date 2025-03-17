import React, { useState, useEffect } from 'react';
import {
  Box,
  HStack,
  VStack,
  Text,
  Flex,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  useColorModeValue,
  Tag as ChakraTag,
  TagLabel,
  TagCloseButton,
  useBreakpointValue,
  Select,
  ButtonGroup,
  Tooltip,
  Badge,
  SimpleGrid,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from '@chakra-ui/react';
import {
  CloseIcon,
  CheckIcon,
  ChevronDownIcon,
  WarningIcon,
  TimeIcon,
  SettingsIcon
} from '@chakra-ui/icons';
import { MdFilterAlt, MdFilterAltOff } from 'react-icons/md';
import { FiTag, FiFilter } from 'react-icons/fi';
import { TagService } from '../../services/TagService';
import { Tag, TagFilters, TaskPriority, TaskStatus } from '../../types';
import { TagBadge } from '../tags/TagBadge';

// Types for our filter component
export type StatusType = TaskStatus | 'all';
export type PriorityType = TaskPriority | 'all';

export interface UnifiedFilterProps {
  // Status filter
  filterStatus: Set<StatusType>;
  onStatusFilterChange: (status: StatusType) => void;
  
  // Priority filter
  filterPriority: Set<PriorityType>;
  onPriorityFilterChange: (priority: PriorityType) => void;
  
  // Search filter - keep for sync but handled in header
  searchQuery: string;
  
  // Tag filter
  tagFilters: TagFilters;
  onTagFiltersChange: (filters: TagFilters) => void;
  
  // Clear all filters
  onClearAllFilters: () => void;

  // Drawer control
  isOpen: boolean;
  onClose: () => void;
}

export const UnifiedFilterBar: React.FC<UnifiedFilterProps> = ({
  filterStatus,
  onStatusFilterChange,
  filterPriority,
  onPriorityFilterChange,
  searchQuery,
  tagFilters,
  onTagFiltersChange,
  onClearAllFilters,
  isOpen,
  onClose
}) => {
  // State
  const [allTags, setAllTags] = useState<Tag[]>([]);
  
  // Check if there are any active filters
  const hasActiveFilters = filterStatus.size > 1 || 
                          filterPriority.size > 1 || 
                          searchQuery.trim() !== '' || 
                          tagFilters.selectedTags.length > 0;
  
  // Calculate number of active filters
  const activeFilterCount = 
    (filterStatus.size > 1 ? 1 : 0) + 
    (filterPriority.size > 1 ? 1 : 0) + 
    (searchQuery.trim() !== '' ? 1 : 0) + 
    (tagFilters.selectedTags.length > 0 ? 1 : 0);
  
  // UI colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const secondaryTextColor = useColorModeValue('gray.500', 'gray.400');
  const accentColor = useColorModeValue('blue.500', 'blue.400');
  const textColor = useColorModeValue('gray.800', 'white');
  const filterBadgeBg = useColorModeValue('blue.50', 'blue.900');
  
  // Responsive design
  const isMobile = useBreakpointValue({ base: true, md: false });
  const drawerSize = useBreakpointValue({ base: "full", md: "sm" });
  
  // Load all available tags
  useEffect(() => {
    setAllTags(TagService.getTags());
  }, [tagFilters]);
  
  // Handle tag selection
  const handleTagSelect = (tag: Tag) => {
    if (!tagFilters.selectedTags.some(t => t.id === tag.id)) {
      const updatedTags = [...tagFilters.selectedTags, tag];
      onTagFiltersChange({
        ...tagFilters,
        selectedTags: updatedTags,
      });
    }
  };
  
  // Handle tag removal
  const handleTagRemove = (tagId: string) => {
    const updatedTags = tagFilters.selectedTags.filter(tag => tag.id !== tagId);
    onTagFiltersChange({
      ...tagFilters,
      selectedTags: updatedTags,
    });
  };
  
  // Handle tag match type change
  const handleTagMatchTypeChange = (matchType: 'any' | 'all') => {
    onTagFiltersChange({
      ...tagFilters,
      matchType,
    });
  };
  
  // Clear only tag filters
  const handleClearTagFilters = () => {
    onTagFiltersChange({
      selectedTags: [],
      matchType: 'any'
    });
  };
  
  // Render active filter badges
  const renderActiveFilterBadges = () => {
    if (!hasActiveFilters) return null;
    
    return (
      <Box mt={3}>
        <Flex flexWrap="wrap" gap={2} alignItems="center">
          {/* Search Query Badge */}
          {searchQuery && (
            <ChakraTag 
              size="md" 
              borderRadius="full" 
              variant="subtle" 
              colorScheme="blue"
            >
              <TagLabel>Search: {searchQuery}</TagLabel>
            </ChakraTag>
          )}
          
          {/* Status Filter Badges */}
          {!filterStatus.has('all') && Array.from(filterStatus).map((status: StatusType) => (
            <ChakraTag 
              key={`status-${status}`} 
              size="md" 
              borderRadius="full" 
              variant="subtle" 
              colorScheme="blue"
            >
              <HStack spacing={1}>
                {status === 'pending' && <WarningIcon boxSize="3" />}
                {status === 'in-progress' && <TimeIcon boxSize="3" />}
                {status === 'completed' && <CheckIcon boxSize="3" />}
                <TagLabel>
                  {status === 'pending' ? 'Pending' : 
                   status === 'in-progress' ? 'In Progress' : 
                   status === 'completed' ? 'Completed' : status}
                </TagLabel>
              </HStack>
              <TagCloseButton 
                onClick={() => {
                  const newFilterStatus = new Set(filterStatus);
                  newFilterStatus.delete(status);
                  if (newFilterStatus.size === 0) {
                    newFilterStatus.add('all');
                  }
                  onStatusFilterChange(status);
                }} 
              />
            </ChakraTag>
          ))}
          
          {/* Priority Filter Badges */}
          {!filterPriority.has('all') && Array.from(filterPriority).map((priority: PriorityType) => (
            <ChakraTag 
              key={`priority-${priority}`} 
              size="md" 
              borderRadius="full" 
              variant="subtle" 
              colorScheme="blue"
            >
              <HStack spacing={1}>
                <WarningIcon 
                  boxSize="3" 
                  color={
                    priority === 'low' ? 'green.500' : 
                    priority === 'medium' ? 'yellow.500' : 
                    priority === 'high' ? 'red.500' : 'gray.500'
                  } 
                />
                <TagLabel>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
                </TagLabel>
              </HStack>
              <TagCloseButton 
                onClick={() => {
                  const newFilterPriority = new Set(filterPriority);
                  newFilterPriority.delete(priority);
                  if (newFilterPriority.size === 0) {
                    newFilterPriority.add('all');
                  }
                  onPriorityFilterChange(priority);
                }} 
              />
            </ChakraTag>
          ))}
          
          {/* Tag Filter Badges */}
          {tagFilters.selectedTags.map((tag) => (
            <TagBadge
              key={tag.id}
              tag={tag}
              isRemovable
              onRemove={() => handleTagRemove(tag.id)}
            />
          ))}
          
          {/* Clear All Button */}
          {hasActiveFilters && (
            <Button
              size="sm"
              leftIcon={<MdFilterAltOff />}
              colorScheme="red"
              variant="outline"
              onClick={onClearAllFilters}
              borderRadius="full"
            >
              Clear All
            </Button>
          )}
        </Flex>
      </Box>
    );
  };
  
  // Main filter sidebar content
  const sidebarContent = (
    <VStack spacing={6} align="stretch">
      <Box>
        <Text fontWeight="bold" fontSize="lg" mb={3}>Filters</Text>
        {hasActiveFilters && (
          <Flex justify="space-between" align="center" mb={4}>
            <Badge colorScheme="blue" fontSize="sm" borderRadius="full" px={2} py={1}>
              {activeFilterCount} active {activeFilterCount === 1 ? 'filter' : 'filters'}
            </Badge>
            <Button
              size="sm"
              leftIcon={<MdFilterAltOff />}
              colorScheme="red"
              variant="outline"
              onClick={onClearAllFilters}
            >
              Clear All Filters
            </Button>
          </Flex>
        )}
      </Box>
      
      {/* Status Filter */}
      <Box>
        <Text fontWeight="semibold" mb={3}>Status</Text>
        <SimpleGrid columns={2} spacing={2}>
          <Button
            size="md"
            variant={filterStatus.has('all') ? "solid" : "outline"}
            colorScheme={filterStatus.has('all') ? "blue" : "gray"}
            onClick={() => onStatusFilterChange('all')}
            justifyContent="flex-start"
            borderRadius="md"
          >
            All Statuses
          </Button>
          <Button
            size="md"
            variant={filterStatus.has('pending') ? "solid" : "outline"}
            colorScheme={filterStatus.has('pending') ? "blue" : "gray"}
            onClick={() => onStatusFilterChange('pending')}
            justifyContent="flex-start"
            leftIcon={<WarningIcon />}
            borderRadius="md"
          >
            Pending
          </Button>
          <Button
            size="md"
            variant={filterStatus.has('in-progress') ? "solid" : "outline"}
            colorScheme={filterStatus.has('in-progress') ? "blue" : "gray"}
            onClick={() => onStatusFilterChange('in-progress')}
            justifyContent="flex-start"
            leftIcon={<TimeIcon />}
            borderRadius="md"
          >
            In Progress
          </Button>
          <Button
            size="md"
            variant={filterStatus.has('completed') ? "solid" : "outline"}
            colorScheme={filterStatus.has('completed') ? "blue" : "gray"}
            onClick={() => onStatusFilterChange('completed')}
            justifyContent="flex-start"
            leftIcon={<CheckIcon />}
            borderRadius="md"
          >
            Completed
          </Button>
        </SimpleGrid>
      </Box>
      
      <Divider />
      
      {/* Priority Filter */}
      <Box>
        <Text fontWeight="semibold" mb={3}>Priority</Text>
        <SimpleGrid columns={2} spacing={2}>
          <Button
            size="md"
            variant={filterPriority.has('all') ? "solid" : "outline"}
            colorScheme={filterPriority.has('all') ? "blue" : "gray"}
            onClick={() => onPriorityFilterChange('all')}
            justifyContent="flex-start"
            borderRadius="md"
          >
            All Priorities
          </Button>
          <Button
            size="md"
            variant={filterPriority.has('low') ? "solid" : "outline"}
            colorScheme={filterPriority.has('low') ? "blue" : "gray"}
            onClick={() => onPriorityFilterChange('low')}
            justifyContent="flex-start"
            leftIcon={<WarningIcon color="green.500" />}
            borderRadius="md"
          >
            Low
          </Button>
          <Button
            size="md"
            variant={filterPriority.has('medium') ? "solid" : "outline"}
            colorScheme={filterPriority.has('medium') ? "blue" : "gray"}
            onClick={() => onPriorityFilterChange('medium')}
            justifyContent="flex-start"
            leftIcon={<WarningIcon color="yellow.500" />}
            borderRadius="md"
          >
            Medium
          </Button>
          <Button
            size="md"
            variant={filterPriority.has('high') ? "solid" : "outline"}
            colorScheme={filterPriority.has('high') ? "blue" : "gray"}
            onClick={() => onPriorityFilterChange('high')}
            justifyContent="flex-start"
            leftIcon={<WarningIcon color="red.500" />}
            borderRadius="md"
          >
            High
          </Button>
        </SimpleGrid>
      </Box>
      
      <Divider />
      
      {/* Tag Filter */}
      <Box>
        <Text fontWeight="semibold" mb={3}>Tags</Text>
        <VStack spacing={3} align="stretch">
          <Menu closeOnSelect={false}>
            <MenuButton 
              as={Button} 
              rightIcon={<ChevronDownIcon />}
              width="100%"
              variant="outline"
              colorScheme={tagFilters.selectedTags.length > 0 ? "blue" : "gray"}
              borderRadius="md"
            >
              {tagFilters.selectedTags.length > 0 ? 
                `${tagFilters.selectedTags.length} selected` : 
                'Select Tags'}
            </MenuButton>
            <MenuList maxH="300px" overflowY="auto">
              {allTags.length > 0 ? (
                allTags.map((tag) => (
                  <MenuItem 
                    key={tag.id} 
                    onClick={() => handleTagSelect(tag)}
                    isDisabled={tagFilters.selectedTags.some(t => t.id === tag.id)}
                  >
                    <TagBadge tag={tag} />
                  </MenuItem>
                ))
              ) : (
                <MenuItem isDisabled>No tags available</MenuItem>
              )}
            </MenuList>
          </Menu>
          
          {tagFilters.selectedTags.length > 0 && (
            <HStack spacing={2}>
              <Select
                value={tagFilters.matchType}
                onChange={(e) => handleTagMatchTypeChange(e.target.value as 'any' | 'all')}
                flex="1"
                borderRadius="md"
              >
                <option value="any">Match Any Tag</option>
                <option value="all">Match All Tags</option>
              </Select>
              <Button
                colorScheme="red"
                variant="ghost"
                onClick={handleClearTagFilters}
              >
                Clear
              </Button>
            </HStack>
          )}
          
          {tagFilters.selectedTags.length > 0 && (
            <Flex mt={1} flexWrap="wrap" gap={2}>
              {tagFilters.selectedTags.map((tag) => (
                <TagBadge
                  key={tag.id}
                  tag={tag}
                  isRemovable
                  onRemove={() => handleTagRemove(tag.id)}
                />
              ))}
            </Flex>
          )}
        </VStack>
      </Box>
      
      {/* Active Filter Summary */}
      {hasActiveFilters && (
        <>
          <Divider />
          <Box>
            <Text fontWeight="semibold" mb={3}>Active Filters</Text>
            {renderActiveFilterBadges()}
          </Box>
        </>
      )}
    </VStack>
  );
  
  return (
    <Drawer
      isOpen={isOpen}
      placement="right"
      onClose={onClose}
      size={drawerSize}
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">
          <Flex align="center" gap={2}>
            <FiFilter />
            <Text>Filter Tasks</Text>
          </Flex>
        </DrawerHeader>

        <DrawerBody py={4}>
          {sidebarContent}
        </DrawerBody>

        <DrawerFooter borderTopWidth="1px">
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Apply Filters
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}; 