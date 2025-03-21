import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  VStack,
  Heading,
  Button,
  Input,
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
  useDisclosure,
  Switch,
  Icon,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Skeleton,
  MenuDivider,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  Progress,
} from '@chakra-ui/react';
import {
  Task,
  TaskStatus,
  TaskPriority,
  SortConfig,
  TaskTemplate,
  Tag as TagType,
  TagFilters
} from '../types';
import { 
  ChevronDownIcon, 
  SearchIcon, 
  CheckIcon,
  TimeIcon,
  WarningIcon,
  AddIcon,
  HamburgerIcon,
  ViewIcon,
  SunIcon,
  MoonIcon,
  CloseIcon,
  RepeatIcon,
  QuestionIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  DeleteIcon,
  EditIcon,
  ExternalLinkIcon,
  SettingsIcon,
  InfoIcon,
} from '@chakra-ui/icons';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragOverlay,
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
  DragStartEvent,
  DragEndEvent,
  DragMoveEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { PropsWithChildren } from 'react';
import SkeletonCard from '../components/SkeletonCard';
import { PREDEFINED_TEMPLATES } from '../types/template';
import TemplateModal from '../components/TemplateModal';
import { useTaskHistory } from '../hooks/useTaskHistory';
import { useAchievements } from '../hooks/useAchievements';
import AchievementsButton from '../components/AchievementsButton';
import AchievementsModal from '../components/AchievementsModal';
import AchievementPopup from '../components/AchievementPopup';
import KeyboardShortcuts from '../components/KeyboardShortcuts';
import { customCollisionDetection, getStatusFromColumnId, getStatusIcon } from './utils';
import { DragOverlayCard } from './DragOverlayCard';
import { SortableCard } from './SortableCard';
import { Droppable } from './Droppable';
import { CreateTaskModal } from './CreateTaskModal';
import { EditTaskModal } from './EditTaskModal';
import { PomodoroModal, PomodoroButton, usePomodoroStore } from '../features/pomodoro';
import { FaClock } from 'react-icons/fa';
// Add import for TagManager
import { TagManager } from '../components/tags/TagManager';
import { MdLabel } from 'react-icons/md';
import { TagFilterBar } from '../components/tags/TagFilterBar';
import { TrophyIcon } from '../components/AchievementIcon';
import { UnifiedFilterBar } from '../components/filters/UnifiedFilterBar';
// Add import for DashboardHeader
import { DashboardHeader } from '../components/DashboardHeader';

const MotionBox = motion(Box);
export const MotionCard = motion(Card);
const MotionFlex = motion(Flex);

// Add the DroppableProps interface definition
export interface DroppableProps extends PropsWithChildren {
  id: string;
}

type StatusType = Task['status'] | 'all';
type PriorityType = Task['priority'] | 'all';

interface DashboardProps {
  initialTasks?: Task[];
}

// Define the transition object
const transition = {
  enter: { type: "tween", duration: 0.2 },
  exit: { type: "tween", duration: 0.2 }
} as const;

