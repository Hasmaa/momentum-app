// Task Status Type
export type TaskStatus = 'pending' | 'in-progress' | 'completed';

// Task Priority Type
export type TaskPriority = 'low' | 'medium' | 'high';

// Base Task Interface
export interface BaseTask {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
}

// Full Task Interface
export interface Task extends BaseTask {
  id: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// Task Template Interface
export interface TaskTemplate {
  id: string;
  name: string;
  description?: string;
  tasks: BaseTask[];
  createdAt: string;
  updatedAt: string;
}

// Input Types
export interface TaskCreationInput extends BaseTask {}

export interface TaskUpdateInput extends Partial<BaseTask> {
  id: string;
}

// Filter and Sort Types
export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface SortConfig {
  field: keyof Task;
  direction: 'asc' | 'desc';
}

// Component Props
export interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

// Column Props
export interface TaskColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: TaskStatus) => void;
}

// Modal Props
export interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task;
  onSubmit: (task: TaskCreationInput | TaskUpdateInput) => void;
  isSubmitting: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

// State Types
export interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: ApiError | null;
}

// Statistics Type
export interface TaskStatistics {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  overdue: number;
  completionRate: number;
}

// Action Types
export type TaskAction =
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: ApiError | null };

// Drag and Drop Types
export interface DragItem {
  type: string;
  id: string;
  status: TaskStatus;
}

// Animation Types
export interface AnimationConfig {
  initial: object;
  animate: object;
  exit: object;
  transition: object;
}

// Theme Types
export interface CustomTheme {
  colors: {
    [key: string]: {
      [shade: string]: string;
    };
  };
  components: {
    [component: string]: unknown;
  };
} 