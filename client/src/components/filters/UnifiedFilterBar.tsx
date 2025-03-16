import React, { useState, useEffect } from 'react';
import {
  Box,
  HStack,
  VStack,
  Text,
  Flex,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Input,
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
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Select,
  ButtonGroup,
  Tooltip,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverFooter,
  Portal,
  Badge,
  SimpleGrid
} from '@chakra-ui/react';
import {
  SearchIcon,
  CloseIcon,
  CheckIcon,
  ChevronDownIcon,
  SmallCloseIcon,
  WarningIcon,
  TimeIcon,
  HamburgerIcon,
  SettingsIcon
} from '@chakra-ui/icons';
import { MdFilterAlt, MdFilterAltOff, MdOutlineLabel } from 'react-icons/md';
import { FiFilter, FiTag, FiSearch, FiX } from 'react-icons/fi';
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
  
  // Search filter
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  
  // Tag filter
  tagFilters: TagFilters;
  onTagFiltersChange: (filters: TagFilters) => void;
  
  // Clear all filters
  onClearAllFilters: () => void;
}

export const UnifiedFilterBar: React.FC<UnifiedFilterProps> = ({
  filterStatus,
  onStatusFilterChange,
  filterPriority,
  onPriorityFilterChange,
  searchQuery,
  onSearchQueryChange,
  tagFilters,
  onTagFiltersChange,
  onClearAllFilters
}) => {
  // State
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [isCompact, setIsCompact] = useState(false);
  
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
  const displayLabels = useBreakpointValue({ base: false, md: true });
  const isMobile = useBreakpointValue({ base: true, md: false });
  
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
              <TagCloseButton onClick={() => onSearchQueryChange('')} />
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
  
  // Render the compact view
  const renderCompactView = () => {
    return (
      <Popover placement="bottom-start">
        <PopoverTrigger>
          <Button 
            rightIcon={<FiFilter />} 
            colorScheme={hasActiveFilters ? "blue" : "gray"}
            variant={hasActiveFilters ? "solid" : "outline"}
            borderRadius="full"
          >
            Filters
            {activeFilterCount > 0 && (
              <Badge ml={2} borderRadius="full" colorScheme="blue">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <Portal>
          <PopoverContent width="300px" maxWidth="95vw">
            <PopoverBody p={4}>
              <VStack spacing={4} align="stretch">
                {/* Search */}
                <Box>
                  <Text fontWeight="medium" mb={2}>Search</Text>
                  <InputGroup size="md">
                    <InputLeftElement pointerEvents="none">
                      <SearchIcon color={searchQuery ? accentColor : secondaryTextColor} />
                    </InputLeftElement>
                    <Input
                      placeholder="Search tasks..."
                      value={searchQuery}
                      onChange={(e) => onSearchQueryChange(e.target.value)}
                      borderRadius="md"
                    />
                    {searchQuery && (
                      <InputRightElement>
                        <IconButton
                          aria-label="Clear search"
                          icon={<CloseIcon />}
                          size="sm"
                          variant="ghost"
                          onClick={() => onSearchQueryChange('')}
                        />
                      </InputRightElement>
                    )}
                  </InputGroup>
                </Box>
                
                {/* Status Filter */}
                <Box>
                  <Text fontWeight="medium" mb={2}>Status</Text>
                  <SimpleGrid columns={2} spacing={2}>
                    <Button
                      size="sm"
                      variant={filterStatus.has('all') ? "solid" : "outline"}
                      colorScheme={filterStatus.has('all') ? "blue" : "gray"}
                      onClick={() => onStatusFilterChange('all')}
                      justifyContent="flex-start"
                    >
                      All
                    </Button>
                    <Button
                      size="sm"
                      variant={filterStatus.has('pending') ? "solid" : "outline"}
                      colorScheme={filterStatus.has('pending') ? "blue" : "gray"}
                      onClick={() => onStatusFilterChange('pending')}
                      justifyContent="flex-start"
                      leftIcon={<WarningIcon />}
                    >
                      Pending
                    </Button>
                    <Button
                      size="sm"
                      variant={filterStatus.has('in-progress') ? "solid" : "outline"}
                      colorScheme={filterStatus.has('in-progress') ? "blue" : "gray"}
                      onClick={() => onStatusFilterChange('in-progress')}
                      justifyContent="flex-start"
                      leftIcon={<TimeIcon />}
                    >
                      In Progress
                    </Button>
                    <Button
                      size="sm"
                      variant={filterStatus.has('completed') ? "solid" : "outline"}
                      colorScheme={filterStatus.has('completed') ? "blue" : "gray"}
                      onClick={() => onStatusFilterChange('completed')}
                      justifyContent="flex-start"
                      leftIcon={<CheckIcon />}
                    >
                      Completed
                    </Button>
                  </SimpleGrid>
                </Box>
                
                {/* Priority Filter */}
                <Box>
                  <Text fontWeight="medium" mb={2}>Priority</Text>
                  <SimpleGrid columns={2} spacing={2}>
                    <Button
                      size="sm"
                      variant={filterPriority.has('all') ? "solid" : "outline"}
                      colorScheme={filterPriority.has('all') ? "blue" : "gray"}
                      onClick={() => onPriorityFilterChange('all')}
                      justifyContent="flex-start"
                    >
                      All
                    </Button>
                    <Button
                      size="sm"
                      variant={filterPriority.has('low') ? "solid" : "outline"}
                      colorScheme={filterPriority.has('low') ? "blue" : "gray"}
                      onClick={() => onPriorityFilterChange('low')}
                      justifyContent="flex-start"
                      leftIcon={<WarningIcon color="green.500" />}
                    >
                      Low
                    </Button>
                    <Button
                      size="sm"
                      variant={filterPriority.has('medium') ? "solid" : "outline"}
                      colorScheme={filterPriority.has('medium') ? "blue" : "gray"}
                      onClick={() => onPriorityFilterChange('medium')}
                      justifyContent="flex-start"
                      leftIcon={<WarningIcon color="yellow.500" />}
                    >
                      Medium
                    </Button>
                    <Button
                      size="sm"
                      variant={filterPriority.has('high') ? "solid" : "outline"}
                      colorScheme={filterPriority.has('high') ? "blue" : "gray"}
                      onClick={() => onPriorityFilterChange('high')}
                      justifyContent="flex-start"
                      leftIcon={<WarningIcon color="red.500" />}
                    >
                      High
                    </Button>
                  </SimpleGrid>
                </Box>
                
                {/* Tag Filter */}
                <Box>
                  <Text fontWeight="medium" mb={2}>Tags</Text>
                  <VStack spacing={2} align="stretch">
                    <Menu closeOnSelect={false}>
                      <MenuButton 
                        as={Button} 
                        rightIcon={<ChevronDownIcon />}
                        size="sm"
                        width="100%"
                        variant="outline"
                        colorScheme={tagFilters.selectedTags.length > 0 ? "blue" : "gray"}
                      >
                        {tagFilters.selectedTags.length > 0 ? 
                          `${tagFilters.selectedTags.length} selected` : 
                          'Select Tags'}
                      </MenuButton>
                      <MenuList maxH="200px" overflowY="auto">
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
                          size="sm"
                          flex="1"
                        >
                          <option value="any">Match Any Tag</option>
                          <option value="all">Match All Tags</option>
                        </Select>
                        <Button
                          size="sm"
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
              </VStack>
            </PopoverBody>
            <PopoverFooter
              border="0"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              pb={4}
              px={4}
            >
              <Button 
                size="sm"
                colorScheme="gray" 
                onClick={() => setIsCompact(false)}
              >
                Expand Filters
              </Button>
              
              <Button 
                size="sm"
                colorScheme="red" 
                variant="outline"
                onClick={onClearAllFilters}
                isDisabled={!hasActiveFilters}
              >
                Clear All
              </Button>
            </PopoverFooter>
          </PopoverContent>
        </Portal>
      </Popover>
    );
  };
  
  // Render the expanded view
  const renderExpandedView = () => {
    return (
      <Box>
        <Flex 
          justifyContent="space-between" 
          alignItems="center" 
          flexWrap={{ base: "wrap", md: "nowrap" }}
          gap={3}
        >
          {/* Search Input */}
          <InputGroup size="md" maxW={{ base: "100%", md: "280px" }}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color={searchQuery ? accentColor : secondaryTextColor} />
            </InputLeftElement>
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              borderRadius="full"
              borderWidth="2px"
              borderColor={searchQuery ? 'blue.500' : 'transparent'}
              _hover={{
                borderColor: searchQuery ? 'blue.600' : 'gray.300'
              }}
              _focus={{
                borderColor: 'blue.500'
              }}
            />
            {searchQuery && (
              <InputRightElement>
                <IconButton
                  aria-label="Clear search"
                  icon={<CloseIcon />}
                  size="sm"
                  variant="ghost"
                  colorScheme="gray"
                  onClick={() => onSearchQueryChange('')}
                />
              </InputRightElement>
            )}
          </InputGroup>
          
          <HStack spacing={3} flexWrap="wrap" justifyContent="flex-end">
            {/* Status Filter */}
            <Menu closeOnSelect={false}>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                variant="outline"
                colorScheme={!filterStatus.has('all') ? 'blue' : 'gray'}
                borderRadius="full"
                px={6}
                fontWeight={!filterStatus.has('all') ? 'bold' : 'normal'}
              >
                <HStack spacing={2}>
                  <HamburgerIcon />
                  <Text>Status</Text>
                  {!filterStatus.has('all') && (
                    <Badge colorScheme="blue" borderRadius="full">
                      {filterStatus.size}
                    </Badge>
                  )}
                </HStack>
              </MenuButton>
              <MenuList>
                <MenuItem
                  onClick={() => onStatusFilterChange('all')}
                  closeOnSelect={false}
                >
                  <Flex justify="space-between" align="center" width="100%">
                    <Text>All Status</Text>
                    {filterStatus.has('all') && <CheckIcon color="blue.500" />}
                  </Flex>
                </MenuItem>
                <MenuItem
                  onClick={() => onStatusFilterChange('pending')}
                  closeOnSelect={false}
                >
                  <Flex justify="space-between" align="center" width="100%">
                    <HStack>
                      <WarningIcon color="gray.500" />
                      <Text>Pending</Text>
                    </HStack>
                    {filterStatus.has('pending') && <CheckIcon color="blue.500" />}
                  </Flex>
                </MenuItem>
                <MenuItem
                  onClick={() => onStatusFilterChange('in-progress')}
                  closeOnSelect={false}
                >
                  <Flex justify="space-between" align="center" width="100%">
                    <HStack>
                      <TimeIcon color="blue.500" />
                      <Text>In Progress</Text>
                    </HStack>
                    {filterStatus.has('in-progress') && <CheckIcon color="blue.500" />}
                  </Flex>
                </MenuItem>
                <MenuItem
                  onClick={() => onStatusFilterChange('completed')}
                  closeOnSelect={false}
                >
                  <Flex justify="space-between" align="center" width="100%">
                    <HStack>
                      <CheckIcon color="green.500" />
                      <Text>Completed</Text>
                    </HStack>
                    {filterStatus.has('completed') && <CheckIcon color="blue.500" />}
                  </Flex>
                </MenuItem>
              </MenuList>
            </Menu>
            
            {/* Priority Filter */}
            <Menu closeOnSelect={false}>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                variant="outline"
                colorScheme={!filterPriority.has('all') ? 'blue' : 'gray'}
                borderRadius="full"
                px={6}
                fontWeight={!filterPriority.has('all') ? 'bold' : 'normal'}
              >
                <HStack spacing={2}>
                  <WarningIcon />
                  <Text>Priority</Text>
                  {!filterPriority.has('all') && (
                    <Badge colorScheme="blue" borderRadius="full">
                      {filterPriority.size}
                    </Badge>
                  )}
                </HStack>
              </MenuButton>
              <MenuList>
                <MenuItem
                  onClick={() => onPriorityFilterChange('all')}
                  closeOnSelect={false}
                >
                  <Flex justify="space-between" align="center" width="100%">
                    <Text>All Priority</Text>
                    {filterPriority.has('all') && <CheckIcon color="blue.500" />}
                  </Flex>
                </MenuItem>
                <MenuItem
                  onClick={() => onPriorityFilterChange('low')}
                  closeOnSelect={false}
                >
                  <Flex justify="space-between" align="center" width="100%">
                    <HStack>
                      <WarningIcon color="green.500" />
                      <Text>Low</Text>
                    </HStack>
                    {filterPriority.has('low') && <CheckIcon color="blue.500" />}
                  </Flex>
                </MenuItem>
                <MenuItem
                  onClick={() => onPriorityFilterChange('medium')}
                  closeOnSelect={false}
                >
                  <Flex justify="space-between" align="center" width="100%">
                    <HStack>
                      <WarningIcon color="yellow.500" />
                      <Text>Medium</Text>
                    </HStack>
                    {filterPriority.has('medium') && <CheckIcon color="blue.500" />}
                  </Flex>
                </MenuItem>
                <MenuItem
                  onClick={() => onPriorityFilterChange('high')}
                  closeOnSelect={false}
                >
                  <Flex justify="space-between" align="center" width="100%">
                    <HStack>
                      <WarningIcon color="red.500" />
                      <Text>High</Text>
                    </HStack>
                    {filterPriority.has('high') && <CheckIcon color="blue.500" />}
                  </Flex>
                </MenuItem>
              </MenuList>
            </Menu>
            
            {/* Tag Filter */}
            <Menu closeOnSelect={false}>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                variant="outline"
                colorScheme={tagFilters.selectedTags.length > 0 ? 'blue' : 'gray'}
                borderRadius="full"
                px={6}
                fontWeight={tagFilters.selectedTags.length > 0 ? 'bold' : 'normal'}
              >
                <HStack spacing={2}>
                  <FiTag />
                  <Text>Tags</Text>
                  {tagFilters.selectedTags.length > 0 && (
                    <Badge colorScheme="blue" borderRadius="full">
                      {tagFilters.selectedTags.length}
                    </Badge>
                  )}
                </HStack>
              </MenuButton>
              <MenuList>
                {allTags.length > 0 ? (
                  <>
                    {allTags.map((tag) => (
                      <MenuItem 
                        key={tag.id} 
                        onClick={() => handleTagSelect(tag)}
                        closeOnSelect={false}
                        isDisabled={tagFilters.selectedTags.some(t => t.id === tag.id)}
                      >
                        <Flex justify="space-between" align="center" width="100%">
                          <TagBadge tag={tag} />
                          {tagFilters.selectedTags.some(t => t.id === tag.id) && <CheckIcon color="blue.500" />}
                        </Flex>
                      </MenuItem>
                    ))}
                    
                    {tagFilters.selectedTags.length > 0 && (
                      <>
                        <Divider my={2} />
                        <MenuItem closeOnSelect={false}>
                          <Flex justify="space-between" align="center" width="100%">
                            <Select
                              value={tagFilters.matchType}
                              onChange={(e) => handleTagMatchTypeChange(e.target.value as 'any' | 'all')}
                              size="sm"
                              width="full"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <option value="any">Match Any Tag</option>
                              <option value="all">Match All Tags</option>
                            </Select>
                          </Flex>
                        </MenuItem>
                        <MenuItem onClick={handleClearTagFilters}>
                          Clear Tag Filters
                        </MenuItem>
                      </>
                    )}
                  </>
                ) : (
                  <MenuItem isDisabled>No tags available</MenuItem>
                )}
              </MenuList>
            </Menu>
            
            {hasActiveFilters && (
              <Tooltip label="Clear all filters" hasArrow>
                <IconButton
                  aria-label="Clear all filters"
                  icon={<MdFilterAltOff />}
                  colorScheme="red"
                  variant="outline"
                  onClick={onClearAllFilters}
                  borderRadius="full"
                />
              </Tooltip>
            )}
            
            {/* Toggle Compact Mode */}
            <Tooltip label="Compact filter view" hasArrow>
              <IconButton
                aria-label="Compact filter view"
                icon={<SettingsIcon />}
                variant="outline"
                onClick={() => setIsCompact(true)}
                borderRadius="full"
              />
            </Tooltip>
          </HStack>
        </Flex>
        
        {/* Active Filter Badges */}
        {renderActiveFilterBadges()}
      </Box>
    );
  };
  
  return (
    <Box 
      p={4} 
      borderWidth="1px" 
      borderRadius="lg" 
      bg={bgColor} 
      borderColor={borderColor}
      boxShadow="sm"
      transition="all 0.2s"
    >
      {isCompact ? renderCompactView() : renderExpandedView()}
    </Box>
  );
}; 