const Dashboard: React.FC<DashboardProps> = ({ initialTasks = [] }) => {
  const {
    tasks: todos,
    updateTasks: setTodos  } = useTaskHistory(initialTasks);
  
  // Add achievements state
  const {
    achievements,
    recentlyUnlocked,
    checkAchievements,
    hasUnlocked,
    dismissRecentAchievement,
    getProgressPercentage
  } = useAchievements();
  
  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState(false);

  const { 
    isOpen: isShortcutsOpen, 
    onOpen: onShortcutsOpen, 
    onClose: onShortcutsClose 
  } = useDisclosure();

  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [status, setStatus] = useState<TaskStatus>('pending');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [editingTodo, setEditingTodo] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState<Set<TaskStatus | 'all'>>(new Set(['all']));
  const [filterPriority, setFilterPriority] = useState<Set<TaskPriority | 'all'>>(new Set(['all']));
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'createdAt',
    direction: 'desc'
  });
  const [selectedTodos, setSelectedTodos] = useState<Set<string>>(new Set());
  const [updatingTodoIds, setUpdatingTodoIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isSelectMode, setIsSelectMode] = useState<boolean>(false);
  const [todoToDelete, setTodoToDelete] = useState<Task | null>(null);
  const [newTaskTags, setNewTaskTags] = useState<TagType[]>([]);
  // Inside the Dashboard component, add state for TagManager
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  // Add tag filter state
  const [tagFilters, setTagFilters] = useState<TagFilters>({
    selectedTags: [],
    matchType: 'any'
  });
 
  const toast = useToast({
    position: 'top-right',
    duration: 3000,
    isClosable: true,
  });
  const [isListView, setIsListView] = useState(false);
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
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);
  const [pomodoroTask, setPomodoroTask] = useState<Task | null>(null);

  // Add state for Pomodoro timer display in header
  const [pomodoroActive, setPomodoroActive] = useState(false);
  const [pomodoroTimeRemaining, setPomodoroTimeRemaining] = useState('');

  const mainBg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const textColor = useColorModeValue('gray.700', 'gray.100');
  const columnBg = useColorModeValue('gray.50', 'gray.800');
  const headerBg = useColorModeValue('blue.50', 'gray.800');
  const accentColor = useColorModeValue('blue.500', 'blue.200');
  const secondaryTextColor = useColorModeValue('gray.500', 'gray.400');
  const ghostButtonHoverBg = useColorModeValue('blue.50', 'whiteAlpha.200');

  const cancelDeleteRef = useRef<HTMLButtonElement>(null);
  const { 
    isOpen: isDeleteAlertOpen, 
    onOpen: onDeleteAlertOpen, 
    onClose: onDeleteAlertClose 
  } = useDisclosure();

  // Add state for filter sidebar
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);

  // Function to toggle the filter sidebar
  const toggleFilterSidebar = () => {
    setIsFilterSidebarOpen(!isFilterSidebarOpen);
  };

  // Check if any filters are active
  const hasActiveFilters = filterStatus.size > 1 || 
                          filterPriority.size > 1 || 
                          searchQuery.trim() !== '' || 
                          tagFilters.selectedTags.length > 0;
  
  const clearFilters = () => {
    setFilterStatus(new Set(['all']));
    setFilterPriority(new Set(['all']));
    setSearchQuery('');
    // Clear tag filters
    setTagFilters({
      selectedTags: [],
      matchType: 'any'
    });
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

  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Keyboard shortcut handler
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in input fields
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }

    // Command/Ctrl + K to focus search
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      const searchInput = document.querySelector('[placeholder="Search tasks..."]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    }

    // Command/Ctrl + N to create new task
    if ((event.metaKey || event.ctrlKey) && event.key === 'n') {
      event.preventDefault();
      _onCreateModalOpen();
    }

    // Command/Ctrl + T to use template
    if ((event.metaKey || event.ctrlKey) && event.key === 't') {
      event.preventDefault();
      setIsTemplateModalOpen(true);
    }

    // Command/Ctrl + / to toggle view mode
    if ((event.metaKey || event.ctrlKey) && event.key === '/') {
      event.preventDefault();
      setIsListView(!isListView);
    }

    // Command/Ctrl + S to toggle select mode
    if ((event.metaKey || event.ctrlKey) && event.key === 's') {
      event.preventDefault();
      setIsSelectMode(!isSelectMode);
    }

    // Command/Ctrl + A to toggle select all
    if ((event.metaKey || event.ctrlKey) && event.key === 'a') {
      event.preventDefault();
      setIsSelectMode(!isSelectMode);
      if (!isSelectMode) {
        // Select all visible todos
        const visibleTodos = todos.filter(todo => {
          const matchesStatus = filterStatus.has('all') || filterStatus.has(todo.status);
          const matchesPriority = filterPriority.has('all') || filterPriority.has(todo.priority);
          const matchesSearch = !searchQuery || 
            todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (todo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
          return matchesStatus && matchesPriority && matchesSearch;
        });
        setSelectedTodos(new Set(visibleTodos.map(t => t.id)));
      } else {
        setSelectedTodos(new Set());
      }
    }

    // Escape to clear selection
    if (event.key === 'Escape') {
      setIsSelectMode(false);
      setSelectedTodos(new Set());
    }
  }, [isListView, isSelectMode, todos, filterStatus, filterPriority, searchQuery, _onCreateModalOpen]);

  // Add keyboard event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  // Add keyboard shortcut for showing shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?') {
        onShortcutsOpen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onShortcutsOpen]);

  // Bulk action handlers
  const handleBulkDelete = async () => {
    if (selectedTodos.size === 0) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch('http://localhost:5001/api/todos/bulk/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          todoIds: Array.from(selectedTodos)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete tasks');
      }

      const result = await response.json();
      fetchTodos();
      setSelectedTodos(new Set());
      setIsSelectMode(false);
      
      toast({
        title: result.message,
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error deleting tasks',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkStatusChange = async (newStatus: Task['status']) => {
    if (selectedTodos.size === 0) return;
    
    try {
      const response = await fetch('http://localhost:5001/api/todos/bulk/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          todoIds: Array.from(selectedTodos),
          updates: { status: newStatus }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update tasks');
      }

      const result = await response.json();
      fetchTodos();
      setSelectedTodos(new Set());
      setIsSelectMode(false);
      
      toast({
        title: result.message,
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error updating tasks',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleBulkCapitalize = async () => {
    if (selectedTodos.size === 0) return;
    
    try {
      const response = await fetch('http://localhost:5001/api/todos/bulk/capitalize', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          todoIds: Array.from(selectedTodos)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to capitalize tasks');
      }

      const result = await response.json();
      fetchTodos();
      setSelectedTodos(new Set());
      setIsSelectMode(false);
      
      toast({
        title: result.message,
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error capitalizing tasks',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error',
        duration: 3000,
      });
    }
  };

  // Toggle selection of a single todo
  const toggleTodoSelection = (todoId: string) => {
    const newSelection = new Set(selectedTodos);
    if (newSelection.has(todoId)) {
      newSelection.delete(todoId);
    } else {
      newSelection.add(todoId);
    }
    setSelectedTodos(newSelection);
  };

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
      
      // Add tag filtering
      if (tagFilters.selectedTags.length > 0) {
        tagFilters.selectedTags.forEach(tag => 
          params.append('tagIds', tag.id)
        );
        params.append('tagMatchType', tagFilters.matchType);
      }
      
      if (searchQuery) params.append('search', searchQuery);
      params.append('sortField', sortConfig.field);
      params.append('sortDirection', sortConfig.direction);

      const response = await fetch(`http://localhost:5001/api/todos?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      toast({
        title: 'Error fetching tasks',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [filterStatus, filterPriority, searchQuery, sortConfig, tagFilters]);

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
          tags: newTaskTags, // Add tags to the request
        }),
      });
      
      if (!response.ok) throw new Error('Failed to create todo');
      
      setTitle('');
      setDescription('');
      setDueDate(new Date().toISOString().split('T')[0]);
      setPriority('medium');
      setStatus('pending');
      setNewTaskTags([]); // Reset tags
      onCreateModalClose();
      fetchTodos();
      
      toast({
        title: 'Todo created successfully',
        status: 'success',
        duration: 3000,
      });

      // Check for achievements after creating a task
      checkAchievements(await fetchTodosForAchievements());
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

  const handleDeleteClick = async (todo: Task) => {
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

      // Check for achievements after deleting a task
      checkAchievements(await fetchTodosForAchievements());
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

  const handleStatusChange = async (id: string, newStatus: Task['status']) => {
    setUpdatingTodoIds(prev => new Set(prev).add(id));
    try {
      const response = await fetch(`http://localhost:5001/api/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task status');
      }

      await fetchTodos();
      toast({
        title: 'Task status updated',
        status: 'success',
        duration: 3000,
      });

      // Check for achievements after status change
      checkAchievements(await fetchTodosForAchievements());
    } catch (error) {
      toast({
        title: 'Error updating task status',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setUpdatingTodoIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleEdit = async (todo: Task) => {
    if (!editingTodo) {
      setEditingTodo(todo);
      onEditModalOpen();
      return;
    }

    // Validate that the task has a title
    if (!todo.title.trim()) {
      toast({
        title: 'Title is required',
        status: 'error',
        duration: 3000,
      });
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
          tags: todo.tags || [], // Include tags in the update
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

      // Check for achievements after editing a task
      checkAchievements(await fetchTodosForAchievements());
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




  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    console.log('Drag ended:', event);
    setActiveId(null);
    const { active, over, activatorEvent } = event;

    if (!over) return;

    const todoId = active.id as string;
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;

    // Get the container ID and determine if it's a column or item
    const overId = over.id.toString();
    const isColumn = overId.startsWith('column-');
    
    // Get the target status and calculate new order
    let newStatus: Task['status'];
    let newOrder: number;
    
    if (isColumn) {
      // Dropping directly on a column
      newStatus = getStatusFromColumnId(overId) || todo.status;
      
      // If dropping in the same column, do nothing
      if (newStatus === todo.status) return;
      
      const statusTodos = todos
        .filter(t => t.status === newStatus)
        .sort((a, b) => a.order - b.order);
      
      // Place at the end of the column
      newOrder = statusTodos.length > 0 
        ? Math.max(...statusTodos.map(t => t.order)) + 1 
        : 0;
    } else {
      // Dropping on another item
      const overTodo = todos.find(t => t.id === overId);
      if (!overTodo) return;
      
      newStatus = overTodo.status;
      const statusTodos = todos
        .filter(t => t.status === newStatus)
        .sort((a, b) => a.order - b.order);
      
      const overIndex = statusTodos.findIndex(t => t.id === overId);
      if (overIndex === -1) return;

      // Calculate the new order based on surrounding items
      if (todo.status === newStatus) {
        // Same column reordering
        const currentIndex = statusTodos.findIndex(t => t.id === todoId);
        if (currentIndex === -1) return;
        
        // If dropping on itself, do nothing
        if (currentIndex === overIndex) return;

        if (currentIndex < overIndex) {
          // Moving down
          newOrder = overIndex === statusTodos.length - 1
            ? overTodo.order + 1
            : (overTodo.order + statusTodos[overIndex + 1].order) / 2;
        } else {
          // Moving up
          newOrder = overIndex === 0
            ? overTodo.order - 1
            : (overTodo.order + statusTodos[overIndex - 1].order) / 2;
        }
      } else {
        // Cross-column drop on an item
        // Calculate order based on drop position relative to the target item
        const { y: pointerY } = activatorEvent as PointerEvent;
        const overRect = over.rect;
        
        if (overRect) {
          const overMiddleY = overRect.top + overRect.height / 2;
          
          if (pointerY < overMiddleY) {
            // Dropping above the target item
            newOrder = overIndex === 0
              ? overTodo.order - 1
              : (overTodo.order + statusTodos[overIndex - 1].order) / 2;
          } else {
            // Dropping below the target item
            newOrder = overIndex === statusTodos.length - 1
              ? overTodo.order + 1
              : (overTodo.order + statusTodos[overIndex + 1].order) / 2;
          }
        } else {
          // Fallback if we can't determine position
          newOrder = overTodo.order - 0.5;
        }
      }
    }

    setUpdatingTodoIds(prev => new Set(prev).add(todoId));

    try {
      // Optimistically update UI
      const updatedTodos = todos.map(t => 
        t.id === todoId 
          ? { ...t, status: newStatus, order: newOrder }
          : t
      );
      setTodos(updatedTodos.sort((a, b) => a.order - b.order));

      // Make the API call
      const response = await fetch(`http://localhost:5001/api/todos/${todoId}/move`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          newOrder,
          status: newStatus
        }),
      });
      
      if (!response.ok) throw new Error('Failed to update todo');

      const updatedTodo = await response.json();
      console.log('Server response:', updatedTodo);

      // Update local state with the server response
      const finalTodos = todos.map(t => 
        t.id === todoId ? updatedTodo : t
      );
      setTodos(finalTodos.sort((a, b) => a.order - b.order));

      // Check for drag and drop achievements
      checkAchievements(todos, { type: 'drag_drop' });

    } catch (error) {
      console.error('Error moving todo:', error);
      toast({
        title: 'Error moving task',
        description: 'The task has been returned to its original position',
        status: 'error',
        duration: 3000,
      });
      fetchTodos();
    } finally {
      setUpdatingTodoIds(prev => {
        const next = new Set(prev);
        next.delete(todoId);
        return next;
      });
    }
  };

  // Add function to fetch todos for achievement checks
  const fetchTodosForAchievements = async (): Promise<Task[]> => {
    try {
      const response = await fetch('http://localhost:5001/api/todos');
      if (!response.ok) {
        throw new Error('Failed to fetch tasks for achievement check');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching tasks for achievement check:', error);
      return todos; // Fall back to current state if fetch fails
    }
  };

  // Check achievements on initial load
  useEffect(() => {
    if (!isLoading && !isInitialLoad && todos.length > 0) {
      checkAchievements(todos);
    }
  }, [isLoading, isInitialLoad]);

  const renderBoardView = () => {
    if (isLoading) {
      if (isInitialLoad) {
        return (
          <Grid templateColumns="repeat(3, 1fr)" gap={6}>
            {['pending', 'in-progress', 'completed'].map((status) => (
              <GridItem key={status}>
                <Card bg={columnBg} borderRadius="lg" boxShadow="sm">
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

      return (
        <Box position="relative">
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            height="2px"
            bg="blue.500"
            zIndex={1}
            as={motion.div}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.5 } as any}
          />
          <Box opacity={0.7}>
            <DndContext
              sensors={sensors}
              collisionDetection={customCollisionDetection}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <Grid 
                templateColumns="repeat(3, 1fr)" 
                gap={6} 
                flex="1" 
                overflow="hidden" 
                position="relative"
              >
                {(['pending', 'in-progress', 'completed'] as const).map((status) => (
                  <GridItem 
                    key={status} 
                    display="flex" 
                    flexDirection="column" 
                    height="100%" 
                    maxH="100%" 
                    overflow="hidden"
                  >
                    <Droppable id={`column-${status}`}>
                      <Card 
                        bg={columnBg}
                        borderRadius="lg"
                        boxShadow="sm"
                        position="relative"
                        overflow="hidden"
                        width="100%"
                        flexShrink={0}
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
                              {todos.filter(todo => todo.status === status).length}
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
                        sx={{
                          '&::-webkit-scrollbar': {
                            width: '8px',
                            borderRadius: '8px',
                            backgroundColor: `rgba(0, 0, 0, 0.05)`,
                          },
                          '&::-webkit-scrollbar-thumb': {
                            backgroundColor: `rgba(0, 0, 0, 0.1)`,
                            borderRadius: '8px',
                            '&:hover': {
                              backgroundColor: `rgba(0, 0, 0, 0.2)`,
                            },
                          },
                        }}
                      >
                        <SortableContext 
                          items={todos.filter(todo => todo.status === status).map(t => t.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <VStack spacing={4} align="stretch" width="100%">
                            {todos.filter(todo => todo.status === status).length > 0 ? (
                              todos.filter(todo => todo.status === status).map(todo => (
                                <SortableCard
                                  key={todo.id}
                                  todo={todo}
                                  isDragging={activeId === todo.id}
                                  isUpdating={updatingTodoIds.has(todo.id)}
                                  onEdit={handleEdit}
                                  onDelete={handleDeleteClick}
                                  onStatusChange={handleStatusChange}
                                  isSelected={selectedTodos.has(todo.id)}
                                  isSelectMode={isSelectMode}
                                  onToggleSelect={toggleTodoSelection}
                                />
                              ))
                            ) : (
                              <MotionFlex
                                direction="column"
                                align="center"
                                justify="center"
                                py={8}
                                px={4}
                                borderRadius="xl"
                                borderWidth="2px"
                                borderStyle="dashed"
                                borderColor={useColorModeValue('gray.200', 'gray.600')}
                                bg={useColorModeValue('gray.50', 'gray.700')}
                                transition="all 0.3s"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ 
                                  scale: 1.02,
                                  borderColor: status === 'completed' ? 'green.400' : status === 'in-progress' ? 'blue.400' : 'gray.400',
                                  boxShadow: 'lg'
                                }}
                              >
                                <VStack spacing={6} py={4}>
                                  <MotionBox
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ 
                                      type: "spring",
                                      stiffness: 260,
                                      damping: 20 
                                    }}
                                  >
                                    <Icon
                                      as={status === 'completed' ? CheckIcon : status === 'in-progress' ? TimeIcon : WarningIcon}
                                      boxSize="12"
                                      color={`${status === 'completed' ? 'green' : status === 'in-progress' ? 'blue' : 'gray'}.400`}
                                      opacity={0.9}
                                    />
                                  </MotionBox>
                                  <VStack spacing={3}>
                                    <Heading 
                                      size="md" 
                                      textAlign="center"
                                      color={status === 'completed' ? 'green.500' : status === 'in-progress' ? 'blue.500' : 'gray.500'}
                                    >
                                      {status === 'pending' ? (
                                        "Ready to start something new?"
                                      ) : status === 'in-progress' ? (
                                        "Time to make progress!"
                                      ) : (
                                        "Achievement unlocked!"
                                      )}
                                    </Heading>
                                    <Text 
                                      color={secondaryTextColor} 
                                      fontSize="sm"
                                      textAlign="center"
                                      maxW="sm"
                                      lineHeight="tall"
                                    >
                                      {status === 'pending' ? (
                                        "This is where your journey begins. Add your first task or drag existing tasks here to get started."
                                      ) : status === 'in-progress' ? (
                                        "Track your active tasks here. Drag tasks from 'Pending' when you start working on them."
                                      ) : (
                                        "This is where your completed tasks will shine. Drag tasks here when you've conquered them!"
                                      )}
                                    </Text>
                                    <HStack spacing={2} pt={2}>
                                      <Button
                                        size="md"
                                        colorScheme={status === 'completed' ? 'green' : status === 'in-progress' ? 'blue' : 'gray'}
                                        leftIcon={<AddIcon />}
                                        onClick={() => {
                                          setStatus(status);
                                          _onCreateModalOpen();
                                        }}
                                        variant="solid"
                                        px={8}
                                        _hover={{
                                          transform: 'translateY(-2px)',
                                          boxShadow: 'md'
                                        }}
                                      >
                                        {status === 'pending' ? (
                                          "Add Your First Task"
                                        ) : status === 'in-progress' ? (
                                          "Start a New Task"
                                        ) : (
                                          "Add Completed Task"
                                        )}
                                      </Button>
                                    </HStack>
                                  </VStack>
                                </VStack>
                              </MotionFlex>
                            )}
                          </VStack>
                        </SortableContext>
                      </Box>
                    </Droppable>
                  </GridItem>
                ))}
              </Grid>
              <DragOverlay dropAnimation={null}>
                {activeId ? <DragOverlayCard todo={todos.find(t => t.id === activeId)!} /> : null}
              </DragOverlay>
            </DndContext>
          </Box>
        </Box>
      );
    }

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={customCollisionDetection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Grid 
          templateColumns="repeat(3, 1fr)" 
          gap={6} 
          height="calc(100vh - 250px)"
          position="relative"
          overflow="hidden"
        >
          {(['pending', 'in-progress', 'completed'] as const).map((status) => (
            <GridItem 
              key={status} 
              display="flex" 
              flexDirection="column" 
              height="100%" 
              overflow="hidden"
            >
              <Droppable id={`column-${status}`}>
                <Box
                  height="100%"
                  display="flex"
                  flexDirection="column"
                  overflow="hidden"
                >
                  <Card 
                    bg={columnBg}
                    borderRadius="lg"
                    boxShadow="sm"
                    position="relative"
                    overflow="hidden"
                    width="100%"
                    flexShrink={0}
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
                          {todos.filter(todo => todo.status === status).length}
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
                    minHeight={0}
                    sx={{
                      '&::-webkit-scrollbar': {
                        width: '8px',
                        borderRadius: '8px',
                        backgroundColor: `rgba(0, 0, 0, 0.05)`,
                      },
                      '&::-webkit-scrollbar-thumb': {
                        backgroundColor: `rgba(0, 0, 0, 0.1)`,
                        borderRadius: '8px',
                        '&:hover': {
                          backgroundColor: `rgba(0, 0, 0, 0.2)`,
                        },
                      },
                    }}
                  >
                    <SortableContext 
                      items={todos.filter(todo => todo.status === status).map(t => t.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <VStack spacing={4} align="stretch" width="100%">
                        {todos.filter(todo => todo.status === status).length > 0 ? (
                          todos.filter(todo => todo.status === status).map(todo => (
                            <SortableCard
                              key={todo.id}
                              todo={todo}
                              isDragging={activeId === todo.id}
                              isUpdating={updatingTodoIds.has(todo.id)}
                              onEdit={handleEdit}
                              onDelete={handleDeleteClick}
                              onStatusChange={handleStatusChange}
                              isSelected={selectedTodos.has(todo.id)}
                              isSelectMode={isSelectMode}
                              onToggleSelect={toggleTodoSelection}
                            />
                          ))
                        ) : (
                          <MotionFlex
                            direction="column"
                            align="center"
                            justify="center"
                            py={8}
                            px={4}
                            borderRadius="xl"
                            borderWidth="2px"
                            borderStyle="dashed"
                            borderColor={useColorModeValue('gray.200', 'gray.600')}
                            bg={useColorModeValue('gray.50', 'gray.700')}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ 
                              scale: 1.02,
                              borderColor: status === 'completed' ? 'green.400' : status === 'in-progress' ? 'blue.400' : 'gray.400',
                              boxShadow: 'lg'
                            }}
                          >
                            <VStack spacing={6} py={4}>
                              <MotionBox
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ 
                                  type: "spring",
                                  stiffness: 260,
                                  damping: 20 
                                }}
                              >
                                <Icon
                                  as={status === 'completed' ? CheckIcon : status === 'in-progress' ? TimeIcon : WarningIcon}
                                  boxSize="12"
                                  color={`${status === 'completed' ? 'green' : status === 'in-progress' ? 'blue' : 'gray'}.400`}
                                  opacity={0.9}
                                />
                              </MotionBox>
                              <VStack spacing={3}>
                                <Heading 
                                  size="md" 
                                  textAlign="center"
                                  color={status === 'completed' ? 'green.500' : status === 'in-progress' ? 'blue.500' : 'gray.500'}
                                >
                                  {status === 'pending' ? (
                                    "Ready to start something new?"
                                  ) : status === 'in-progress' ? (
                                    "Time to make progress!"
                                  ) : (
                                    "Achievement unlocked!"
                                  )}
                                </Heading>
                                <Text 
                                  color={secondaryTextColor} 
                                  fontSize="sm"
                                  textAlign="center"
                                  maxW="sm"
                                  lineHeight="tall"
                                >
                                  {status === 'pending' ? (
                                    "This is where your journey begins. Add your first task or drag existing tasks here to get started."
                                  ) : status === 'in-progress' ? (
                                    "Track your active tasks here. Drag tasks from 'Pending' when you start working on them."
                                  ) : (
                                    "This is where your completed tasks will shine. Drag tasks here when you've conquered them!"
                                  )}
                                </Text>
                                <HStack spacing={2} pt={2}>
                                  <Button
                                    size="md"
                                    colorScheme={status === 'completed' ? 'green' : status === 'in-progress' ? 'blue' : 'gray'}
                                    leftIcon={<AddIcon />}
                                    onClick={() => {
                                      setStatus(status);
                                      _onCreateModalOpen();
                                    }}
                                    variant="solid"
                                    px={6}
                                    _hover={{
                                      transform: 'translateY(-2px)',
                                      boxShadow: 'md'
                                    }}
                                  >
                                    {status === 'pending' ? (
                                      "Add Your First Task"
                                    ) : status === 'in-progress' ? (
                                      "Start a New Task"
                                    ) : (
                                      "Add Completed Task"
                                    )}
                                  </Button>
                                  
                                </HStack>
                              </VStack>
                            </VStack>
                          </MotionFlex>
                        )}
                      </VStack>
                    </SortableContext>
                  </Box>
                </Box>
              </Droppable>
            </GridItem>
          ))}
        </Grid>
        <DragOverlay dropAnimation={null}>
          {activeId ? <DragOverlayCard todo={todos.find(t => t.id === activeId)!} /> : null}
        </DragOverlay>
      </DndContext>
    );
  };

  // Add a wrapper for onCreateModalOpen that can handle initial status
  const onCreateModalOpen = (initialStatus?: Task['status']) => {
    if (initialStatus) {
      setStatus(initialStatus);
    }
    _onCreateModalOpen();
  };

  const toastBgColor = useColorModeValue('white', 'gray.700');
  const progressBgColor = useColorModeValue('gray.100', 'gray.600');
  
  const handleTemplateSelect = async (template: TaskTemplate) => {
    setIsTemplateModalOpen(false);
    setIsSubmitting(true);
    
    // Show initial toast with loading state
    const loadingToastId = toast({
      title: `Creating tasks from template "${template.name}"`,
      description: (
        <Box p={3} borderRadius="md">
          <VStack align="stretch" spacing={3}>
            <Text fontSize="sm">Setting up your workflow...</Text>
            <Progress 
              size="sm" 
              isIndeterminate 
              colorScheme="blue"
              borderRadius="full"
              bg={progressBgColor}
            />
          </VStack>
        </Box>
      ),
      status: 'loading',
      duration: null,
      isClosable: false,
      position: 'top-right',
    });
    
    try {
      // Create all tasks from the template with a slight delay between each
      for (let i = 0; i < template.tasks.length; i++) {
        const task = template.tasks[i];
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + (typeof task.dueDate === 'number' ? task.dueDate : 0));
        
        await fetch('http://localhost:5001/api/todos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...task,
            dueDate: dueDate.toISOString(),
          }),
        });

        // Update progress toast
        toast.update(loadingToastId, {
          description: (
            <Box  borderRadius="md">
              <VStack align="stretch" spacing={3}>
                <Text fontSize="sm">
                  Created {i + 1} of {template.tasks.length} tasks...
                </Text>
                <Progress 
                  size="sm" 
                  value={((i + 1) / template.tasks.length) * 100} 
                  colorScheme="blue"
                  borderRadius="full"
                  bg={progressBgColor}
                  sx={{
                    '& > div': {
                      transition: 'all 0.3s ease-in-out',
                    }
                  }}
                />
              </VStack>
            </Box>
          ),
        });

        // Add a small delay for visual effect
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      await fetchTodos();
      
      // Close loading toast and show success toast with animation
      toast.close(loadingToastId);
      toast({
        title: 'Template tasks created!',
        description: (
          <Box 
            p={4} 
            borderRadius="md" 
          >
            <MotionBox
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20
              }}
            >
              <VStack align="start" spacing={3}>
                <Text>Successfully created {template.tasks.length} tasks from "{template.name}"</Text>
                <HStack spacing={2}>
                  <Icon as={CheckIcon}  />
                  <Text fontSize="sm" >Your workflow is ready to go!</Text>
                </HStack>
              </VStack>
            </MotionBox>
          </Box>
        ),
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });

      // Check for template use achievements
      checkAchievements(
        await fetchTodosForAchievements(), 
        { 
          type: 'template_use', 
          templateIds: [template.id] 
        }
      );
    } catch (error) {
      // Close loading toast and show error toast
      toast.close(loadingToastId);
      toast({
        title: 'Error creating tasks',
        description: (
          <Box bg={toastBgColor} p={3} borderRadius="md">
            <Text color="red.500">
              {error instanceof Error ? error.message : 'An unexpected error occurred'}
            </Text>
          </Box>
        ),
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onPomodoroOpen = useCallback((taskId?: string) => {
    console.log('[Dashboard] Opening Pomodoro modal for task:', taskId || 'no specific task');
    
    // Get the store state using getState to avoid affecting hook order
    const storeState = usePomodoroStore.getState();
    
    if (taskId) {
      // Find the task in our list
      const task = todos.find(t => t.id === taskId);
      
      if (task) {
        // Set the task for the global timer and open the modal
        console.log('[Dashboard] Setting selected task:', task.id);
        setPomodoroTask(task);
        setIsPomodoroOpen(true);
      } else {
        console.log('[Dashboard] Task not found:', taskId);
        setIsPomodoroOpen(true); // Open without a task
      }
    } else {
      // No task ID provided, just open the modal
      console.log('[Dashboard] Opening modal without a task');
      setPomodoroTask(null);
      setIsPomodoroOpen(true);
    }
  }, [todos]);

  // Helper function to handle Task to taskId conversion for Pomodoro
  const handlePomodoroForTask = useCallback((task: Task) => {
    onPomodoroOpen(task.id);
  }, [onPomodoroOpen]);

  // Listen for the custom event to open the Pomodoro modal
  useEffect(() => {
    const handleOpenPomodoroEvent = () => {
      // Open the Pomodoro modal with the current task (if any)
      setIsPomodoroOpen(true);
    };

    window.addEventListener('open-pomodoro-modal', handleOpenPomodoroEvent);
    
    return () => {
      window.removeEventListener('open-pomodoro-modal', handleOpenPomodoroEvent);
    };
  }, []);

  // Add openTagManager function
  const openTagManager = () => {
    setIsTagManagerOpen(true);
  };

  // Add closeTagManager function
  const closeTagManager = () => {
    setIsTagManagerOpen(false);
    // Fetch todos after tag management to ensure UI is updated
    fetchTodos();
  };

  // Update the tag filters
  const handleTagFiltersChange = (newTagFilters: TagFilters) => {
    setTagFilters(newTagFilters);
  };

  // Clear only tag filters
  const handleClearTagFilters = () => {
    setTagFilters({
      selectedTags: [],
      matchType: 'any'
    });
  };

  // Add useEffect for custom events from Navbar
  useEffect(() => {
    // Event listener for opening the Pomodoro modal from Navbar
    const handleOpenPomodoroEvent = () => {
      setIsPomodoroOpen(true);
    };
    
    // Event listener for creating a new task from Navbar
    const handleCreateNewTask = () => {
      onCreateModalOpen();
    };
    
    // Event listener for opening the tag manager from Navbar
    const handleOpenTagManager = () => {
      openTagManager();
    };
    
    // Add event listeners
    window.addEventListener('open-pomodoro-modal', handleOpenPomodoroEvent);
    window.addEventListener('create-new-task', handleCreateNewTask);
    window.addEventListener('open-tag-manager', handleOpenTagManager);
    
    // Cleanup event listeners on unmount
    return () => {
      window.removeEventListener('open-pomodoro-modal', handleOpenPomodoroEvent);
      window.removeEventListener('create-new-task', handleCreateNewTask);
      window.removeEventListener('open-tag-manager', handleOpenTagManager);
    };
  }, []);

  // Add keyboard navigation for the task cards 
  useEffect(() => {
    const handleKeyNavigation = (e: KeyboardEvent) => {
      // Only enable these shortcuts when not editing text fields
      if (
        document.activeElement &&
        (document.activeElement.tagName === 'INPUT' ||
          document.activeElement.tagName === 'TEXTAREA')
      ) {
        return;
      }

      // If in select mode, allow using arrow keys to navigate between tasks
      if (isSelectMode && todos.length > 0) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          
          // Find the currently focused task
          const focusedTodoId = Array.from(selectedTodos).pop();
          const todoIndex = focusedTodoId 
            ? todos.findIndex(t => t.id === focusedTodoId) 
            : -1;
          
          let newIndex = 0;
          if (e.key === 'ArrowDown') {
            newIndex = todoIndex >= 0 ? Math.min(todoIndex + 1, todos.length - 1) : 0;
          } else {
            newIndex = todoIndex > 0 ? todoIndex - 1 : 0;
          }
          
          // Toggle the selection
          toggleTodoSelection(todos[newIndex].id);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyNavigation);
    return () => window.removeEventListener('keydown', handleKeyNavigation);
  }, [isSelectMode, todos, selectedTodos, toggleTodoSelection]);

  // Add transition effects for view switching
  const getPageTransition = () => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.2 }
  });

  // Effect for Pomodoro timer changes
  useEffect(() => {
    // Subscribe to Pomodoro store changes
    const unsubscribe = usePomodoroStore.subscribe(() => {
      const timer = usePomodoroStore.getState().timer;
      
      if (timer && timer.isRunning) {
        setPomodoroActive(true);
        
        // Format time as MM:SS
        const mins = Math.floor(timer.remainingTime / 60000);
        const secs = Math.floor((timer.remainingTime % 60000) / 1000);
        setPomodoroTimeRemaining(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      } else {
        setPomodoroActive(false);
        setPomodoroTimeRemaining('');
      }
    });
    
    // Check initial state
    const timer = usePomodoroStore.getState().timer;
    if (timer && timer.isRunning) {
      setPomodoroActive(true);
      const mins = Math.floor(timer.remainingTime / 60000);
      const secs = Math.floor((timer.remainingTime % 60000) / 1000);
      setPomodoroTimeRemaining(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    }
    
    return () => unsubscribe();
  }, []);

  return (
    <Box bg={mainBg} minH="100vh" transition="background-color 0.2s">
      <Container 
        maxW="container.xl" 
        py={8} 
        height={isListView ? "auto" : "100vh"} 
        display="flex" 
        flexDirection="column"
      >
        <VStack 
          spacing={6} 
          align="stretch" 
          flex="1" 
          overflow={isListView ? "visible" : "hidden"}
          minHeight={0}
        >
          <Card 
            bg={headerBg} 
            borderRadius="xl" 
            boxShadow="sm"
            borderColor={borderColor} 
            borderWidth="1px" 
            flexShrink={0}
            overflow="hidden"
          >
            <Box 
              position="absolute" 
              top={0} 
              left={0} 
              right={0} 
              height="3px" 
              bg="linear-gradient(90deg, #3182CE 0%, #63B3ED 100%)" 
            />
            <CardBody py={4}>
              <DashboardHeader
                selectedTodos={selectedTodos}
                isSelectMode={isSelectMode}
                onClearSelection={() => {
                  setIsSelectMode(false);
                  setSelectedTodos(new Set());
                }}
                onCreateTask={() => onCreateModalOpen()}
                onOpenTemplate={() => setIsTemplateModalOpen(true)}
                onToggleView={() => setIsListView(!isListView)}
                isListView={isListView}
                onOpenTagManager={openTagManager}
                onOpenAchievements={() => setIsAchievementsModalOpen(true)}
                onOpenPomodoro={() => setIsPomodoroOpen(true)}
                onOpenShortcuts={onShortcutsOpen}
                onBulkStatusChange={handleBulkStatusChange}
                onBulkCapitalize={handleBulkCapitalize}
                onBulkDelete={handleBulkDelete}
                recentlyUnlocked={!!recentlyUnlocked}
                pomodoroActive={pomodoroActive}
                pomodoroTimeRemaining={pomodoroTimeRemaining}
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                onToggleFilterSidebar={toggleFilterSidebar}
                hasActiveFilters={hasActiveFilters}
              />
            </CardBody>
          </Card>
          
          <Card borderRadius="lg" bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <VStack spacing={4} align="stretch">
                {/* Filter Sidebar (replaces the inline UnifiedFilterBar) */}
                <UnifiedFilterBar
                  filterStatus={filterStatus}
                  onStatusFilterChange={handleStatusFilter}
                  filterPriority={filterPriority}
                  onPriorityFilterChange={handlePriorityFilter}
                  searchQuery={searchQuery}
                  tagFilters={tagFilters}
                  onTagFiltersChange={handleTagFiltersChange}
                  onClearAllFilters={clearFilters}
                  isOpen={isFilterSidebarOpen}
                  onClose={() => setIsFilterSidebarOpen(false)}
                />

                <Box>
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      isInitialLoad ? (
                        <VStack spacing={4} align="stretch" width="100%">
                          {[...Array(6)].map((_, index) => (
                            <SkeletonCard key={index} />
                          ))}
                        </VStack>
                      ) : (
                        <Box position="relative">
                          <Box
                            position="absolute"
                            top={0}
                            left={0}
                            right={0}
                            height="2px"
                            bg="blue.500"
                            zIndex={1}
                            as={motion.div}
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 0.5 } as any}
                          />
                          <Box opacity={0.7}>
                            {isListView ? (
                              <DndContext
                                sensors={sensors}
                                collisionDetection={customCollisionDetection}
                                onDragStart={handleDragStart}
                                onDragEnd={handleDragEnd}
                              >
                                <Box overflow="visible">
                                  <Accordion 
                                    defaultIndex={[0, 1, 2]} 
                                    allowMultiple 
                                    as={motion.div} 
                                    layout
                                  >
                                    {(['pending', 'in-progress', 'completed'] as const).map(status => {
                                      const statusTodos = todos.filter(todo => todo.status === status);
                                      return (
                                        <Droppable id={`column-${status}`} key={status}>
                                          <AccordionItem
                                            border="none"
                                            mb={status !== 'completed' ? 6 : 0}
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
                                                          onEdit={handleEdit}
                                                          onDelete={handleDeleteClick}
                                                          onStatusChange={handleStatusChange}
                                                          isSelected={selectedTodos.has(todo.id)}
                                                          isSelectMode={isSelectMode}
                                                          onToggleSelect={toggleTodoSelection}
                                                          
                                                        />
                                                      ))
                                                    ) : (
                                                      <MotionFlex
                                                        direction="column"
                                                        align="center"
                                                        justify="center"
                                                        py={8}
                                                        px={4}
                                                        borderRadius="xl"
                                                        borderWidth="2px"
                                                        borderStyle="dashed"
                                                        borderColor={useColorModeValue('gray.200', 'gray.600')}
                                                        bg={useColorModeValue('gray.50', 'gray.700')}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        whileHover={{ 
                                                          scale: 1.02,
                                                          borderColor: status === 'completed' ? 'green.400' : status === 'in-progress' ? 'blue.400' : 'gray.400',
                                                          boxShadow: 'lg'
                                                        }}
                                                      >
                                                        <VStack spacing={6} py={4}>
                                                          <MotionBox
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            transition={{ 
                                                              type: "spring",
                                                              stiffness: 260,
                                                              damping: 20 
                                                            }}
                                                          >
                                                            <Icon
                                                              as={status === 'completed' ? CheckIcon : status === 'in-progress' ? TimeIcon : WarningIcon}
                                                              boxSize="12"
                                                              color={`${status === 'completed' ? 'green' : status === 'in-progress' ? 'blue' : 'gray'}.400`}
                                                              opacity={0.9}
                                                            />
                                                          </MotionBox>
                                                          <VStack spacing={3}>
                                                            <Heading 
                                                              size="md" 
                                                              textAlign="center"
                                                              color={status === 'completed' ? 'green.500' : status === 'in-progress' ? 'blue.500' : 'gray.500'}
                                                            >
                                                              {status === 'pending' ? (
                                                                "Ready to start something new?"
                                                              ) : status === 'in-progress' ? (
                                                                "Time to make progress!"
                                                              ) : (
                                                                "Achievement unlocked!"
                                                              )}
                                                            </Heading>
                                                            <Text 
                                                              color={secondaryTextColor} 
                                                              fontSize="sm"
                                                              textAlign="center"
                                                              maxW="sm"
                                                              lineHeight="tall"
                                                            >
                                                              {status === 'pending' ? (
                                                                "This is where your journey begins. Add your first task or drag existing tasks here to get started."
                                                              ) : status === 'in-progress' ? (
                                                                "Track your active tasks here. Drag tasks from 'Pending' when you start working on them."
                                                              ) : (
                                                                "This is where your completed tasks will shine. Drag tasks here when you've conquered them!"
                                                              )}
                                                            </Text>
                                                            <HStack spacing={2} pt={2}>
                                                              <Button
                                                                size="md"
                                                                colorScheme={status === 'completed' ? 'green' : status === 'in-progress' ? 'blue' : 'gray'}
                                                                leftIcon={<AddIcon />}
                                                                onClick={() => {
                                                                  setStatus(status);
                                                                  onCreateModalOpen();
                                                                }}
                                                                variant="solid"
                                                                px={6}
                                                                _hover={{
                                                                  transform: 'translateY(-2px)',
                                                                  boxShadow: 'md'
                                                                }}
                                                              >
                                                                {status === 'pending' ? (
                                                                  "Add Your First Task"
                                                                ) : status === 'in-progress' ? (
                                                                  "Start a New Task"
                                                                ) : (
                                                                  "Add Completed Task"
                                                                )}
                                                              </Button>
                                                            </HStack>
                                                          </VStack>
                                                        </VStack>
                                                      </MotionFlex>
                                                    )}
                                                  </VStack>
                                                </SortableContext>
                                              </Box>
                                            </AccordionPanel>
                                          </AccordionItem>
                                        </Droppable>
                                      );
                                    })}
                                  </Accordion>
                                </Box>
                                <DragOverlay dropAnimation={null}>
                                  {activeId ? (
                                    <DragOverlayCard todo={todos.find(t => t.id === activeId)!} />
                                  ) : null}
                                </DragOverlay>
                              </DndContext>
                            ) : (
                              renderBoardView()
                            )}
                          </Box>
                        </Box>
                      )
                    ) : (
                      isListView ? (
                        <DndContext
                          sensors={sensors}
                          collisionDetection={customCollisionDetection}
                          onDragStart={handleDragStart}
                          onDragEnd={handleDragEnd}
                        >
                          <Box overflow="visible">
                            <Accordion 
                              defaultIndex={[0, 1, 2]} 
                              allowMultiple 
                              as={motion.div} 
                              layout
                            >
                              {(['pending', 'in-progress', 'completed'] as const).map(status => {
                                const statusTodos = todos.filter(todo => todo.status === status);
                                
                                return (
                                  <Droppable id={`column-${status}`} key={status}>
                                    <AccordionItem
                                      border="none"
                                      mb={status !== 'completed' ? 6 : 0}
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
                                                    onEdit={handleEdit}
                                                    onDelete={handleDeleteClick}
                                                    onStatusChange={handleStatusChange}
                                                    isSelected={selectedTodos.has(todo.id)}
                                                    isSelectMode={isSelectMode}
                                                    onToggleSelect={toggleTodoSelection}
                                                    
                                                  />
                                                ))
                                              ) : (
                                                <MotionFlex
                                                  direction="column"
                                                  align="center"
                                                  justify="center"
                                                  py={8}
                                                  px={4}
                                                  borderRadius="xl"
                                                  borderWidth="2px"
                                                  borderStyle="dashed"
                                                  borderColor={useColorModeValue('gray.200', 'gray.600')}
                                                  bg={useColorModeValue('gray.50', 'gray.700')}
                                                  initial={{ opacity: 0, y: 20 }}
                                                  animate={{ opacity: 1, y: 0 }}
                                                  whileHover={{ 
                                                    scale: 1.02,
                                                    borderColor: status === 'completed' ? 'green.400' : status === 'in-progress' ? 'blue.400' : 'gray.400',
                                                    boxShadow: 'lg'
                                                  }}
                                                >
                                                  <VStack spacing={6} py={4}>
                                                    <MotionBox
                                                      initial={{ scale: 0 }}
                                                      animate={{ scale: 1 }}
                                                      transition={{ 
                                                        type: "spring",
                                                        stiffness: 260,
                                                        damping: 20 
                                                      }}
                                                    >
                                                      <Icon
                                                        as={status === 'completed' ? CheckIcon : status === 'in-progress' ? TimeIcon : WarningIcon}
                                                        boxSize="12"
                                                        color={`${status === 'completed' ? 'green' : status === 'in-progress' ? 'blue' : 'gray'}.400`}
                                                        opacity={0.9}
                                                      />
                                                    </MotionBox>
                                                    <VStack spacing={3}>
                                                      <Heading 
                                                        size="md" 
                                                        textAlign="center"
                                                        color={status === 'completed' ? 'green.500' : status === 'in-progress' ? 'blue.500' : 'gray.500'}
                                                      >
                                                        {status === 'pending' ? (
                                                          "Ready to start something new?"
                                                        ) : status === 'in-progress' ? (
                                                          "Time to make progress!"
                                                        ) : (
                                                          "Achievement unlocked!"
                                                        )}
                                                      </Heading>
                                                      <Text 
                                                        color={secondaryTextColor} 
                                                        fontSize="sm"
                                                        textAlign="center"
                                                        maxW="sm"
                                                        lineHeight="tall"
                                                      >
                                                        {status === 'pending' ? (
                                                          "This is where your journey begins. Add your first task or drag existing tasks here to get started."
                                                        ) : status === 'in-progress' ? (
                                                          "Track your active tasks here. Drag tasks from 'Pending' when you start working on them."
                                                        ) : (
                                                          "This is where your completed tasks will shine. Drag tasks here when you've conquered them!"
                                                        )}
                                                      </Text>
                                                      <HStack spacing={2} pt={2}>
                                                        <Button
                                                          size="md"
                                                          colorScheme={status === 'completed' ? 'green' : status === 'in-progress' ? 'blue' : 'gray'}
                                                          leftIcon={<AddIcon />}
                                                          onClick={() => {
                                                            setStatus(status);
                                                            onCreateModalOpen();
                                                          }}
                                                          variant="solid"
                                                          px={6}
                                                          _hover={{
                                                            transform: 'translateY(-2px)',
                                                            boxShadow: 'md'
                                                          }}
                                                        >
                                                          {status === 'pending' ? (
                                                            "Add Your First Task"
                                                          ) : status === 'in-progress' ? (
                                                            "Start a New Task"
                                                          ) : (
                                                            "Add Completed Task"
                                                          )}
                                                        </Button>
                                                        
                                                      </HStack>
                                                    </VStack>
                                                  </VStack>
                                                </MotionFlex>
                                              )}
                                            </VStack>
                                          </SortableContext>
                                        </Box>
                                      </AccordionPanel>
                                    </AccordionItem>
                                  </Droppable>
                                );
                              })}
                            </Accordion>
                          </Box>
                          <DragOverlay dropAnimation={null}>
                            {activeId ? (
                              <DragOverlayCard todo={todos.find(t => t.id === activeId)!} />
                            ) : null}
                          </DragOverlay>
                        </DndContext>
                      ) : (
                        renderBoardView()
                      )
                    )}
                  </AnimatePresence>
                </Box>
              </VStack>
            </CardBody>
          </Card>
        </VStack>

        <CreateTaskModal 
          isCreateModalOpen={isCreateModalOpen}
          onCreateModalClose={onCreateModalClose}
          handleSubmit={handleSubmit}
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          priority={priority}
          setPriority={setPriority}
          status={status}
          setStatus={setStatus}
          dueDate={dueDate}
          setDueDate={setDueDate}
          isSubmitting={isSubmitting}
          tags={newTaskTags}
          setTags={setNewTaskTags}
        />

        <EditTaskModal 
          isEditModalOpen={isEditModalOpen} 
          onEditModalClose={onEditModalClose} 
          handleEdit={handleEdit} 
          editingTodo={editingTodo} 
          setEditingTodo={setEditingTodo} 
          isSubmitting={isSubmitting}         
        />

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
              transition={transition as any}
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

        {/* Template Modal */}
        <TemplateModal
          isOpen={isTemplateModalOpen}
          onClose={() => setIsTemplateModalOpen(false)}
          templates={PREDEFINED_TEMPLATES}
          onSelectTemplate={handleTemplateSelect as any}
        />

        {/* Achievement popup notification */}
        <AchievementPopup 
          achievement={recentlyUnlocked} 
          onClose={dismissRecentAchievement} 
        />
        
        {/* Achievements Modal */}
        <AchievementsModal 
          isOpen={isAchievementsModalOpen}
          onClose={() => setIsAchievementsModalOpen(false)}
          achievements={achievements}
          recentlyUnlocked={recentlyUnlocked}
          getProgressPercentage={getProgressPercentage}
        />
        
        {/* Add the Pomodoro Modal */}
        <PomodoroModal
          isOpen={isPomodoroOpen}
          onClose={() => setIsPomodoroOpen(false)}
          selectedTask={pomodoroTask}
          tasks={todos}
          onTaskComplete={async (taskId: string) => {
            await handleStatusChange(taskId, 'completed');
          }}
          onCreateTask={() => _onCreateModalOpen()}
        />
        {/* Add the TagManager modal at the end of the component, before the closing tag */}
        <TagManager 
          isOpen={isTagManagerOpen}
          onClose={closeTagManager}
          onTagsUpdated={fetchTodos}
        />
      </Container>
      <KeyboardShortcuts isOpen={isShortcutsOpen} onClose={onShortcutsClose} />
    </Box>
  );
};

export default Dashboard;
