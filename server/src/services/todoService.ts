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

export async function createTodo(todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>): Promise<Todo> {
  const todos = await readTodos();
  const newTodo: Todo = {
    ...todoData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  todos.push(newTodo);
  await writeTodos(todos);
  return newTodo;
}

export async function updateTodo(id: string, updates: Partial<Todo>): Promise<Todo | null> {
  const todos = await readTodos();
  const index = todos.findIndex(todo => todo.id === id);
  
  if (index === -1) return null;
  
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