import { useState, useEffect } from 'react';
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
  Badge,
  Divider,
  useColorModeValue,
  Collapse,
  Tooltip,
  Grid,
  GridItem,
  Tag,
  TagLabel,
  TagLeftIcon,
  Flex,
  Spacer,
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
  SimpleGrid
} from '@chakra-ui/react';
import { Todo } from '../types/todo';
import { 
  ChevronUpIcon, 
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
  ViewIcon
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
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { FC, ReactElement } from 'react';

const MotionBox = motion(Box);
const MotionCard = motion(Card);
const MotionFlex = motion(Flex);

const SortableCard = ({ todo, isDragging, onEdit, onDelete }: { 
  todo: Todo; 
  isDragging?: boolean;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <Card
        bg={useColorModeValue('white', 'gray.800')}
        boxShadow={isDragging ? 'lg' : 'sm'}
        borderRadius="lg"
        mb={4}
        opacity={isDragging ? 0.6 : 1}
        transform={isDragging ? 'scale(1.02)' : 'none'}
        transition="all 0.2s"
      >
        <CardBody>
          <VStack spacing={3} align="stretch">
            <Flex justify="space-between" align="center">
              <Heading size="sm">{todo.title}</Heading>
              <HStack spacing={2}>
                <IconButton
                  aria-label="Edit todo"
                  icon={<EditIcon />}
                  size="sm"
                  variant="ghost"
                  colorScheme="blue"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(todo);
                  }}
                />
                <IconButton
                  aria-label="Delete todo"
                  icon={<DeleteIcon />}
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(todo.id);
                  }}
                />
              </HStack>
            </Flex>
            
            {todo.description && (
              <Text fontSize="sm" color="gray.500" noOfLines={2}>
                {todo.description}
              </Text>
            )}
            
            <Flex justify="space-between" align="center">
              <Tag
                size="sm"
                colorScheme={{
                  low: 'green',
                  medium: 'yellow',
                  high: 'red'
                }[todo.priority]}
                variant="subtle"
              >
                {todo.priority}
              </Tag>
              
              <HStack spacing={2}>
                <Tag size="sm" variant="subtle">
                  <TagLeftIcon as={CalendarIcon} />
                  <TagLabel>{format(new Date(todo.dueDate), 'MMM d')}</TagLabel>
                </Tag>
                <Tag 
                  size="sm" 
                  colorScheme={todo.status === 'completed' ? 'green' : todo.status === 'in-progress' ? 'blue' : 'gray'}
                  variant="subtle"
                >
                  {todo.status}
                </Tag>
              </HStack>
            </Flex>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
};

const Dashboard = () => {
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

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.200');
  const columnBg = useColorModeValue('gray.50', 'gray.700');
  const headerBg = useColorModeValue('blue.50', 'gray.700');
  const accentColor = useColorModeValue('blue.500', 'blue.300');

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

  const handleDelete = async (id: string) => {
    if (!id) {
      console.error('No todo id provided');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/todos/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete todo');
      
      fetchTodos();
      toast({
        title: 'Todo deleted successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error deleting todo',
        status: 'error',
        duration: 3000,
      });
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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;

    if (!over) return;

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
    const columns: { [key in Todo['status']]: Todo[] } = {
      'pending': todos.filter(todo => todo.status === 'pending'),
      'in-progress': todos.filter(todo => todo.status === 'in-progress'),
      'completed': todos.filter(todo => todo.status === 'completed')
    };

    const activeTodo = activeId ? todos.find(t => t.id === activeId) : null;

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Grid templateColumns="repeat(3, 1fr)" gap={6} minH="300px">
          <LayoutGroup>
            {(Object.entries(columns) as [Todo['status'], Todo[]][]).map(([status, todos]) => (
              <MotionBox
                key={status}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
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
                    h="2px"
                    bg={status === 'completed' ? 'green.400' : status === 'in-progress' ? 'blue.400' : 'gray.400'}
                  />
                  <CardBody py={3}>
                    <Flex align="center" justify="space-between">
                      <Heading size="md" textTransform="capitalize">
                        {status.replace('-', ' ')}
                      </Heading>
                      <Tag
                        colorScheme={status === 'completed' ? 'green' : status === 'in-progress' ? 'blue' : 'gray'}
                        borderRadius="full"
                        variant="subtle"
                      >
                        {todos.length}
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
                    items={todos.map(t => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <AnimatePresence>
                      {todos.map(todo => (
                        <SortableCard
                          key={todo.id}
                          todo={todo}
                          isDragging={activeId === todo.id}
                          onEdit={(todo) => {
                            setEditingTodo(todo);
                            onEditModalOpen();
                          }}
                          onDelete={handleDelete}
                        />
                      ))}
                    </AnimatePresence>
                  </SortableContext>
                </VStack>
              </MotionBox>
            ))}
          </LayoutGroup>
        </Grid>
        <DragOverlay dropAnimation={null}>
          {activeTodo ? (
            <SortableCard 
              todo={activeTodo} 
              isDragging={true}
              onEdit={(todo) => {
                setEditingTodo(todo);
                onEditModalOpen();
              }}
              onDelete={handleDelete}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    );
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Card bg={headerBg} borderRadius="lg">
          <CardBody>
            <Flex justify="space-between" align="center">
              <Heading size="lg" color={accentColor}>Tasks</Heading>
              <HStack spacing={6}>
                <HStack spacing={3}>
                  <ViewIcon color={accentColor} />
                  <Switch
                    colorScheme="blue"
                    isChecked={!isListView}
                    onChange={() => setIsListView(!isListView)}
                    sx={{
                      '& .chakra-switch__track': {
                        bg: isListView ? 'gray.300' : accentColor,
                      }
                    }}
                  />
                  <Text fontSize="sm" color="gray.500" minW="70px" fontWeight="medium">
                    {isListView ? 'List View' : 'Board View'}
                  </Text>
                </HStack>
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

        <Card borderRadius="lg">
          <CardBody>
            <Grid templateColumns="repeat(12, 1fr)" gap={4} mb={6}>
              <GridItem colSpan={[12, 12, 6]}>
                <InputGroup size="md">
                  <InputLeftElement pointerEvents="none">
                    <SearchIcon color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    variant="filled"
                    borderRadius="full"
                  />
                </InputGroup>
              </GridItem>
              <GridItem colSpan={[12, 6, 3]}>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as Todo['status'] | 'all')}
                  variant="filled"
                  size="md"
                  icon={<HamburgerIcon />}
                  borderRadius="full"
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
                  icon={<WarningIcon />}
                  borderRadius="full"
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
                        onDelete={handleDelete}
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
    </Container>
  );
};

export default Dashboard;
