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
} from '@chakra-ui/icons';
import { MdLabel } from 'react-icons/md';
import { FaClock } from 'react-icons/fa';
import { TrophyIcon } from './AchievementIcon';

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
}) => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Flex justify="space-between" align="center" wrap={{ base: "wrap", md: "nowrap" }} gap={4}>
      {/* Logo/Title Section */}
      <HStack spacing={3} align="center">
        <Heading size="md" fontWeight="bold" letterSpacing="tight">
          Momentum
        </Heading>
        <Text fontSize="sm" color="gray.500" display={{ base: "none", md: "block" }}>
          Keep Your Progress Moving
        </Text>
      </HStack>

      {/* Action Buttons */}
      <HStack spacing={{ base: 1, md: 3 }} ml="auto" flexWrap="wrap" justify="flex-end">
        {/* Selection Mode Actions */}
        {isSelectMode && selectedTodos.size > 0 && (
          <HStack bg="blue.50" _dark={{ bg: 'blue.900' }} px={3} py={1} borderRadius="lg">
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
          </HStack>
        )}

        {/* Primary Actions */}
        <HStack spacing={2}>
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
            New Task
          </Button>

          <Tooltip label="Use template to create tasks" hasArrow>
            <Button
              size="sm"
              leftIcon={<RepeatIcon />}
              colorScheme="blue"
              variant="outline"
              onClick={onOpenTemplate}
              fontWeight="medium"
            >
              Template
            </Button>
          </Tooltip>
        </HStack>

        {/* Secondary Actions */}
        <HStack spacing={2}>
          <Tooltip label={`Switch to ${isListView ? 'board' : 'list'} view`} hasArrow>
            <IconButton
              aria-label={`Switch to ${isListView ? 'board' : 'list'} view`}
              icon={isListView ? <ViewIcon /> : <HamburgerIcon />}
              size="sm"
              variant="outline"
              onClick={onToggleView}
            />
          </Tooltip>

          <Tooltip label="Manage tags" hasArrow>
            <IconButton
              aria-label="Manage tags"
              icon={<MdLabel />}
              size="sm"
              colorScheme="teal"
              variant="outline"
              onClick={onOpenTagManager}
            />
          </Tooltip>

          <Tooltip label="View achievements" hasArrow>
            <IconButton
              aria-label="View achievements"
              size="sm"
              variant="outline"
              onClick={onOpenAchievements}
              position="relative"
              icon={
                <Box position="relative">
                  <Icon as={TrophyIcon} />
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

          <Tooltip label="Focus timer" hasArrow>
            <IconButton
              aria-label="Pomodoro timer"
              icon={<Icon as={FaClock} />}
              size="sm"
              colorScheme="purple"
              variant="outline"
              onClick={onOpenPomodoro}
            />
          </Tooltip>
        </HStack>

        {/* Utility Actions */}
        <HStack spacing={2}>
          <Tooltip label="Keyboard shortcuts" hasArrow>
            <IconButton
              aria-label="Keyboard shortcuts"
              icon={<QuestionIcon />}
              size="sm"
              variant="outline"
              onClick={onOpenShortcuts}
            />
          </Tooltip>

          <Tooltip label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`} hasArrow>
            <IconButton
              aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
              icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              size="sm"
              variant="outline"
              onClick={toggleColorMode}
            />
          </Tooltip>
        </HStack>
      </HStack>
    </Flex>
  );
}; 