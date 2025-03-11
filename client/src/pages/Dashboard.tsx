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
  closestCorners,
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

const MotionBox = motion(Box);
const MotionCard = motion(Card);
const MotionFlex = motion(Flex);

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

// Modify the SortableCard component to add ghost effect
const SortableCard = ({ todo, isDragging, onEdit, onDelete, onStatusChange }: { 
  todo: Todo; 
  isDragging?: boolean;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
  onStatusChange: (id: string, newStatus: Todo['status']) => void;
}) => {
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
      ref={setNodeRef}
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
          duration: 0.2,
          ease: "easeInOut"
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
                        <HStack spacing={2}>
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
};

// Add the Droppable component definition
interface DroppableProps extends PropsWithChildren {
  id: string;
}

const Droppable: FC<DroppableProps> = ({ children, id }) => {
  const { setNodeRef, isOver } = useDroppable({
    id
  });

  return (
    <Box 
      ref={setNodeRef} 
      height="100%"
      transition="all 0.2s"
      bg={isOver ? 'rgba(66, 153, 225, 0.08)' : 'transparent'}
      borderRadius="lg"
    >
      {children}
    </Box>
  );
};

const Dashboard = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Todo['status']>('pending');
  const [priority, setPriority] = useState<Todo['priority']>('medium');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [filterStatus, setFilterStatus] = useState<Todo['status'] | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<Todo['priority'] | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof Todo>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const toast = useToast();
  const [isListView, setIsListView] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const { 
    isOpen: isCreateModalOpen, 
    onOpen: onCreateModalOpen, 
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

  const fetchTodos = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterPriority !== 'all') params.append('priority', filterPriority);
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
    }
  };

  const handleDeleteClick = (todo: Todo) => {
    setTodoToDelete(todo);
    onDeleteAlertOpen();
  };

  const confirmDelete = async () => {
    if (!todoToDelete) return;
    
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

    // If no valid drop target or drop target is not a valid status, just return
    if (!over || !['pending', 'in-progress', 'completed'].includes(over.id as string)) {
      return;
    }

    const todoId = active.id as string;
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;

    const newStatus = over.id as Todo['status'];
    if (todo.status === newStatus) return;

    try {
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
      
      // Optimistically update the UI
      const newTodos = todos.map(t => 
        t.id === todoId 
          ? { ...t, status: newStatus }
          : t
      );
      setTodos(newTodos);

      toast({
        title: 'Task moved successfully',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error moving task',
        status: 'error',
        duration: 3000,
      });
      fetchTodos();
    }
  };

  const renderBoardView = () => {
    type StatusType = Todo['status'];
    const columns = {
      'pending': todos.filter(todo => todo.status === 'pending'),
      'in-progress': todos.filter(todo => todo.status === 'in-progress'),
      'completed': todos.filter(todo => todo.status === 'completed')
    } as const;

    const activeTodo = activeId ? todos.find(t => t.id === activeId) : null;
    const statuses: StatusType[] = ['pending', 'in-progress', 'completed'];

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Grid 
          templateColumns="repeat(3, 1fr)" 
          gap={6} 
          minH="300px"
          position="relative"
          overflow="hidden"
        >
          <LayoutGroup>
            {statuses.map((status) => (
              <Droppable key={status} id={status}>
                <MotionBox
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  height="100%"
                >
                  <Card 
                    bg={columnBg}
                    mb={4}
                    borderRadius="lg"
                    boxShadow="sm"
                    position="relative"
                    overflow="hidden"
                    borderWidth={2}
                    borderStyle="dashed"
                    borderColor="transparent"
                    transition="all 0.2s"
                    _hover={{
                      borderColor: 'gray.200'
                    }}
                    data-droppable={status}
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
                  <VStack 
                    spacing={4} 
                    align="stretch" 
                    minH="200px"
                    borderRadius="lg"
                    p={2}
                    transition="all 0.2s"
                    id={status}
                  >
                    <SortableContext 
                      items={columns[status].map(t => t.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <AnimatePresence mode="popLayout">
                        {columns[status].map(todo => (
                          <SortableCard
                            key={todo.id}
                            todo={todo}
                            isDragging={activeId === todo.id}
                            onEdit={(todo) => {
                              setEditingTodo(todo);
                              onEditModalOpen();
                            }}
                            onDelete={handleDeleteClick}
                            onStatusChange={handleStatusChange}
                          />
                        ))}
                      </AnimatePresence>
                    </SortableContext>
                  </VStack>
                </MotionBox>
              </Droppable>
            ))}
          </LayoutGroup>
        </Grid>
        <DragOverlay dropAnimation={null}>
          {activeTodo ? (
            <DragOverlayCard todo={activeTodo} />
          ) : null}
        </DragOverlay>
      </DndContext>
    );
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
                      as={ViewIcon} 
                      color={isListView ? accentColor : secondaryTextColor}
                      transition="all 0.2s"
                      transform={isListView ? 'scale(1)' : 'scale(1)'}
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
                      transform={isListView ? 'rotate(0deg)' : 'rotate(90deg)'}
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
                    onClick={onCreateModalOpen}
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
              <Grid templateColumns="repeat(12, 1fr)" gap={4} mb={6}>
                <GridItem colSpan={[12, 12, 6]}>
                  <InputGroup size="md">
                    <InputLeftElement pointerEvents="none">
                      <SearchIcon color={secondaryTextColor} />
                    </InputLeftElement>
                    <Input
                      placeholder="Search tasks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      variant="filled"
                      borderRadius="full"
                      _placeholder={{ color: secondaryTextColor }}
                      color={textColor}
                    />
                  </InputGroup>
                </GridItem>
                <GridItem colSpan={[12, 6, 3]}>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as Todo['status'] | 'all')}
                    variant="filled"
                    size="md"
                    icon={<HamburgerIcon color={secondaryTextColor} />}
                    borderRadius="full"
                    color={textColor}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </Select>
                </GridItem>
                <GridItem colSpan={[12, 6, 3]}>
                  <Select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value as Todo['priority'] | 'all')}
                    variant="filled"
                    size="md"
                    icon={<WarningIcon color={secondaryTextColor} />}
                    borderRadius="full"
                    color={textColor}
                  >
                    <option value="all">All Priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Select>
                </GridItem>
              </Grid>

              <Box>
                <AnimatePresence mode="wait">
                  {isListView ? (
                    <VStack spacing={4} align="stretch" as={motion.div} layout>
                      {todos.map(todo => (
                        <SortableCard
                          key={todo.id}
                          todo={todo}
                          isDragging={false}
                          onEdit={(todo) => {
                            setEditingTodo(todo);
                            onEditModalOpen();
                          }}
                          onDelete={handleDeleteClick}
                          onStatusChange={handleStatusChange}
                        />
                      ))}
                    </VStack>
                  ) : (
                    renderBoardView()
                  )}
                </AnimatePresence>
              </Box>
            </CardBody>
          </Card>
        </VStack>

        {/* Create Task Modal */}
        <Modal isOpen={isCreateModalOpen} onClose={onCreateModalClose} size="xl">
          <ModalOverlay />
          <ModalContent>
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
                      required
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
                      </GridItem>
                    </Grid>
                  </VStack>
                </ModalBody>
                <ModalFooter>
                  <Button variant="ghost" mr={3} onClick={onCreateModalClose}>
                    Cancel
                  </Button>
                  <Button type="submit" colorScheme="blue" leftIcon={<AddIcon />}>
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
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Delete Task
              </AlertDialogHeader>

              <AlertDialogBody>
                Are you sure you want to delete "{todoToDelete?.title}"? This action cannot be undone.
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelDeleteRef} onClick={onDeleteAlertClose}>
                  Cancel
                </Button>
                <Button colorScheme="red" onClick={confirmDelete} ml={3}>
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
