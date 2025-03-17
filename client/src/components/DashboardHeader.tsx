import React from 'react';
import {
  Box,
  Button,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  Tooltip,
  useColorMode,
  Icon,
  MenuDivider,
  Flex,
  Heading,
  Divider,
  useBreakpointValue,
  useColorModeValue,
  InputGroup,
  InputLeftElement,
  Input,
  InputRightElement,
  Badge,
} from '@chakra-ui/react';
import {
  AddIcon,
  ChevronDownIcon,
  CloseIcon,
  DeleteIcon,
  HamburgerIcon,
  MoonIcon,
  QuestionIcon,
  RepeatIcon,
  SettingsIcon,
  SunIcon,
  TimeIcon,
  ViewIcon,
  WarningIcon,
  CheckIcon,
  SearchIcon,
} from '@chakra-ui/icons';
import { MdLabel } from 'react-icons/md';
import { FaClock } from 'react-icons/fa';
import { FiFilter } from 'react-icons/fi';
import { TrophyIcon, MedalIcon } from './AchievementIcon';

interface DashboardHeaderProps {
  selectedTodos: Set<string>;
  isSelectMode: boolean;
  onClearSelection: () => void;
  onCreateTask: () => void;
  onOpenTemplate: () => void;
  onToggleView: () => void;
  isListView: boolean;
  onOpenTagManager: () => void;
  onOpenAchievements: () => void;
  onOpenPomodoro: () => void;
  onOpenShortcuts: () => void;
  onBulkStatusChange: (status: 'pending' | 'in-progress' | 'completed') => void;
  onBulkCapitalize: () => void;
  onBulkDelete: () => void;
  recentlyUnlocked: boolean;
  pomodoroActive?: boolean;
  pomodoroTimeRemaining?: string;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onToggleFilterSidebar: () => void;
  hasActiveFilters?: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  selectedTodos,
  isSelectMode,
  onClearSelection,
  onCreateTask,
  onOpenTemplate,
  onToggleView,
  isListView,
  onOpenTagManager,
  onOpenAchievements,
  onOpenPomodoro,
  onOpenShortcuts,
  onBulkStatusChange,
  onBulkCapitalize,
  onBulkDelete,
  recentlyUnlocked,
  pomodoroActive = false,
  pomodoroTimeRemaining = '',
  searchQuery = '',
  onSearchQueryChange,
  onToggleFilterSidebar,
  hasActiveFilters = false,
}) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const buttonGroupBg = useColorModeValue('gray.50', 'gray.700');
  const dividerColor = useColorModeValue('gray.200', 'gray.600');
  const selectionBg = useColorModeValue('blue.50', 'blue.900');
  const accentColor = useColorModeValue('blue.500', 'blue.400');
  const secondaryTextColor = useColorModeValue('gray.500', 'gray.400');

  const ButtonGroup = ({ children }: { children: React.ReactNode }) => (
    <HStack
      spacing={2}
      bg={buttonGroupBg}
      p={1}
      borderRadius="lg"
      transition="all 0.2s"
      _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
    >
      {children}
    </HStack>
  );

  return (
    <Flex 
      justify="space-between" 
      align="center" 
      wrap={{ base: "wrap", md: "nowrap" }} 
      gap={4}
    >
      {/* Search Bar - Make it bigger and match styling with other elements */}
      <InputGroup 
        size="md" 
        maxW={{ base: "100%", md: "350px" }} 
        mb={{ base: 3, md: 0 }}
        bg={buttonGroupBg}
        borderRadius="lg"
        p={1}
      >
        <InputLeftElement pointerEvents="none">
          <SearchIcon color={searchQuery ? accentColor : secondaryTextColor} />
        </InputLeftElement>
        <Input
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          borderRadius="md"
          bg="transparent"
          border="none"
          _focus={{
            boxShadow: "none",
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

      {/* Action Buttons */}
      <Flex 
        gap={3} 
        align="center" 
        justify="flex-end"
        flexWrap="wrap"
      >
        {/* Selection Mode Actions */}
        {isSelectMode && selectedTodos.size > 0 && (
          <Box
            bg={selectionBg}
            px={3}
            py={1}
            borderRadius="lg"
            display="flex"
            alignItems="center"
            gap={2}
            flexGrow={1}
            maxW={{ base: "100%", md: "auto" }}
          >
            <Text fontSize="sm" fontWeight="medium">
              {selectedTodos.size} selected
            </Text>
            <Menu>
              <MenuButton
                as={Button}
                size="sm"
                colorScheme="blue"
                variant="ghost"
                rightIcon={<ChevronDownIcon />}
              >
                Actions
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => onBulkStatusChange('pending')}>
                  <HStack>
                    <Icon as={WarningIcon} color="gray.500" />
                    <Text>Mark as Pending</Text>
                  </HStack>
                </MenuItem>
                <MenuItem onClick={() => onBulkStatusChange('in-progress')}>
                  <HStack>
                    <Icon as={TimeIcon} color="blue.500" />
                    <Text>Mark as In Progress</Text>
                  </HStack>
                </MenuItem>
                <MenuItem onClick={() => onBulkStatusChange('completed')}>
                  <HStack>
                    <Icon as={CheckIcon} color="green.500" />
                    <Text>Mark as Completed</Text>
                  </HStack>
                </MenuItem>
                <MenuDivider />
                <MenuItem onClick={onBulkCapitalize}>
                  <HStack>
                    <Icon as={SettingsIcon} />
                    <Text>Title Case</Text>
                  </HStack>
                </MenuItem>
                <MenuDivider />
                <MenuItem onClick={onBulkDelete}>
                  <HStack>
                    <Icon as={DeleteIcon} color="red.500" />
                    <Text color="red.500">Delete Selected</Text>
                  </HStack>
                </MenuItem>
              </MenuList>
            </Menu>
            <IconButton
              aria-label="Clear selection"
              icon={<CloseIcon />}
              size="xs"
              variant="ghost"
              onClick={onClearSelection}
            />
          </Box>
        )}

        {/* Primary Actions */}
        <ButtonGroup>
          <Tooltip label="Create new task (⌘N)" hasArrow>
            <Button
              size="sm"
              leftIcon={<AddIcon />}
              colorScheme="blue"
              onClick={onCreateTask}
              fontWeight="medium"
              _hover={{
                transform: 'translateY(-1px)',
                boxShadow: 'sm'
              }}
            >
              {isMobile ? <AddIcon /> : "New Task"}
            </Button>
          </Tooltip>

          <Tooltip label="Use template (⌘T)" hasArrow>
            <Button
              size="sm"
              leftIcon={<RepeatIcon />}
              colorScheme="blue"
              variant="ghost"
              onClick={onOpenTemplate}
              fontWeight="medium"
            >
              {isMobile ? <RepeatIcon /> : "Template"}
            </Button>
          </Tooltip>
        </ButtonGroup>

        {!isMobile && <Divider orientation="vertical" h="20px" borderColor={dividerColor} />}

        {/* Secondary Actions */}
        <ButtonGroup>
          <Tooltip label="Filters" hasArrow>
            <Box position="relative">
              <IconButton
                aria-label="Toggle filter sidebar"
                icon={<Icon as={FiFilter} />}
                size="sm"
                colorScheme={hasActiveFilters ? "blue" : "gray"}
                variant={hasActiveFilters ? "solid" : "ghost"}
                onClick={onToggleFilterSidebar}
              />
              {hasActiveFilters && (
                <Badge 
                  position="absolute" 
                  top="-2px" 
                  right="-2px" 
                  colorScheme="blue" 
                  borderRadius="full" 
                  boxSize="8px"
                />
              )}
            </Box>
          </Tooltip>

          <Tooltip label={`Switch to ${isListView ? 'board' : 'list'} view (⌘/)`} hasArrow>
            <IconButton
              aria-label={`Switch to ${isListView ? 'board' : 'list'} view`}
              icon={isListView ? <ViewIcon /> : <HamburgerIcon />}
              size="sm"
              variant="ghost"
              onClick={onToggleView}
            />
          </Tooltip>

          <Tooltip label="Manage tags" hasArrow>
            <IconButton
              aria-label="Manage tags"
              icon={<MdLabel />}
              size="sm"
              colorScheme="teal"
              variant="ghost"
              onClick={onOpenTagManager}
            />
          </Tooltip>

          <Tooltip label="View achievements" hasArrow>
            <IconButton
              aria-label="View achievements"
              size="sm"
              variant="ghost"
              onClick={onOpenAchievements}
              position="relative"
              icon={
                <Box position="relative">
                  <Icon as={MedalIcon} color={useColorModeValue('blue.300', 'yellow.400')} />
                  {recentlyUnlocked && (
                    <Box
                      position="absolute"
                      top="-2px"
                      right="-2px"
                      w="8px"
                      h="8px"
                      bg="green.400"
                      borderRadius="full"
                    />
                  )}
                </Box>
              }
            />
          </Tooltip>

          <Tooltip label={pomodoroActive ? `Focus timer: ${pomodoroTimeRemaining}` : "Focus timer"} hasArrow>
            {pomodoroActive ? (
              <Button
                aria-label="Pomodoro timer"
                size="sm"
                colorScheme="purple"
                variant="ghost"
                onClick={onOpenPomodoro}
                leftIcon={<Icon as={FaClock} color="purple.400" />}
                fontWeight="medium"
                position="relative"
              >
                <Text color="purple.400">{pomodoroTimeRemaining}</Text>
                <Box
                  position="absolute"
                  top="-2px"
                  right="-2px"
                  w="8px"
                  h="8px"
                  bg="purple.400"
                  borderRadius="full"
                  animation="pulse 2s infinite"
                  sx={{
                    "@keyframes pulse": {
                      "0%": { opacity: 0.6, transform: "scale(0.9)" },
                      "50%": { opacity: 1, transform: "scale(1.1)" },
                      "100%": { opacity: 0.6, transform: "scale(0.9)" }
                    }
                  }}
                />
              </Button>
            ) : (
              <IconButton
                aria-label="Pomodoro timer"
                icon={<Icon as={FaClock} />}
                size="sm"
                colorScheme="purple"
                variant="ghost"
                onClick={onOpenPomodoro}
              />
            )}
          </Tooltip>
        </ButtonGroup>

        {!isMobile && <Divider orientation="vertical" h="20px" borderColor={dividerColor} />}

        {/* Utility Actions */}
        <ButtonGroup>
          <Tooltip label="Keyboard shortcuts (?)" hasArrow>
            <IconButton
              aria-label="Keyboard shortcuts"
              icon={<QuestionIcon />}
              size="sm"
              variant="ghost"
              onClick={onOpenShortcuts}
            />
          </Tooltip>

          <Tooltip label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`} hasArrow>
            <IconButton
              aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
              icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              size="sm"
              variant="ghost"
              onClick={toggleColorMode}
            />
          </Tooltip>
        </ButtonGroup>
      </Flex>
    </Flex>
  );
}; 