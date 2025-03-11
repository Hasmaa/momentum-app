import fs from 'fs/promises';
import path from 'path';

const dataPath = path.join(__dirname, '../data/todos.json');

export interface Todo {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  order: number;
}

interface TodoData {
  todos: Todo[];
}

export interface FilterOptions {
  status?: Todo['status'][];
  priority?: Todo['priority'][];
  search?: string;
}

export interface SortOptions {
  field: keyof Todo;
  direction: 'asc' | 'desc';
}

export async function readTodos(
  filters?: FilterOptions,
  sort?: SortOptions
): Promise<Todo[]> {
  const data = await fs.readFile(dataPath, 'utf8');
  let todos = JSON.parse(data).todos as Todo[];

  // Apply filters
  if (filters) {
    if (filters.status && filters.status.length > 0) {
      todos = todos.filter(todo => filters.status!.includes(todo.status));
    }
    if (filters.priority && filters.priority.length > 0) {
      todos = todos.filter(todo => filters.priority!.includes(todo.priority));
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      todos = todos.filter(todo =>
        todo.title.toLowerCase().includes(searchLower) ||
        todo.description?.toLowerCase().includes(searchLower)
      );
    }
  }

  // Apply sorting
  if (sort) {
    todos.sort((a, b) => {
      const aValue = a[sort.field];
      const bValue = b[sort.field];
      
      // Handle undefined values in comparison
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return 1;
      if (bValue === undefined) return -1;
      
      if (sort.direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return bValue < aValue ? -1 : bValue > aValue ? 1 : 0;
      }
    });
  }

  return todos;
}

export async function writeTodos(todos: Todo[]): Promise<void> {
  await fs.writeFile(dataPath, JSON.stringify({ todos }, null, 2));
}

export async function createTodo(todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt' | 'order'>): Promise<Todo> {
  const todos = await readTodos();
  const statusTodos = todos.filter(t => t.status === todoData.status);
  const order = statusTodos.length > 0 
    ? Math.max(...statusTodos.map(t => t.order)) + 1 
    : 0;

  const newTodo: Todo = {
    ...todoData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    order
  };
  
  todos.push(newTodo);
  await writeTodos(todos);
  return newTodo;
}

export async function updateTodo(id: string, updates: Partial<Todo>): Promise<Todo | null> {
  const todos = await readTodos();
  const index = todos.findIndex(todo => todo.id === id);
  
  if (index === -1) return null;

  const oldTodo = todos[index];
  
  // If status is changing, handle the order
  if (updates.status && updates.status !== oldTodo.status) {
    const statusTodos = todos.filter(t => t.status === updates.status);
    const newOrder = statusTodos.length > 0 
      ? Math.max(...statusTodos.map(t => t.order)) + 1 
      : 0;
    
    // Update orders for old status
    todos.forEach(t => {
      if (t.status === oldTodo.status && t.order > oldTodo.order) {
        t.order -= 1;
      }
    });
    
    updates.order = newOrder;
  }
  
  todos[index] = {
    ...todos[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  await writeTodos(todos);
  return todos[index];
}

export async function deleteTodo(id: string): Promise<boolean> {
  const todos = await readTodos();
  const filteredTodos = todos.filter(todo => todo.id !== id);
  
  if (filteredTodos.length === todos.length) return false;
  
  await writeTodos(filteredTodos);
  return true;
}

export async function moveTodo(id: string, newStatus: Todo['status'], newOrder: number): Promise<Todo | null> {
  const todos = await readTodos();
  const todoIndex = todos.findIndex(todo => todo.id === id);
  
  if (todoIndex === -1) return null;
  
  const todo = todos[todoIndex];
  const oldOrder = todo.order;
  const oldStatus = todo.status;

  // If status is changing, handle reordering for both statuses
  if (newStatus !== oldStatus) {
    // Remove from old status list and update orders
    todos.forEach(t => {
      if (t.status === oldStatus && t.order > oldOrder) {
        t.order -= 1;
      }
    });

    // Make space in new status list
    todos.forEach(t => {
      if (t.status === newStatus && t.order >= newOrder) {
        t.order += 1;
      }
    });

    // Update the todo
    todos[todoIndex] = {
      ...todo,
      status: newStatus,
      order: newOrder,
      updatedAt: new Date().toISOString()
    };
  } else {
    // Same status, just reorder
    todos.forEach(t => {
      if (t.status === newStatus) {
        if (oldOrder < newOrder && t.order <= newOrder && t.order > oldOrder) {
          t.order -= 1;
        }
        if (oldOrder > newOrder && t.order >= newOrder && t.order < oldOrder) {
          t.order += 1;
        }
      }
    });
    todos[todoIndex].order = newOrder;
    todos[todoIndex].updatedAt = new Date().toISOString();
  }

  await writeTodos(todos);
  return todos[todoIndex];
} 