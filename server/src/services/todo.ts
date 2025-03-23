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
  
  const { data, error } = await supabase
    .from(TODOS_TABLE)
    .insert({
      ...todo,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating todo:', error);
    throw error;
  }
  return data;
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