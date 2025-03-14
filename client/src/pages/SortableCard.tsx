import { HamburgerIcon, ChevronDownIcon, WarningIcon, TimeIcon, CheckIcon, EditIcon, DeleteIcon, CalendarIcon } from '@chakra-ui/icons';
import { useColorModeValue, Box, useMergeRefs, Checkbox, Spinner, CardBody, VStack, Flex, Icon, Heading, HStack, Menu, Tooltip, MenuButton, IconButton, Portal, MenuList, MenuItem, Text, Tag, TagLeftIcon, TagLabel } from '@chakra-ui/react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { isPast, isWithinInterval, addDays, format } from 'date-fns';
import React from 'react';
import { Task } from '../types';
import { MotionCard } from './Dashboard';
import { getStatusIcon } from './utils';
import { FaClock } from 'react-icons/fa';

// Modify the SortableCard component to properly handle refs
export const SortableCard = React.forwardRef<HTMLDivElement, {
  todo: Task;
  isDragging?: boolean;
  isUpdating?: boolean;
  onEdit: (todo: Task) => void;
  onDelete: (todo: Task) => void;
  onStatusChange: (id: string, newStatus: Task['status']) => void;
  isSelected?: boolean;
  isSelectMode?: boolean;
  onToggleSelect?: (id: string) => void;
}>(({ todo, isDragging, isUpdating, onEdit, onDelete, onStatusChange, isSelected = false, isSelectMode = false, onToggleSelect }, ref) => {
  const {
    attributes, listeners, setNodeRef, transform, transition,
  } = useSortable({
    id: todo.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const statusColors = {
    pending: 'gray',
    'in-progress': 'blue',
    completed: 'green'
  };

  const priorityColors = {
    low: 'green',
    medium: 'yellow',
    high: 'red'
  };

  const cardBg = useColorModeValue('white', 'gray.800');
  const descriptionColor = useColorModeValue('gray.600', 'gray.300');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const dragHandleColor = useColorModeValue('gray.400', 'gray.500');

  const isOverdue = isPast(new Date(todo.dueDate));
  const isDueSoon = isWithinInterval(new Date(todo.dueDate), {
    start: new Date(),
    end: addDays(new Date(), 2)
  });

  return (
    <Box
      ref={useMergeRefs(setNodeRef, ref)}
      style={style}
      {...attributes}
      role="article"
      aria-label={`Task: ${todo.title}`}
      id={`task-${todo.id}`}
    >
      <MotionCard
        layout
        bg={cardBg}
        boxShadow={isDragging ? 'lg' : 'sm'}
        borderRadius="xl"
        mb={4}
        opacity={isDragging ? 0.4 : 1}
        borderWidth="1px"
        borderColor={isSelected ? 'blue.500' : borderColor}
        position="relative"
        overflow="visible"
        _hover={{
          bg: hoverBg,
          transform: 'translateY(-2px)',
          boxShadow: 'md',
          '.drag-handle': {
            opacity: 1
          }
        }}
        animate={{
          scale: isDragging ? 0.95 : 1,
        }}
        transition={{
          type: "spring",
          bounce: 0.2,
          duration: 0.6
        }}
      >
        {/* Add selection checkbox */}
        {isSelectMode && (
          <Box
            position="absolute"
            left="-8px"
            top="50%"
            transform="translateY(-50%)"
            zIndex={1}
          >
            <Checkbox
              isChecked={isSelected}
              onChange={() => onToggleSelect?.(todo.id)}
              colorScheme="blue"
              size="lg"
              borderColor="blue.500" />
          </Box>
        )}

        {/* Status Indicator */}
        <Box
          position="absolute"
          top={0}
          left={0}
          bottom={0}
          width="4px"
          borderTopLeftRadius="xl"
          borderBottomLeftRadius="xl"
          bg={`${statusColors[todo.status]}.400`}
          transition="all 0.2s" />

        {/* Add loading overlay */}
        {isUpdating && (
          <Box
            position="absolute"
            inset={0}
            borderRadius="xl"
            bg="blackAlpha.50"
            display="flex"
            alignItems="center"
            justifyContent="center"
            backdropFilter="blur(1px)"
            zIndex={1}
          >
            <Spinner size="sm" color={`${statusColors[todo.status]}.400`} />
          </Box>
        )}

        <CardBody py={4} pl={6}>
          <VStack spacing={4} align="stretch">
            <Flex direction="column" gap={2}>
              <Flex
                justify="space-between"
                align="flex-start"
                gap={4}
              >
                <Flex flex="1" align="center" gap={3} className="drag-handle" {...listeners}>
                  <Icon
                    as={HamburgerIcon}
                    color={dragHandleColor}
                    opacity={0.5}
                    transition="all 0.2s"
                    cursor="grab"
                    _active={{ cursor: 'grabbing' }} />
                  <Heading
                    size="sm"
                    noOfLines={2}
                    wordBreak="break-word"
                    lineHeight="tall"
                    cursor="grab"
                    _hover={{ color: 'blue.500' }}
                    _active={{ cursor: 'grabbing' }}
                  >
                    {todo.title}
                  </Heading>
                </Flex>
                <HStack spacing={2} flexShrink={0}>
                  <Menu>
                    <Tooltip
                      label={`Click to change status. Current: ${todo.status.replace('-', ' ')}`}
                      placement="top"
                      hasArrow
                    >
                      <MenuButton
                        as={IconButton}
                        icon={<HStack spacing={2} padding={2}>
                          <Icon
                            as={getStatusIcon(todo.status)}
                            color={`${statusColors[todo.status]}.400`}
                            boxSize={4} />
                          <Icon
                            as={ChevronDownIcon}
                            color={`${statusColors[todo.status]}.400`}
                            boxSize={3} />
                        </HStack>}
                        size="sm"
                        variant="ghost"
                        colorScheme={statusColors[todo.status]}
                        aria-label="Change task status" />
                    </Tooltip>
                    <Portal>
                      <MenuList>
                        <MenuItem
                          icon={<Icon as={WarningIcon} color="gray.400" />}
                          onClick={() => onStatusChange(todo.id, 'pending')}
                          isDisabled={todo.status === 'pending'}
                        >
                          Set to Pending
                        </MenuItem>
                        <MenuItem
                          icon={<Icon as={TimeIcon} color="blue.400" />}
                          onClick={() => onStatusChange(todo.id, 'in-progress')}
                          isDisabled={todo.status === 'in-progress'}
                        >
                          Set to In Progress
                        </MenuItem>
                        <MenuItem
                          icon={<Icon as={CheckIcon} color="green.400" />}
                          onClick={() => onStatusChange(todo.id, 'completed')}
                          isDisabled={todo.status === 'completed'}
                        >
                          Set to Completed
                        </MenuItem>
                      </MenuList>
                    </Portal>
                  </Menu>

                  <Tooltip label="Edit task" placement="top" hasArrow>
                    <IconButton
                      aria-label="Edit todo"
                      icon={<EditIcon />}
                      size="sm"
                      variant="ghost"
                      colorScheme="blue"
                      onClick={() => onEdit(todo)} />
                  </Tooltip>
                  <Tooltip label="Delete task" placement="top" hasArrow>
                    <IconButton
                      aria-label="Delete todo"
                      icon={<DeleteIcon />}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => onDelete(todo)} />
                  </Tooltip>
                </HStack>
              </Flex>
            </Flex>

            {/* Description Section */}
            <Box>
              {todo.description && (
                <Text
                  fontSize="sm"
                  color={descriptionColor}
                  noOfLines={2}
                  lineHeight="tall"
                >
                  {todo.description}
                </Text>
              )}

              {/* Metadata Section */}
              <Flex
                justify="space-between"
                align="center"
                wrap="wrap"
                gap={2}
                mt={2}
              >
                <HStack spacing={2}>
                  <Tooltip
                    label={`Priority: ${todo.priority}`}
                    placement="top"
                    hasArrow
                  >
                    <Tag
                      size="sm"
                      colorScheme={priorityColors[todo.priority]}
                      variant="subtle"
                      borderRadius="full"
                      px={3}
                    >
                      <TagLeftIcon
                        as={WarningIcon}
                        boxSize="10px" />
                      <TagLabel textTransform="capitalize">
                        {todo.priority}
                      </TagLabel>
                    </Tag>
                  </Tooltip>
                </HStack>

                <Tooltip
                  label={`Due: ${format(new Date(todo.dueDate), 'PPP')}`}
                  placement="top"
                  hasArrow
                >
                  <Tag
                    size="sm"
                    variant="subtle"
                    colorScheme={isOverdue ? 'red' : isDueSoon ? 'orange' : 'gray'}
                    borderRadius="full"
                    px={3}
                  >
                    <TagLeftIcon
                      as={CalendarIcon}
                      boxSize="10px" />
                    <TagLabel>
                      {format(new Date(todo.dueDate), 'MMM d')}
                    </TagLabel>
                  </Tag>
                </Tooltip>
              </Flex>
            </Box>
          </VStack>
        </CardBody>
      </MotionCard>
    </Box>
  );
});
