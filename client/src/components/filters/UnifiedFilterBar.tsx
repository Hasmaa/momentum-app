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
  Collapse,
  SlideFade,
  useDisclosure,
  Center,
  Avatar,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import {
  CloseIcon,
  CheckIcon,
  ChevronDownIcon,
  WarningIcon,
  TimeIcon,
  SettingsIcon,
  ChevronRightIcon,
} from '@chakra-ui/icons';
import { MdFilterAlt, MdFilterAltOff, MdPriorityHigh, MdLabelOutline } from 'react-icons/md';
import { FiTag, FiFilter, FiCheckCircle, FiClock, FiAlertTriangle } from 'react-icons/fi';
import { TagService } from '../../services/TagService';
import { Tag, TagFilters, TaskPriority, TaskStatus } from '../../types';
import { TagBadge } from '../tags/TagBadge';
import { motion, Transition } from 'framer-motion';

// Wrap ChakraUI components with motion
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

// Define transition types compatible with Chakra UI + framer-motion
const fadeInTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 }
};

// Define a type-safe transition helper
const getTransition = (delay: number = 0): Transition => ({
  ease: "easeOut",
  duration: 0.3,
  delay
});

const motionProps = (delay: number) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: getTransition(delay)
});

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
  const cardBgColor = useColorModeValue('white', 'gray.700');
  const shadowColor = useColorModeValue('rgba(0, 0, 0, 0.05)', 'rgba(0, 0, 0, 0.2)');
  
  // Responsive design
  const isMobile = useBreakpointValue({ base: true, md: false });
  const drawerSize = useBreakpointValue({ base: "full", md: "sm" });
  const placement = useBreakpointValue({ base: "bottom", md: "right" }) as "bottom" | "right";
  const buttonSize = useBreakpointValue({ base: "lg", md: "md" });
  
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
  
  // Get status icon
  const getStatusIcon = (status: StatusType) => {
    switch(status) {
      case 'pending':
        return <FiAlertTriangle color="orange" />;
      case 'in-progress':
        return <FiClock color="blue" />;
      case 'completed':
        return <FiCheckCircle color="green" />;
      default:
        return null;
    }
  };
  
  // Get priority icon and color
  const getPriorityInfo = (priority: PriorityType) => {
    // Use different icon colors based on the current theme for better contrast
    const lowColor = useColorModeValue("green.600", "green.500");
    const mediumColor = useColorModeValue("yellow.600", "yellow.500");
    const highColor = useColorModeValue("red.600", "red.500");
    
    switch(priority) {
      case 'low':
        return { icon: <WarningIcon color={lowColor} />, color: 'green' };
      case 'medium':
        return { icon: <WarningIcon color={mediumColor} />, color: 'yellow' };
      case 'high':
        return { icon: <WarningIcon color={highColor} />, color: 'red' };
      default:
        return { icon: null, color: 'gray' };
    }
  };
  
  // Render active filter badges
  const renderActiveFilterBadges = () => {
    if (!hasActiveFilters) return null;
    
    return (
      <MotionBox 
        mt={3}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Flex flexWrap="wrap" gap={2} alignItems="center">
          {/* Search Query Badge */}
          {searchQuery && (
            <MotionFlex
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <ChakraTag 
                size="md" 
                borderRadius="full" 
                variant="subtle" 
                colorScheme="blue"
                boxShadow={`0 1px 2px ${shadowColor}`}
              >
                <TagLabel>Search: {searchQuery}</TagLabel>
              </ChakraTag>
            </MotionFlex>
          )}
          
          {/* Status Filter Badges */}
          {!filterStatus.has('all') && Array.from(filterStatus).map((status: StatusType) => (
            <MotionFlex
              key={`status-${status}`}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <ChakraTag 
                size="md" 
                borderRadius="full" 
                variant="subtle" 
                colorScheme="blue"
                boxShadow={`0 1px 2px ${shadowColor}`}
              >
                <HStack spacing={1}>
                  {getStatusIcon(status)}
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
            </MotionFlex>
          ))}
          
          {/* Priority Filter Badges */}
          {!filterPriority.has('all') && Array.from(filterPriority).map((priority: PriorityType) => (
            <MotionFlex
              key={`priority-${priority}`}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <ChakraTag 
                size="md" 
                borderRadius="full" 
                variant="subtle" 
                colorScheme={getPriorityInfo(priority).color}
                boxShadow={`0 1px 2px ${shadowColor}`}
              >
                <HStack spacing={1}>
                  {getPriorityInfo(priority).icon}
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
            </MotionFlex>
          ))}
          
          {/* Tag Filter Badges */}
          {tagFilters.selectedTags.map((tag) => (
            <MotionFlex
              key={tag.id}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <TagBadge
                tag={tag}
                isRemovable
                onRemove={() => handleTagRemove(tag.id)}
              />
            </MotionFlex>
          ))}
          
          {/* Clear All Button */}
          {hasActiveFilters && (
            <MotionFlex
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                size="sm"
                leftIcon={<MdFilterAltOff />}
                colorScheme="red"
                variant="outline"
                onClick={onClearAllFilters}
                borderRadius="full"
                boxShadow={`0 1px 2px ${shadowColor}`}
              >
                Clear All
              </Button>
            </MotionFlex>
          )}
        </Flex>
      </MotionBox>
    );
  };
  
  // Main filter sidebar content
  const sidebarContent = (
    <VStack spacing={6} align="stretch">
      <Box>
        <MotionFlex
          justify="space-between" 
          align="center" 
          mb={4}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: "easeOut", duration: 0.3 }}
        >
          <Flex align="center">
            <Text fontWeight="bold" fontSize="xl" mr={2}>Filters</Text>
            {hasActiveFilters && (
              <Badge 
                colorScheme="blue" 
                fontSize="sm" 
                borderRadius="full" 
                px={2} 
                py={1}
                boxShadow={`0 1px 2px ${shadowColor}`}
              >
                {activeFilterCount} active
              </Badge>
            )}
          </Flex>
          {hasActiveFilters && (
            <Button
              size="sm"
              leftIcon={<MdFilterAltOff />}
              colorScheme="red"
              variant="outline"
              onClick={onClearAllFilters}
              borderRadius="full"
              boxShadow={`0 1px 2px ${shadowColor}`}
            >
              Clear All
            </Button>
          )}
        </MotionFlex>
      </Box>
      
      {/* Accordion Filter Sections */}
      <Accordion defaultIndex={[0]} allowMultiple>
        {/* Status Filter */}
        <MotionBox {...motionProps(0.1)}>
          <AccordionItem border="none" mb={4}>
            <Box 
              as="h2" 
              borderRadius="lg" 
              overflow="hidden"
              boxShadow={`0 2px 4px ${shadowColor}`}
              bg={cardBgColor}
            >
              <AccordionButton 
                py={3} 
                _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
              >
                <Flex align="center" flex="1">
                  <Avatar 
                    bg="blue.400" 
                    icon={<FiClock fontSize="1.2rem" />} 
                    size="sm" 
                    mr={3}
                  />
                  <Box flex="1" textAlign="left">
                    <Text fontWeight="semibold">Status</Text>
                    {!filterStatus.has('all') && (
                      <Text fontSize="xs" color={secondaryTextColor}>
                        {Array.from(filterStatus).join(', ')}
                      </Text>
                    )}
                  </Box>
                </Flex>
                <AccordionIcon />
              </AccordionButton>
            </Box>
            <AccordionPanel px={0} pt={4}>
              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                <Button
                  size={buttonSize}
                  height="60px"
                  variant={filterStatus.has('all') ? "solid" : "outline"}
                  colorScheme={filterStatus.has('all') ? "blue" : "gray"}
                  onClick={() => onStatusFilterChange('all')}
                  justifyContent="flex-start"
                  borderRadius="lg"
                  boxShadow={`0 1px 2px ${shadowColor}`}
                  transition="all 0.2s"
                  _hover={{ transform: "translateY(-1px)", boxShadow: `0 2px 3px ${shadowColor}` }}
                >
                  <Flex align="center" w="100%" justify="space-between">
                    <Text>All Statuses</Text>
                    {filterStatus.has('all') && <CheckIcon />}
                  </Flex>
                </Button>
                <Button
                  size={buttonSize}
                  height="60px"
                  variant={filterStatus.has('pending') ? "solid" : "outline"}
                  colorScheme={filterStatus.has('pending') ? "orange" : "gray"}
                  onClick={() => onStatusFilterChange('pending')}
                  justifyContent="flex-start"
                  leftIcon={<FiAlertTriangle size="24px" />}
                  borderRadius="lg"
                  boxShadow={`0 1px 2px ${shadowColor}`}
                  transition="all 0.2s"
                  _hover={{ transform: "translateY(-1px)", boxShadow: `0 2px 3px ${shadowColor}` }}
                >
                  <Flex align="center" w="100%" justify="space-between">
                    <Text>Pending</Text>
                    {filterStatus.has('pending') && <CheckIcon />}
                  </Flex>
                </Button>
                <Button
                  size={buttonSize}
                  height="60px"
                  variant={filterStatus.has('in-progress') ? "solid" : "outline"}
                  colorScheme={filterStatus.has('in-progress') ? "blue" : "gray"}
                  onClick={() => onStatusFilterChange('in-progress')}
                  justifyContent="flex-start"
                  leftIcon={<FiClock size="24px" />}
                  borderRadius="lg"
                  boxShadow={`0 1px 2px ${shadowColor}`}
                  transition="all 0.2s"
                  _hover={{ transform: "translateY(-1px)", boxShadow: `0 2px 3px ${shadowColor}` }}
                >
                  <Flex align="center" w="100%" justify="space-between">
                    <Text>In Progress</Text>
                    {filterStatus.has('in-progress') && <CheckIcon />}
                  </Flex>
                </Button>
                <Button
                  size={buttonSize}
                  height="60px"
                  variant={filterStatus.has('completed') ? "solid" : "outline"}
                  colorScheme={filterStatus.has('completed') ? "green" : "gray"}
                  onClick={() => onStatusFilterChange('completed')}
                  justifyContent="flex-start"
                  leftIcon={<FiCheckCircle size="24px" />}
                  borderRadius="lg"
                  boxShadow={`0 1px 2px ${shadowColor}`}
                  transition="all 0.2s"
                  _hover={{ transform: "translateY(-1px)", boxShadow: `0 2px 3px ${shadowColor}` }}
                >
                  <Flex align="center" w="100%" justify="space-between">
                    <Text>Completed</Text>
                    {filterStatus.has('completed') && <CheckIcon />}
                  </Flex>
                </Button>
              </SimpleGrid>
            </AccordionPanel>
          </AccordionItem>
        </MotionBox>
      
        {/* Priority Filter */}
        <MotionBox {...motionProps(0.2)}>
          <AccordionItem border="none" mb={4}>
            <Box 
              as="h2" 
              borderRadius="lg" 
              overflow="hidden"
              boxShadow={`0 2px 4px ${shadowColor}`}
              bg={cardBgColor}
            >
              <AccordionButton 
                py={3} 
                _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
              >
                <Flex align="center" flex="1">
                  <Avatar 
                    bg="red.400" 
                    icon={<MdPriorityHigh fontSize="1.2rem" />} 
                    size="sm" 
                    mr={3}
                  />
                  <Box flex="1" textAlign="left">
                    <Text fontWeight="semibold">Priority</Text>
                    {!filterPriority.has('all') && (
                      <Text fontSize="xs" color={secondaryTextColor}>
                        {Array.from(filterPriority).join(', ')}
                      </Text>
                    )}
                  </Box>
                </Flex>
                <AccordionIcon />
              </AccordionButton>
            </Box>
            <AccordionPanel px={0} pt={4}>
              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                <Button
                  size={buttonSize}
                  height="60px"
                  variant={filterPriority.has('all') ? "solid" : "outline"}
                  colorScheme={filterPriority.has('all') ? "blue" : "gray"}
                  onClick={() => onPriorityFilterChange('all')}
                  justifyContent="flex-start"
                  borderRadius="lg"
                  boxShadow={`0 1px 2px ${shadowColor}`}
                  transition="all 0.2s"
                  _hover={{ transform: "translateY(-1px)", boxShadow: `0 2px 3px ${shadowColor}` }}
                >
                  <Flex align="center" w="100%" justify="space-between">
                    <Text>All Priorities</Text>
                    {filterPriority.has('all') && <CheckIcon />}
                  </Flex>
                </Button>
                <Button
                  size={buttonSize}
                  height="60px"
                  variant={filterPriority.has('low') ? "solid" : "outline"}
                  colorScheme={filterPriority.has('low') ? "green" : "gray"}
                  onClick={() => onPriorityFilterChange('low')}
                  justifyContent="flex-start"
                  leftIcon={<WarningIcon color={useColorModeValue("green.600", "green.500")} boxSize="24px" />}
                  borderRadius="lg"
                  boxShadow={`0 1px 2px ${shadowColor}`}
                  transition="all 0.2s"
                  _hover={{ transform: "translateY(-1px)", boxShadow: `0 2px 3px ${shadowColor}` }}
                >
                  <Flex align="center" w="100%" justify="space-between">
                    <Text>Low</Text>
                    {filterPriority.has('low') && <CheckIcon />}
                  </Flex>
                </Button>
                <Button
                  size={buttonSize}
                  height="60px"
                  variant={filterPriority.has('medium') ? "solid" : "outline"}
                  colorScheme={filterPriority.has('medium') ? "yellow" : "gray"}
                  onClick={() => onPriorityFilterChange('medium')}
                  justifyContent="flex-start"
                  leftIcon={<WarningIcon color={useColorModeValue("yellow.600", "yellow.500")} boxSize="24px" />}
                  borderRadius="lg"
                  boxShadow={`0 1px 2px ${shadowColor}`}
                  transition="all 0.2s"
                  _hover={{ transform: "translateY(-1px)", boxShadow: `0 2px 3px ${shadowColor}` }}
                >
                  <Flex align="center" w="100%" justify="space-between">
                    <Text>Medium</Text>
                    {filterPriority.has('medium') && <CheckIcon />}
                  </Flex>
                </Button>
                <Button
                  size={buttonSize}
                  height="60px"
                  variant={filterPriority.has('high') ? "solid" : "outline"}
                  colorScheme={filterPriority.has('high') ? "red" : "gray"}
                  onClick={() => onPriorityFilterChange('high')}
                  justifyContent="flex-start"
                  leftIcon={<WarningIcon color={useColorModeValue("red.600", "red.500")} boxSize="24px" />}
                  borderRadius="lg"
                  boxShadow={`0 1px 2px ${shadowColor}`}
                  transition="all 0.2s"
                  _hover={{ transform: "translateY(-1px)", boxShadow: `0 2px 3px ${shadowColor}` }}
                >
                  <Flex align="center" w="100%" justify="space-between">
                    <Text>High</Text>
                    {filterPriority.has('high') && <CheckIcon />}
                  </Flex>
                </Button>
              </SimpleGrid>
            </AccordionPanel>
          </AccordionItem>
        </MotionBox>
      
        {/* Tag Filter */}
        <MotionBox {...motionProps(0.3)}>
          <AccordionItem border="none" mb={4}>
            <Box 
              as="h2" 
              borderRadius="lg" 
              overflow="hidden"
              boxShadow={`0 2px 4px ${shadowColor}`}
              bg={cardBgColor}
            >
              <AccordionButton 
                py={3} 
                _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
              >
                <Flex align="center" flex="1">
                  <Avatar 
                    bg="purple.400" 
                    icon={<MdLabelOutline fontSize="1.2rem" />} 
                    size="sm" 
                    mr={3}
                  />
                  <Box flex="1" textAlign="left">
                    <Text fontWeight="semibold">Tags</Text>
                    {tagFilters.selectedTags.length > 0 && (
                      <Text fontSize="xs" color={secondaryTextColor}>
                        {tagFilters.selectedTags.length} selected
                      </Text>
                    )}
                  </Box>
                </Flex>
                <AccordionIcon />
              </AccordionButton>
            </Box>
            <AccordionPanel px={0} pt={4}>
              <VStack spacing={3} align="stretch">
                <Menu closeOnSelect={false}>
                  <MenuButton 
                    as={Button} 
                    rightIcon={<ChevronDownIcon />}
                    width="100%"
                    size={buttonSize}
                    variant="outline"
                    colorScheme={tagFilters.selectedTags.length > 0 ? "purple" : "gray"}
                    borderRadius="lg"
                    boxShadow={`0 1px 2px ${shadowColor}`}
                    _hover={{ boxShadow: `0 2px 3px ${shadowColor}` }}
                  >
                    {tagFilters.selectedTags.length > 0 ? 
                      `${tagFilters.selectedTags.length} selected` : 
                      'Select Tags'}
                  </MenuButton>
                  <MenuList maxH="300px" overflowY="auto" boxShadow="md" borderRadius="lg">
                    {allTags.length > 0 ? (
                      allTags.map((tag) => (
                        <MenuItem 
                          key={tag.id} 
                          onClick={() => handleTagSelect(tag)}
                          isDisabled={tagFilters.selectedTags.some(t => t.id === tag.id)}
                          transition="all 0.2s"
                          _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
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
                  <HStack spacing={2} mt={2}>
                    <Select
                      value={tagFilters.matchType}
                      onChange={(e) => handleTagMatchTypeChange(e.target.value as 'any' | 'all')}
                      flex="1"
                      borderRadius="lg"
                      size={buttonSize}
                      boxShadow={`0 1px 2px ${shadowColor}`}
                    >
                      <option value="any">Match Any Tag</option>
                      <option value="all">Match All Tags</option>
                    </Select>
                    <Button
                      colorScheme="red"
                      variant="ghost"
                      onClick={handleClearTagFilters}
                      size={buttonSize}
                    >
                      Clear
                    </Button>
                  </HStack>
                )}
                
                {tagFilters.selectedTags.length > 0 && (
                  <Box 
                    mt={3} 
                    p={3} 
                    borderRadius="lg" 
                    borderWidth="1px"
                    borderColor={borderColor}
                    bg={useColorModeValue('gray.50', 'gray.700')}
                  >
                    <Text fontSize="sm" mb={2} fontWeight="medium">Selected Tags:</Text>
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
                  </Box>
                )}
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        </MotionBox>
      </Accordion>
      
      {/* Active Filter Summary */}
      {hasActiveFilters && (
        <MotionBox {...motionProps(0.4)}>
          <Box 
            p={4} 
            borderRadius="lg" 
            bg={useColorModeValue('blue.50', 'blue.900')}
            boxShadow={`0 2px 4px ${shadowColor}`}
          >
            <Text fontWeight="semibold" mb={3}>Active Filters</Text>
            {renderActiveFilterBadges()}
          </Box>
        </MotionBox>
      )}
    </VStack>
  );
  
  return (
    <Drawer
      isOpen={isOpen}
      placement={placement}
      onClose={onClose}
      size={drawerSize}
    >
      <DrawerOverlay backdropFilter="blur(1px)" />
      <DrawerContent
        borderTopRadius={placement === "bottom" ? "2xl" : 0}
        borderLeftRadius={placement === "right" ? "2xl" : 0}
        boxShadow="lg"
      >
        <DrawerCloseButton size="lg" />
        <DrawerHeader 
          borderBottomWidth="1px" 
          bg={useColorModeValue('blue.50', 'blue.900')}
          borderTopRadius={placement === "bottom" ? "2xl" : 0}
          borderLeftRadius={placement === "right" ? "2xl" : 0}
        >
          <Flex align="center" gap={2}>
            <Center 
              bg={accentColor} 
              borderRadius="full" 
              w="36px" 
              h="36px"
              boxShadow={`0 1px 2px ${shadowColor}`}
            >
              <FiFilter color="white" size="18px" />
            </Center>
            <Text fontSize="xl" fontWeight="bold">Filter Tasks</Text>
            {hasActiveFilters && (
              <Badge 
                colorScheme="blue" 
                fontSize="md" 
                borderRadius="full" 
                px={2} 
                py={1}
                boxShadow={`0 1px 2px ${shadowColor}`}
                ml={2}
              >
                {activeFilterCount}
              </Badge>
            )}
          </Flex>
        </DrawerHeader>

        <DrawerBody py={4} px={{ base: 3, md: 4 }}>
          {sidebarContent}
        </DrawerBody>

        <DrawerFooter 
          borderTopWidth="1px" 
          justifyContent="space-between"
          bg={useColorModeValue('gray.50', 'gray.700')}
        >
          {hasActiveFilters && (
            <Button 
              variant="outline" 
              colorScheme="red" 
              leftIcon={<MdFilterAltOff />}
              onClick={onClearAllFilters}
              boxShadow={`0 1px 2px ${shadowColor}`}
            >
              Clear Filters
            </Button>
          )}
          <Button 
            colorScheme="blue" 
            mr={3} 
            onClick={onClose}
            size="lg"
            boxShadow={`0 1px 2px ${shadowColor}`}
          >
            Apply Filters
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}; 