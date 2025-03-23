import { supabase } from './supabase';

// The name of the todos table in Supabase
const TODOS_TABLE = 'todos';

export interface Todo {
  id?: string;
  title: string;
  description?: string;
  completed: boolean;
  user_id: string;
  created_at?: string;
  updated_at?: string;
  status?: 'pending' | 'in-progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  tags?: Array<{ id: string; name: string; color: string }>;
}

export const getTodos = async (userId: string) => {
  const { data, error } = await supabase
    .from(TODOS_TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const getTodoById = async (id: string, userId: string) => {
  const { data, error } = await supabase
    .from(TODOS_TABLE)
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();
  
  if (error) throw error;
  return data;
};

export const createTodo = async (todo: Todo) => {
  console.log('Creating todo with data:', { 
    ...todo, 
    user_id: todo.user_id.substring(0, 5) + '...' // Log part of the user_id for debugging
  });
  
  // Create a type that matches what we're inserting
  type TodoInsert = {
    title: string;
    description?: string;
    completed: boolean;
    user_id: string;
    status?: 'pending' | 'in-progress' | 'completed';
    priority?: 'low' | 'medium' | 'high';
    created_at: string;
    updated_at: string;
    tags?: Array<{ id: string; name: string; color: string }>;
    due_date?: string; // Add due_date for Supabase (snake_case)
  };
  
  // Only include basic fields that are guaranteed to exist in the database
  const todoData: TodoInsert = {
    title: todo.title,
    description: todo.description,
    completed: todo.completed,
    user_id: todo.user_id,
    status: todo.status || 'pending',
    priority: todo.priority || 'medium',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  // Add dueDate as due_date (convert from camelCase to snake_case)
  if (todo.dueDate) {
    todoData.due_date = todo.dueDate;
  }
  
  // Add tags if they exist
  if (todo.tags && todo.tags.length > 0) {
    todoData.tags = todo.tags;
  }
  
  // Log what's being inserted into Supabase
  console.log('Inserting into Supabase:', JSON.stringify({
    ...todoData,
    user_id: todoData.user_id.substring(0, 5) + '...' // Log part of the user_id for debugging
  }, null, 2));
  
  try {
    // With service role key, RLS is bypassed
    const { data, error } = await supabase
      .from(TODOS_TABLE)
      .insert(todoData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating todo:', error);
      throw error;
    }
    
    console.log('Todo created successfully with ID:', data.id);
    
    // Map snake_case back to camelCase for the client
    if (data.due_date) {
      data.dueDate = data.due_date;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to create todo:', error);
    throw error;
  }
};

export const updateTodo = async (id: string, todo: Partial<Todo>, userId: string) => {
  const { data, error } = await supabase
    .from(TODOS_TABLE)
    .update({
      ...todo,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteTodo = async (id: string, userId: string) => {
  const { error } = await supabase
    .from(TODOS_TABLE)
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  
  if (error) throw error;
  return { success: true };
}; 