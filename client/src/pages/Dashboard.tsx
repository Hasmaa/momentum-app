import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  Heading,
  Button,
  Input,
  Textarea,
  Select,
  HStack,
  Text,
  useToast,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  Container,
  Card,
  CardBody,
  useColorModeValue,
  Tooltip,
  Grid,
  GridItem,
  Tag,
  TagLabel,
  TagLeftIcon,
  TagCloseButton,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Portal,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FocusLock,
  Switch,
  Icon,
  useColorMode,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useMergeRefs,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Spinner,
  Skeleton,
} from '@chakra-ui/react';
import { Todo } from '../types/todo';
import { 
  ChevronDownIcon, 
  SearchIcon, 
  EditIcon, 
  CalendarIcon,
  CheckIcon,
  TimeIcon,
  WarningIcon,
  DeleteIcon,
  AddIcon,
  HamburgerIcon,
  ViewIcon,
  SunIcon,
  MoonIcon,
  CloseIcon,
  RepeatIcon,
} from '@chakra-ui/icons';
import { format, isPast, isWithinInterval, addDays } from 'date-fns';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import {
  DndContext,
  DragOverlay,
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
  rectIntersection,
  DragStartEvent,
  DragEndEvent,
  useDroppable
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { FC, PropsWithChildren } from 'react';
import SkeletonCard from '../components/SkeletonCard';

const MotionBox = motion(Box);
const MotionCard = motion(Card);
const MotionFlex = motion(Flex);

// Add the DroppableProps interface definition
interface DroppableProps extends PropsWithChildren {
  id: string;
}

const getStatusIcon = (status: Todo['status']) => {
  switch (status) {
    case 'completed':
      return CheckIcon;
    case 'in-progress':
      return TimeIcon;
    case 'pending':
      return WarningIcon;
  }
};

// Add a DragOverlayCard component for better drag visuals
const DragOverlayCard = ({ todo }: { todo: Todo }) => {
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

  const isOverdue = isPast(new Date(todo.dueDate));
  const isDueSoon = isWithinInterval(new Date(todo.dueDate), {
    start: new Date(),
    end: addDays(new Date(), 2)
  });

  return (
    <Card
      bg={cardBg}
      boxShadow="2xl"
      borderRadius="xl"
      opacity={0.9}
      transform="scale(1.05) rotate(-1deg)"
      borderWidth="1px"
      borderColor={borderColor}
      position="relative"
      overflow="visible"
      width="100%"
      transition="all 0.15s"
      cursor="grabbing"
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        bottom={0}
        width="4px"
        borderTopLeftRadius="xl"
        borderBottomLeftRadius="xl"
        bg={`${statusColors[todo.status]}.400`}
      />
      <CardBody py={4} pl={6} >
        <VStack spacing={4} align="stretch">
          <Heading size="sm" noOfLines={1}>
            {todo.title}
          </Heading>
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
          <Flex 
            justify="space-between" 
            align="center"
            wrap="wrap"
            gap={2}
          >
            <HStack spacing={2}>
              <Tag
                size="sm"
                colorScheme={priorityColors[todo.priority]}
                variant="subtle"
                borderRadius="full"
                px={3}
              >
                <TagLeftIcon 
                  as={WarningIcon} 
                  boxSize="10px"
                />
                <TagLabel textTransform="capitalize">
                  {todo.priority}
                </TagLabel>
              </Tag>
            </HStack>
            <Tag 
              size="sm" 
              variant="subtle"
              colorScheme={isOverdue ? 'red' : isDueSoon ? 'orange' : 'gray'}
              borderRadius="full"
              px={3}
            >
              <TagLeftIcon 
                as={CalendarIcon}
                boxSize="10px"
              />
              <TagLabel>
                {format(new Date(todo.dueDate), 'MMM d')}
              </TagLabel>
            </Tag>
          </Flex>
        </VStack>
      </CardBody>
    </Card>
  );
};

// Modify the SortableCard component to properly handle refs
const SortableCard = React.forwardRef<HTMLDivElement, {
  todo: Todo;
  isDragging?: boolean;
  isUpdating?: boolean;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
  onStatusChange: (id: string, newStatus: Todo['status']) => void;
}>(({ todo, isDragging, isUpdating, onEdit, onDelete, onStatusChange }, ref) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
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
  const textColor = useColorModeValue('gray.700', 'gray.100');
  const menuItemHoverBg = useColorModeValue('gray.100', 'whiteAlpha.200');
  const menuBg = useColorModeValue('white', 'gray.700');
  const ghostButtonHoverBg = useColorModeValue('blue.50', 'whiteAlpha.200');
  const accentColor = useColorModeValue('blue.500', 'blue.200');

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
    >
      <MotionCard
        layout
        bg={cardBg}
        boxShadow={isDragging ? 'lg' : 'sm'}
        borderRadius="xl"
        mb={4}
        opacity={isDragging ? 0.4 : 1}
        borderWidth="1px"
        borderColor={borderColor}
        position="relative"
        overflow="visible"
        _hover={{
          bg: hoverBg,
          transform: 'translateY(-2px)',
          boxShadow: 'md',
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
          transition="all 0.2s"
        />

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
            {/* Header Section */}
            <Flex justify="space-between" align="center">
              <Heading 
                size="sm" 
                noOfLines={1}
                flex={1}
                _hover={{ color: 'blue.500' }}
                cursor="grab"
                {...listeners}
              >
                {todo.title}
              </Heading>
              
              <HStack spacing={3}>
                <Menu>
                  <Tooltip 
                    label={`Click to change status. Current: ${todo.status.replace('-', ' ')}`}
                    placement="top"
                    hasArrow
                  >
                    <MenuButton
                      as={IconButton}
                      icon={
                        <HStack spacing={2} padding={2}>
                          <Icon 
                            as={getStatusIcon(todo.status)} 
                            color={`${statusColors[todo.status]}.400`}
                            boxSize={4}
                          />
                          <Icon 
                            as={ChevronDownIcon} 
                            color={`${statusColors[todo.status]}.400`}
                            boxSize={3}
                          />
                        </HStack>
                      }
                      size="sm"
                      variant="ghost"
                      colorScheme={statusColors[todo.status]}
                      aria-label="Change task status"
                    />
                  </Tooltip>
                  <Portal>
                    <MenuList bg={menuBg} borderColor={borderColor}>
                      <MenuItem
                        icon={<Icon as={WarningIcon} color="gray.400" />}
                        onClick={() => onStatusChange(todo.id, 'pending')}
                        color={textColor}
                        bg={menuBg}
                        _hover={{ bg: menuItemHoverBg }}
                        isDisabled={todo.status === 'pending'}
                      >
                        Set to Pending
                      </MenuItem>
                      <MenuItem
                        icon={<Icon as={TimeIcon} color="blue.400" />}
                        onClick={() => onStatusChange(todo.id, 'in-progress')}
                        color={textColor}
                        bg={menuBg}
                        _hover={{ bg: menuItemHoverBg }}
                        isDisabled={todo.status === 'in-progress'}
                      >
                        Set to In Progress
                      </MenuItem>
                      <MenuItem
                        icon={<Icon as={CheckIcon} color="green.400" />}
                        onClick={() => onStatusChange(todo.id, 'completed')}
                        color={textColor}
                        bg={menuBg}
                        _hover={{ bg: menuItemHoverBg }}
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
                    onClick={() => onEdit(todo)}
                    _hover={{
                      bg: ghostButtonHoverBg,
                      color: accentColor
                    }}
                  />
                </Tooltip>
                <Tooltip label="Delete task" placement="top" hasArrow>
                  <IconButton
                    aria-label="Delete todo"
                    icon={<DeleteIcon />}
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => onDelete(todo)}
                    _hover={{
                      bg: useColorModeValue('red.50', 'whiteAlpha.200'),
                      color: useColorModeValue('red.600', 'red.300')
                    }}
                  />
                </Tooltip>
              </HStack>
            </Flex>

            {/* Description Section */}
            <Box cursor="grab" {...listeners}>
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
                        boxSize="10px"
                      />
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
                      boxSize="10px"
                    />
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

SortableCard.displayName = 'SortableCard';

// Update the Droppable component
const Droppable = React.forwardRef<HTMLDivElement, DroppableProps>(({ children, id }, ref) => {
  const { setNodeRef, isOver } = useDroppable({
    id
  });

  const bg = useColorModeValue('gray.50', 'gray.700');
  const hoverBg = useColorModeValue('blue.50', 'blue.700');
  const borderColor = useColorModeValue('blue.200', 'blue.500');

  return (
    <Box 
      ref={useMergeRefs(setNodeRef, ref)}
      height="100%"
      minHeight="200px"
      transition="all 0.2s"
      bg={isOver ? hoverBg : bg}
      borderRadius="lg"
      display="flex"
      flexDirection="column"
      flex="1"
      borderWidth="2px"
      borderStyle="dashed"
      borderColor={isOver ? borderColor : 'transparent'}
      position="relative"
      role="region"
      aria-label={`${id} column`}
      _before={{
        content: '""',
        position: 'absolute',
        inset: 0,
        borderRadius: 'lg',
        bg: isOver ? 'blackAlpha.50' : 'transparent',
        transition: 'all 0.2s',
        pointerEvents: 'none',
      }}
    >
      {children}
    </Box>
  );
});

Droppable.displayName = 'Droppable';

type StatusType = Todo['status'] | 'all';
type PriorityType = Todo['priority'] | 'all';

const Dashboard = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Todo['status']>('pending');
  const [priority, setPriority] = useState<Todo['priority']>('medium');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [filterStatus, setFilterStatus] = useState<Set<StatusType>>(new Set(['all']));
  const [filterPriority, setFilterPriority] = useState<Set<PriorityType>>(new Set(['all']));
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof Todo>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const toast = useToast({
    position: 'top-right',
    duration: 3000,
    isClosable: true,
  });
  const [isListView, setIsListView] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const { 
    isOpen: isCreateModalOpen, 
    onOpen: _onCreateModalOpen,
    onClose: onCreateModalClose 
  } = useDisclosure();
  const { 
    isOpen: isEditModalOpen, 
    onOpen: onEditModalOpen, 
    onClose: onEditModalClose 
  } = useDisclosure();

  const mainBg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const textColor = useColorModeValue('gray.700', 'gray.100');
  const columnBg = useColorModeValue('gray.50', 'gray.800');
  const headerBg = useColorModeValue('blue.50', 'gray.800');
  const accentColor = useColorModeValue('blue.500', 'blue.200');
  const descriptionColor = useColorModeValue('gray.600', 'gray.300');
  const secondaryTextColor = useColorModeValue('gray.500', 'gray.400');
  const menuHoverBg = useColorModeValue('gray.100', 'whiteAlpha.200');
  const ghostButtonHoverBg = useColorModeValue('blue.50', 'whiteAlpha.200');

  const [todoToDelete, setTodoToDelete] = useState<Todo | null>(null);
  const cancelDeleteRef = useRef<HTMLButtonElement>(null);
  const { 
    isOpen: isDeleteAlertOpen, 
    onOpen: onDeleteAlertOpen, 
    onClose: onDeleteAlertClose 
  } = useDisclosure();

  const hasActiveFilters = filterStatus.size > 1 || filterPriority.size > 1 || searchQuery.trim() !== '';
  
  const clearFilters = () => {
    setFilterStatus(new Set(['all']));
    setFilterPriority(new Set(['all']));
    setSearchQuery('');
  };

  const handleStatusFilter = (status: StatusType) => {
    const newFilterStatus = new Set(filterStatus);
    if (status === 'all') {
      setFilterStatus(new Set(['all']));
      return;
    }
    
    newFilterStatus.delete('all');
    if (newFilterStatus.has(status)) {
      newFilterStatus.delete(status);
      if (newFilterStatus.size === 0) {
        newFilterStatus.add('all');
      }
    } else {
      newFilterStatus.add(status);
    }
    setFilterStatus(newFilterStatus);
  };

  const handlePriorityFilter = (priority: PriorityType) => {
    const newFilterPriority = new Set(filterPriority);
    if (priority === 'all') {
      setFilterPriority(new Set(['all']));
      return;
    }
    
    newFilterPriority.delete('all');
    if (newFilterPriority.has(priority)) {
      newFilterPriority.delete(priority);
      if (newFilterPriority.size === 0) {
        newFilterPriority.add('all');
      }
    } else {
      newFilterPriority.add(priority);
    }
    setFilterPriority(newFilterPriority);
  };

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingTodoIds, setUpdatingTodoIds] = useState<Set<string>>(new Set());

  const fetchTodos = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      
      if (!filterStatus.has('all')) {
        Array.from(filterStatus).forEach(status => 
          params.append('status', status)
        );
      }
      
      if (!filterPriority.has('all')) {
        Array.from(filterPriority).forEach(priority => 
          params.append('priority', priority)
        );
      }
      
      if (searchQuery) params.append('search', searchQuery);
      params.append('sortField', sortField);
      params.append('sortDirection', sortDirection);

      const response = await fetch(`http://localhost:5001/api/todos?${params}`);
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      toast({
        title: 'Error fetching todos',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [filterStatus, filterPriority, searchQuery, sortField, sortDirection]);

  useEffect(() => {
    if (isCreateModalOpen || isEditModalOpen) {
      const timer = setTimeout(() => {
        const input = document.querySelector('[data-autofocus="true"]') as HTMLInputElement;
        if (input) {
          input.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isCreateModalOpen, isEditModalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5001/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          status,
          priority,
          dueDate: new Date(dueDate).toISOString(),
        }),
      });
      
      if (!response.ok) throw new Error('Failed to create todo');
      
      setTitle('');
      setDescription('');
      setDueDate(new Date().toISOString().split('T')[0]);
      setPriority('medium');
      setStatus('pending');
      onCreateModalClose();
      fetchTodos();
      
      toast({
        title: 'Todo created successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error creating todo',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (todo: Todo) => {
    setTodoToDelete(todo);
    onDeleteAlertOpen();
  };

  const confirmDelete = async () => {
    if (!todoToDelete) return;
    setIsDeleting(true);
    
    try {
      const response = await fetch(`http://localhost:5001/api/todos/${todoToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete todo');
      
      fetchTodos();
      toast({
        title: 'Task deleted successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error deleting task',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setTodoToDelete(null);
      onDeleteAlertClose();
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: Todo['status']) => {
    if (!id) {
      console.error('No todo id provided');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) throw new Error('Failed to update todo');
      
      fetchTodos();
    } catch (error) {
      toast({
        title: 'Error updating todo',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleEdit = async (todo: Todo) => {
    if (!editingTodo) {
      setEditingTodo(todo);
      onEditModalOpen();
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/todos/${todo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: todo.title,
          description: todo.description,
          status: todo.status,
          priority: todo.priority,
          dueDate: new Date(todo.dueDate).toISOString(),
        }),
      });
      
      if (!response.ok) throw new Error('Failed to update todo');
      
      setEditingTodo(null);
      onEditModalClose();
      fetchTodos();
      toast({
        title: 'Todo updated successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error updating todo',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const cancelEdit = () => {
    setEditingTodo(null);
    onEditModalClose();
  };

  const toggleSort = (field: keyof Todo) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getDueDateColor = (dueDate: string) => {
    const date = new Date(dueDate);
    const now = new Date();
    if (isPast(date)) return 'red.500';
    if (isWithinInterval(date, { start: now, end: addDays(now, 2) })) return 'orange.500';
    return 'gray.500';
  };

  const getPriorityColor = (priority: Todo['priority']) => {
    switch (priority) {
      case 'high':
        return 'red';
      case 'medium':
        return 'yellow';
      case 'low':
        return 'green';
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;

    if (!over || !['pending', 'in-progress', 'completed'].includes(over.id as string)) {
      return;
    }

    const todoId = active.id as string;
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;

    const newStatus = over.id as Todo['status'];
    if (todo.status === newStatus) return;

    // Add todo to updating set
    setUpdatingTodoIds(prev => new Set(prev).add(todoId));

    try {
      // Optimistically update the UI
      const newTodos = todos.map(t => 
        t.id === todoId 
          ? { ...t, status: newStatus }
          : t
      );
      setTodos(newTodos);

      const response = await fetch(`http://localhost:5001/api/todos/${todoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          ...todo,
          status: newStatus 
        }),
      });
      
      if (!response.ok) throw new Error('Failed to update todo');

      toast({
        title: 'Task moved successfully',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      // Revert the optimistic update on error
      toast({
        title: 'Error moving task',
        description: 'The task has been returned to its original position',
        status: 'error',
        duration: 3000,
      });
      fetchTodos();
    } finally {
      // Remove todo from updating set
      setUpdatingTodoIds(prev => {
        const next = new Set(prev);
        next.delete(todoId);
        return next;
      });
    }
  };

  const renderSkeletons = () => (
    <VStack spacing={4} align="stretch" width="100%">
      {[...Array(3)].map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </VStack>
  );

  const renderBoardView = () => {
    if (isLoading) {
      return (
        <Grid templateColumns="repeat(3, 1fr)" gap={6}>
          {['pending', 'in-progress', 'completed'].map((status) => (
            <GridItem key={status}>
              <Card bg={columnBg} mb={4} borderRadius="lg" boxShadow="sm">
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  h="3px"
                  bg={status === 'completed' ? 'green.400' : status === 'in-progress' ? 'blue.400' : 'gray.400'}
                />
                <CardBody py={4} px={6}>
                  <Flex align="center" justify="space-between">
                    <Heading size="md" textTransform="capitalize">
                      {status.replace('-', ' ')}
                    </Heading>
                    <Skeleton height="20px" width="30px" borderRadius="full" />
                  </Flex>
                </CardBody>
              </Card>
              <VStack spacing={4} align="stretch">
                {[...Array(3)].map((_, index) => (
                  <SkeletonCard key={index} />
                ))}
              </VStack>
            </GridItem>
          ))}
        </Grid>
      );
    }

    const columns = {
      'pending': todos.filter(todo => todo.status === 'pending'),
      'in-progress': todos.filter(todo => todo.status === 'in-progress'),
      'completed': todos.filter(todo => todo.status === 'completed')
    } as const;

    const activeTodo = activeId ? todos.find(t => t.id === activeId) : null;
    const statuses: Todo['status'][] = ['pending', 'in-progress', 'completed'];

    const handleCreateFromColumn = (columnStatus: Todo['status']) => {
      setStatus(columnStatus);
      _onCreateModalOpen();
    };

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Grid 
          templateColumns="repeat(3, 1fr)" 
          gap={6} 
          minH="calc(100vh - 300px)"
          position="relative"
          overflow="visible"
        >
          {statuses.map((status) => (
            <GridItem key={status} display="flex" flexDirection="column" height="100%">
              <Droppable id={status}>
                <Card 
                  bg={columnBg}
                  mb={4}
                  borderRadius="lg"
                  boxShadow="sm"
                  position="relative"
                  overflow="hidden"
                  width="100%"
                >
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    h="3px"
                    bg={status === 'completed' ? 'green.400' : status === 'in-progress' ? 'blue.400' : 'gray.400'}
                  />
                  <CardBody py={4} px={6}>
                    <Flex align="center" justify="space-between">
                      <Heading size="md" textTransform="capitalize">
                        {status.replace('-', ' ')}
                      </Heading>
                      <Tag
                        colorScheme={status === 'completed' ? 'green' : status === 'in-progress' ? 'blue' : 'gray'}
                        borderRadius="full"
                        variant="subtle"
                        py={1}
                        px={3}
                        fontSize="sm"
                      >
                        {columns[status].length}
                      </Tag>
                    </Flex>
                  </CardBody>
                </Card>
                
                <Box 
                  flex="1"
                  width="100%"
                  overflowY="auto"
                  px={2}
                  py={2}
                >
                  <SortableContext 
                    items={columns[status].map(t => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <VStack spacing={4} align="stretch" width="100%">
                      {columns[status].length > 0 ? (
                        columns[status].map(todo => (
                          <SortableCard
                            key={todo.id}
                            todo={todo}
                            isDragging={activeId === todo.id}
                            isUpdating={updatingTodoIds.has(todo.id)}
                            onEdit={(todo) => {
                              setEditingTodo(todo);
                              onEditModalOpen();
                            }}
                            onDelete={handleDeleteClick}
                            onStatusChange={handleStatusChange}
                          />
                        ))
                      ) : (
                        <Flex
                          direction="column"
                          align="center"
                          justify="center"
                          py={8}
                          px={4}
                          borderRadius="lg"
                          borderWidth="2px"
                          borderStyle="dashed"
                          borderColor={useColorModeValue('gray.200', 'gray.600')}
                          bg={useColorModeValue('gray.50', 'gray.700')}
                          transition="all 0.2s"
                          _hover={{
                            borderColor: status === 'completed' ? 'green.400' : status === 'in-progress' ? 'blue.400' : 'gray.400',
                            transform: 'translateY(-2px)',
                            boxShadow: 'sm'
                          }}
                        >
                          <VStack spacing={3}>
                            <Icon
                              as={getStatusIcon(status)}
                              boxSize="8"
                              color={`${status === 'completed' ? 'green' : status === 'in-progress' ? 'blue' : 'gray'}.400`}
                              opacity={0.7}
                            />
                            <Text 
                              color={secondaryTextColor} 
                              fontSize="sm"
                              textAlign="center"
                              fontWeight="medium"
                            >
                              {status === 'pending' ? (
                                "No pending tasks. Drag tasks here to mark them as To Do"
                              ) : status === 'in-progress' ? (
                                "No tasks in progress. Drag tasks here when you start working on them"
                              ) : (
                                "No completed tasks yet. Drag tasks here when they're done"
                              )}
                            </Text>
                            <Button
                              size="sm"
                              variant="ghost"
                              colorScheme={status === 'completed' ? 'green' : status === 'in-progress' ? 'blue' : 'gray'}
                              leftIcon={<AddIcon />}
                              onClick={() => handleCreateFromColumn(status)}
                            >
                              Add a task
                            </Button>
                          </VStack>
                        </Flex>
                      )}
                    </VStack>
                  </SortableContext>
                </Box>
              </Droppable>
            </GridItem>
          ))}
        </Grid>
        <DragOverlay dropAnimation={null}>
          {activeTodo ? (
            <DragOverlayCard todo={activeTodo} />
          ) : null}
        </DragOverlay>
      </DndContext>
    );
  };

  // Add a wrapper for onCreateModalOpen that can handle initial status
  const onCreateModalOpen = (initialStatus?: Todo['status']) => {
    if (initialStatus) {
      setStatus(initialStatus);
    }
    _onCreateModalOpen();
  };

  return (
    <Box bg={mainBg} minH="100vh" transition="background-color 0.2s">
      <Container maxW="container.xl" py={8}>
        <VStack spacing={6} align="stretch">
          <Card bg={headerBg} borderRadius="lg" borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Flex justify="space-between" align="center">
                <Heading size="lg" color={textColor}>Tasks</Heading>
                <HStack spacing={6}>
                  <HStack spacing={3}>
                    <Icon 
                      as={HamburgerIcon} 
                      color={isListView ? accentColor : secondaryTextColor}
                      transition="all 0.2s"
                      opacity={isListView ? 1 : 0.5}

                    />
                    <Switch
                      colorScheme="blue"
                      isChecked={!isListView}
                      onChange={() => setIsListView(!isListView)}
                      sx={{
                        '& .chakra-switch__track': {
                          bg: isListView ? 'gray.400' : accentColor,
                        }
                      }}
                    />
                    <Icon 
                      as={HamburgerIcon} 
                      color={!isListView ? accentColor : secondaryTextColor}
                      opacity={!isListView ? 1 : 0.5}
                      transition="all 0.2s"
                      transform={ 'rotate(90deg)'}
                    />
                  </HStack>
                  <IconButton
                    aria-label="Toggle color mode"
                    icon={
                      <MotionBox
                        initial={{ rotate: 0 }}
                        animate={{ rotate: colorMode === 'light' ? 0 : 180 }}
                        transition={{ duration: 0.2 }}
                      >
                        {colorMode === 'light' ? <SunIcon /> : <MoonIcon />}
                      </MotionBox>
                    }
                    variant="ghost"
                    onClick={toggleColorMode}
                    color={accentColor}
                    _hover={{
                      bg: ghostButtonHoverBg
                    }}
                  />
                  <Button
                    leftIcon={<AddIcon />}
                    colorScheme="blue"
                    onClick={() => onCreateModalOpen()}
                    size="md"
                    borderRadius="full"
                    px={6}
                    _hover={{
                      transform: 'translateY(-1px)',
                      boxShadow: 'md',
                    }}
                  >
                    New Task
                  </Button>
                </HStack>
              </Flex>
            </CardBody>
          </Card>

          <Card borderRadius="lg" bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Flex 
                  direction={{ base: "column", md: "row" }} 
                  gap={4} 
                  align={{ base: "stretch", md: "center" }}
                  justify="space-between"
                >
                  <InputGroup size="md" maxW={{ base: "100%", md: "400px" }}>
                    <InputLeftElement pointerEvents="none">
                      <SearchIcon color={searchQuery ? accentColor : secondaryTextColor} />
                    </InputLeftElement>
                    <Input
                      placeholder="Search tasks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      variant="filled"
                      borderRadius="full"
                      _placeholder={{ color: secondaryTextColor }}
                      color={textColor}
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
                          onClick={() => setSearchQuery('')}
                        />
                      </InputRightElement>
                    )}
                  </InputGroup>

                  <HStack spacing={4} align="center">
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
                          <Icon as={HamburgerIcon} />
                          <Text>Status</Text>
                          {!filterStatus.has('all') && (
                            <Tag size="sm" colorScheme="blue" borderRadius="full">
                              {filterStatus.size}
                            </Tag>
                          )}
                        </HStack>
                      </MenuButton>
                      <MenuList>
                        <MenuItem
                          onClick={() => handleStatusFilter('all' as StatusType)}
                          closeOnSelect={false}
                        >
                          <Flex justify="space-between" align="center" width="100%">
                            <Text>All Status</Text>
                            {filterStatus.has('all' as StatusType) && <CheckIcon color="blue.500" />}
                          </Flex>
                        </MenuItem>
                        <MenuItem
                          onClick={() => handleStatusFilter('pending' as StatusType)}
                          closeOnSelect={false}
                        >
                          <Flex justify="space-between" align="center" width="100%">
                            <HStack>
                              <Icon as={WarningIcon} color="gray.500" />
                              <Text>Pending</Text>
                            </HStack>
                            {filterStatus.has('pending' as StatusType) && <CheckIcon color="blue.500" />}
                          </Flex>
                        </MenuItem>
                        <MenuItem
                          onClick={() => handleStatusFilter('in-progress' as StatusType)}
                          closeOnSelect={false}
                        >
                          <Flex justify="space-between" align="center" width="100%">
                            <HStack>
                              <Icon as={TimeIcon} color="blue.500" />
                              <Text>In Progress</Text>
                            </HStack>
                            {filterStatus.has('in-progress' as StatusType) && <CheckIcon color="blue.500" />}
                          </Flex>
                        </MenuItem>
                        <MenuItem
                          onClick={() => handleStatusFilter('completed' as StatusType)}
                          closeOnSelect={false}
                        >
                          <Flex justify="space-between" align="center" width="100%">
                            <HStack>
                              <Icon as={CheckIcon} color="green.500" />
                              <Text>Completed</Text>
                            </HStack>
                            {filterStatus.has('completed' as StatusType) && <CheckIcon color="blue.500" />}
                          </Flex>
                        </MenuItem>
                      </MenuList>
                    </Menu>

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
                          <Icon as={WarningIcon} />
                          <Text>Priority</Text>
                          {!filterPriority.has('all') && (
                            <Tag size="sm" colorScheme="blue" borderRadius="full">
                              {filterPriority.size}
                            </Tag>
                          )}
                        </HStack>
                      </MenuButton>
                      <MenuList>
                        <MenuItem
                          onClick={() => handlePriorityFilter('all' as PriorityType)}
                          closeOnSelect={false}
                        >
                          <Flex justify="space-between" align="center" width="100%">
                            <Text>All Priority</Text>
                            {filterPriority.has('all' as PriorityType) && <CheckIcon color="blue.500" />}
                          </Flex>
                        </MenuItem>
                        <MenuItem
                          onClick={() => handlePriorityFilter('low' as PriorityType)}
                          closeOnSelect={false}
                        >
                          <Flex justify="space-between" align="center" width="100%">
                            <HStack>
                              <Icon as={WarningIcon} color="green.500" />
                              <Text>Low</Text>
                            </HStack>
                            {filterPriority.has('low' as PriorityType) && <CheckIcon color="blue.500" />}
                          </Flex>
                        </MenuItem>
                        <MenuItem
                          onClick={() => handlePriorityFilter('medium' as PriorityType)}
                          closeOnSelect={false}
                        >
                          <Flex justify="space-between" align="center" width="100%">
                            <HStack>
                              <Icon as={WarningIcon} color="yellow.500" />
                              <Text>Medium</Text>
                            </HStack>
                            {filterPriority.has('medium' as PriorityType) && <CheckIcon color="blue.500" />}
                          </Flex>
                        </MenuItem>
                        <MenuItem
                          onClick={() => handlePriorityFilter('high' as PriorityType)}
                          closeOnSelect={false}
                        >
                          <Flex justify="space-between" align="center" width="100%">
                            <HStack>
                              <Icon as={WarningIcon} color="red.500" />
                              <Text>High</Text>
                            </HStack>
                            {filterPriority.has('high' as PriorityType) && <CheckIcon color="blue.500" />}
                          </Flex>
                        </MenuItem>
                      </MenuList>
                    </Menu>

                    {hasActiveFilters && (
                      <Tooltip label="Clear all filters" hasArrow>
                        <IconButton
                          aria-label="Clear filters"
                          icon={<RepeatIcon />}
                          variant="ghost"
                          colorScheme="blue"
                          onClick={clearFilters}
                        />
                      </Tooltip>
                    )}
                  </HStack>
                </Flex>

                {hasActiveFilters && (
                  <Flex gap={2} flexWrap="wrap">
                    {searchQuery && (
                      <Tag
                        size="md"
                        borderRadius="full"
                        variant="subtle"
                        colorScheme="blue"
                      >
                        <TagLeftIcon as={SearchIcon} boxSize="12px" />
                        <TagLabel>Search: {searchQuery}</TagLabel>
                        <TagCloseButton onClick={() => setSearchQuery('')} />
                      </Tag>
                    )}
                    
                    {!filterStatus.has('all') && Array.from(filterStatus).map((status: StatusType) => (
                      <Tag
                        key={status}
                        size="md"
                        borderRadius="full"
                        variant="subtle"
                        colorScheme="blue"
                      >
                        <TagLeftIcon as={HamburgerIcon} boxSize="12px" />
                        <TagLabel>Status: {status.replace('-', ' ')}</TagLabel>
                        <TagCloseButton onClick={() => {
                          const newFilterStatus = new Set(filterStatus);
                          newFilterStatus.delete(status);
                          if (newFilterStatus.size === 0) {
                            newFilterStatus.add('all');
                          }
                          setFilterStatus(newFilterStatus);
                        }} />
                      </Tag>
                    ))}
                    
                    {!filterPriority.has('all') && Array.from(filterPriority).map((priority: PriorityType) => (
                      <Tag
                        key={priority}
                        size="md"
                        borderRadius="full"
                        variant="subtle"
                        colorScheme="blue"
                      >
                        <TagLeftIcon as={WarningIcon} boxSize="12px" />
                        <TagLabel>Priority: {priority}</TagLabel>
                        <TagCloseButton onClick={() => {
                          const newFilterPriority = new Set(filterPriority);
                          newFilterPriority.delete(priority);
                          if (newFilterPriority.size === 0) {
                            newFilterPriority.add('all');
                          }
                          setFilterPriority(newFilterPriority);
                        }} />
                      </Tag>
                    ))}
                  </Flex>
                )}

                <Box>
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <VStack spacing={4} align="stretch" width="100%">
                        {[...Array(6)].map((_, index) => (
                          <SkeletonCard key={index} />
                        ))}
                      </VStack>
                    ) : isListView ? (
                      <DndContext
                        sensors={sensors}
                        collisionDetection={rectIntersection}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                      >
                        {todos.length === 0 ? (
                          <Flex
                            direction="column"
                            align="center"
                            justify="center"
                            py={12}
                            px={4}
                          >
                            <VStack spacing={6}>
                              <Box
                                position="relative"
                                width="200px"
                                height="200px"
                              >
                                {/* Empty state illustration using boxes */}
                                <Box
                                  position="absolute"
                                  top="50%"
                                  left="50%"
                                  transform="translate(-50%, -50%)"
                                  width="160px"
                                  height="120px"
                                  borderWidth="3px"
                                  borderStyle="dashed"
                                  borderColor={useColorModeValue('blue.200', 'blue.500')}
                                  borderRadius="xl"
                                  opacity={0.5}
                                />
                                <Box
                                  position="absolute"
                                  top="40%"
                                  left="45%"
                                  transform="translate(-50%, -50%)"
                                  width="160px"
                                  height="120px"
                                  borderWidth="3px"
                                  borderStyle="dashed"
                                  borderColor={useColorModeValue('green.200', 'green.500')}
                                  borderRadius="xl"
                                  opacity={0.5}
                                />
                                <Box
                                  position="absolute"
                                  top="45%"
                                  left="55%"
                                  transform="translate(-50%, -50%)"
                                  width="160px"
                                  height="120px"
                                  borderWidth="3px"
                                  borderStyle="dashed"
                                  borderColor={useColorModeValue('purple.200', 'purple.500')}
                                  borderRadius="xl"
                                  opacity={0.5}
                                />
                              </Box>
                              <VStack spacing={3}>
                                <Heading size="lg" color={textColor}>
                                  No tasks yet
                                </Heading>
                                <Text color={secondaryTextColor} textAlign="center">
                                  Get started by creating your first task using the "New Task" button above
                                </Text>
                                <Button
                                  leftIcon={<AddIcon />}
                                  colorScheme="blue"
                                  onClick={() => onCreateModalOpen()}
                                  size="lg"
                                  borderRadius="full"
                                  px={8}
                                  mt={4}
                                >
                                  Create Your First Task
                                </Button>
                              </VStack>
                            </VStack>
                          </Flex>
                        ) : (
                          <Accordion 
                            defaultIndex={[0, 1, 2]} 
                            allowMultiple 
                            as={motion.div} 
                            layout
                          >
                            <VStack spacing={6} align="stretch">
                              {(['pending', 'in-progress', 'completed'] as const).map(status => {
                                const statusTodos = todos.filter(todo => todo.status === status);
                                
                                return (
                                  <Droppable id={status} key={status}>
                                    <AccordionItem
                                      border="none"
                                    >
                                      <Card 
                                        bg={columnBg}
                                        borderRadius="lg"
                                        boxShadow="sm"
                                        position="relative"
                                        overflow="hidden"
                                        width="100%"
                                        transition="all 0.2s"
                                        _hover={{
                                          bg: hoverBg,
                                        }}
                                      >
                                        <Box
                                          position="absolute"
                                          top={0}
                                          left={0}
                                          right={0}
                                          h="3px"
                                          bg={status === 'completed' ? 'green.400' : status === 'in-progress' ? 'blue.400' : 'gray.400'}
                                        />
                                        <AccordionButton 
                                          py={4} 
                                          px={6}
                                          _hover={{ bg: 'transparent' }}
                                          _expanded={{ bg: hoverBg }}
                                        >
                                          <Flex align="center" justify="space-between" flex="1">
                                            <HStack spacing={3}>
                                              <Icon 
                                                as={getStatusIcon(status)}
                                                color={`${status === 'completed' ? 'green' : status === 'in-progress' ? 'blue' : 'gray'}.400`}
                                              />
                                              <Heading size="md" textTransform="capitalize">
                                                {status.replace('-', ' ')}
                                              </Heading>
                                            </HStack>
                                            <HStack spacing={3}>
                                              <Tag
                                                colorScheme={status === 'completed' ? 'green' : status === 'in-progress' ? 'blue' : 'gray'}
                                                borderRadius="full"
                                                variant="subtle"
                                                py={1}
                                                px={3}
                                                fontSize="sm"
                                              >
                                                {statusTodos.length}
                                              </Tag>
                                              <AccordionIcon />
                                            </HStack>
                                          </Flex>
                                        </AccordionButton>
                                      </Card>
                                      <AccordionPanel 
                                        pb={4} 
                                        pt={4} 
                                        px={0}
                                        as={motion.div}
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ 
                                          opacity: 1,
                                          height: "auto",
                                          transition: {
                                            height: { type: "spring", bounce: 0.2, duration: 0.6 },
                                            opacity: { duration: 0.25 }
                                          }
                                        }}
                                        exit={{ 
                                          opacity: 0,
                                          height: 0,
                                          transition: {
                                            height: { type: "spring", bounce: 0, duration: 0.4 },
                                            opacity: { duration: 0.15 }
                                          }
                                        }}
                                      >
                                        <Box 
                                          minH="100px"
                                          borderRadius="lg"
                                          transition="all 0.2s"
                                          p={4}
                                        >
                                          <SortableContext 
                                            items={statusTodos.map(t => t.id)}
                                            strategy={verticalListSortingStrategy}
                                          >
                                            <VStack spacing={4} align="stretch">
                                              {statusTodos.length > 0 ? (
                                                statusTodos.map(todo => (
                                                  <SortableCard
                                                    key={todo.id}
                                                    todo={todo}
                                                    isDragging={activeId === todo.id}
                                                    isUpdating={updatingTodoIds.has(todo.id)}
                                                    onEdit={(todo) => {
                                                      setEditingTodo(todo);
                                                      onEditModalOpen();
                                                    }}
                                                    onDelete={handleDeleteClick}
                                                    onStatusChange={handleStatusChange}
                                                  />
                                                ))
                                              ) : (
                                                <Flex
                                                  direction="column"
                                                  align="center"
                                                  justify="center"
                                                  py={8}
                                                  px={4}
                                                  borderRadius="lg"
                                                  borderWidth="2px"
                                                  borderStyle="dashed"
                                                  borderColor={useColorModeValue('gray.200', 'gray.600')}
                                                >
                                                  <Text color={secondaryTextColor} fontSize="sm">
                                                    Drop tasks here or use the menu to change their status
                                                  </Text>
                                                </Flex>
                                              )}
                                            </VStack>
                                          </SortableContext>
                                        </Box>
                                      </AccordionPanel>
                                    </AccordionItem>
                                  </Droppable>
                                );
                              })}
                            </VStack>
                          </Accordion>
                        )}
                        <DragOverlay dropAnimation={null}>
                          {activeId ? (
                            <DragOverlayCard todo={todos.find(t => t.id === activeId)!} />
                          ) : null}
                        </DragOverlay>
                      </DndContext>
                    ) : (
                      renderBoardView()
                    )}
                  </AnimatePresence>
                </Box>
              </VStack>
            </CardBody>
          </Card>
        </VStack>

        {/* Create Task Modal */}
        <Modal 
          isOpen={isCreateModalOpen} 
          onClose={onCreateModalClose} 
          size="xl"
          motionPreset="slideInBottom"
        >
          <ModalOverlay 
            bg="blackAlpha.300"
            backdropFilter="blur(10px)"
          />
          <ModalContent
            as={motion.div}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ type: "tween", duration: 0.2 }}
          >
            <FocusLock>
              <form onSubmit={handleSubmit}>
                <ModalHeader>Create New Task</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <VStack spacing={4}>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <AddIcon color="gray.400" />
                      </InputLeftElement>
                      <Input
                        placeholder="Task Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        variant="filled"
                        data-autofocus="true"
                        autoFocus
                      />
                    </InputGroup>
                    <Textarea
                      placeholder="Task Description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      variant="filled"
                      rows={3}
                    />
                    <Grid templateColumns="repeat(2, 1fr)" gap={4} width="full">
                      <GridItem>
                        <Select 
                          value={priority} 
                          onChange={(e) => setPriority(e.target.value as Todo['priority'])}
                          variant="filled"
                          icon={<WarningIcon />}
                        >
                          <option value="low">Low Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="high">High Priority</option>
                        </Select>
                      </GridItem>
                      <GridItem>
                        <Select 
                          value={status} 
                          onChange={(e) => setStatus(e.target.value as Todo['status'])}
                          variant="filled"
                          icon={<Icon as={getStatusIcon(status)} />}
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </Select>
                      </GridItem>
                    </Grid>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <CalendarIcon color="gray.400" />
                      </InputLeftElement>
                      <Input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        required
                        variant="filled"
                      />
                    </InputGroup>
                  </VStack>
                </ModalBody>
                <ModalFooter>
                  <Button 
                    variant="ghost" 
                    mr={3} 
                    onClick={onCreateModalClose}
                    isDisabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    colorScheme="blue" 
                    leftIcon={<AddIcon />}
                    isLoading={isSubmitting}
                    loadingText="Creating..."
                  >
                    Create Task
                  </Button>
                </ModalFooter>
              </form>
            </FocusLock>
          </ModalContent>
        </Modal>

        {/* Edit Task Modal */}
        <Modal isOpen={isEditModalOpen} onClose={cancelEdit} size="xl">
          <ModalOverlay />
          <ModalContent>
            {editingTodo && (
              <FocusLock>
                <ModalHeader>Edit Task</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <VStack spacing={4}>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <EditIcon color="gray.400" />
                      </InputLeftElement>
                      <Input
                        value={editingTodo.title}
                        onChange={(e) => setEditingTodo({ ...editingTodo, title: e.target.value })}
                        variant="filled"
                        size="lg"
                        fontWeight="bold"
                        data-autofocus="true"
                        autoFocus
                      />
                    </InputGroup>
                    <Textarea
                      value={editingTodo.description}
                      onChange={(e) => setEditingTodo({ ...editingTodo, description: e.target.value })}
                      variant="filled"
                      rows={3}
                    />
                    <Grid templateColumns="repeat(2, 1fr)" gap={4} width="full">
                      <GridItem>
                        <Select
                          value={editingTodo.priority}
                          onChange={(e) => setEditingTodo({ ...editingTodo, priority: e.target.value as Todo['priority'] })}
                          variant="filled"
                          icon={<WarningIcon />}
                        >
                          <option value="low">Low Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="high">High Priority</option>
                        </Select>
                      </GridItem>
                      <GridItem>
                        <InputGroup>
                          <InputLeftElement pointerEvents="none">
                            <CalendarIcon color="gray.400" />
                          </InputLeftElement>
                          <Input
                            type="date"
                            value={new Date(editingTodo.dueDate).toISOString().split('T')[0]}
                            onChange={(e) => setEditingTodo({ ...editingTodo, dueDate: new Date(e.target.value).toISOString() })}
                            variant="filled"
                          />
                        </InputGroup>
                      </GridItem>
                    </Grid>
                  </VStack>
                </ModalBody>
                <ModalFooter>
                  <Button variant="ghost" mr={3} onClick={cancelEdit}>
                    Cancel
                  </Button>
                  <Button 
                    colorScheme="green" 
                    onClick={() => handleEdit(editingTodo)}
                    leftIcon={<CheckIcon />}
                  >
                    Save Changes
                  </Button>
                </ModalFooter>
              </FocusLock>
            )}
          </ModalContent>
        </Modal>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          isOpen={isDeleteAlertOpen}
          leastDestructiveRef={cancelDeleteRef}
          onClose={onDeleteAlertClose}
          motionPreset="slideInBottom"
        >
          <AlertDialogOverlay>
            <AlertDialogContent
              as={motion.div}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "tween", duration: 0.2 }}
            >
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Delete Task
              </AlertDialogHeader>

              <AlertDialogBody>
                Are you sure you want to delete "{todoToDelete?.title}"? This action cannot be undone.
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button 
                  ref={cancelDeleteRef} 
                  onClick={onDeleteAlertClose}
                  isDisabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button 
                  colorScheme="red" 
                  onClick={confirmDelete} 
                  ml={3}
                  isLoading={isDeleting}
                  loadingText="Deleting..."
                >
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Container>
    </Box>
  );
};

export default Dashboard;
