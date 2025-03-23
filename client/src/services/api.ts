import axios from 'axios';
import { supabase } from './supabase';

// Function to get the current Supabase token
const getSupabaseToken = async (): Promise<string | null> => {
  try {
    // First try to get the session through the API
    const { data } = await supabase.auth.getSession();
    const sessionFromApi = data.session;
    
    if (sessionFromApi?.access_token) {
      console.log('Found session via Supabase API:', sessionFromApi.access_token.substring(0, 10) + '...');
      return sessionFromApi.access_token;
    }
    
    // If that fails, try localStorage as a fallback
    const supabaseUrlString = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321';
    const hostname = new URL(supabaseUrlString).hostname;
    const storageKey = 'sb-' + hostname.split('.')[0] + '-auth-token';
    
    const storedSession = localStorage.getItem(storageKey);
    
    if (storedSession) {
      try {
        const parsedSession = JSON.parse(storedSession);
        if (parsedSession?.access_token) {
          console.log('Found session in localStorage:', parsedSession.access_token.substring(0, 10) + '...');
          return parsedSession.access_token;
        }
      } catch (e) {
        console.error('Error parsing stored session:', e);
      }
    }
    
    // Last resort - check if there's a token directly in localStorage
    const directToken = localStorage.getItem('supabase.auth.token');
    if (directToken) {
      try {
        const parsed = JSON.parse(directToken);
        if (parsed?.access_token) {
          console.log('Found direct token in localStorage:', parsed.access_token.substring(0, 10) + '...');
          return parsed.access_token;
        }
      } catch (e) {
        console.error('Error parsing direct token:', e);
      }
    }
    
    console.warn('⚠️ No valid session token found');
    return null;
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
};


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Debug function to test if the interceptor is working
export const testRequestInterceptor = async () => {
  console.log('🧪 INTERCEPTOR TEST: Starting');
  console.log('🧪 INTERCEPTOR TEST: Getting token...');
  
  // First log the token we expect to use
  const expectedToken = await getSupabaseToken();
  console.log('🧪 INTERCEPTOR TEST: Token retrieved:', expectedToken ? `${expectedToken.substring(0, 10)}...` : 'NO TOKEN FOUND');
  
  // Make a test request that will use the interceptor
  console.log('🧪 INTERCEPTOR TEST: Making test request...');
  try {
    // We'll use a health endpoint or similar that doesn't need authentication
    // Just to see if the interceptor attaches the token
    const response = await api.get('/health', {
      // Add a custom header to identify this as a test request
      headers: {
        'X-Test-Request': 'true'
      }
    });
    
    console.log('🧪 INTERCEPTOR TEST: Request succeeded', {
      status: response.status,
      data: response.data,
      // Check if the config in the response has the authorization header
      authHeader: response.config.headers?.Authorization || 'NOT SET'
    });
    
    // Get the actual auth header value
    const authHeader = response.config.headers?.Authorization;
    const authHeaderStr = typeof authHeader === 'string' ? authHeader : 'NOT SET';
    
    // See if token was attached as expected
    if (authHeaderStr === `Bearer ${expectedToken}`) {
      console.log('✅ INTERCEPTOR TEST: SUCCESS - Token was correctly attached by interceptor');
    } else {
      console.log('❌ INTERCEPTOR TEST: FAILED - Token was not attached or doesn\'t match expected token');
      console.log('Expected:', `Bearer ${expectedToken?.substring(0, 10)}...`);
      console.log('Actual:', typeof authHeader === 'string' ? authHeaderStr.substring(0, 17) : 'NOT SET');
    }
    
    return {
      success: true,
      tokenMatched: authHeaderStr === `Bearer ${expectedToken}`,
      expectedToken: expectedToken ? `${expectedToken.substring(0, 10)}...` : 'NO TOKEN',
      actualHeader: typeof authHeader === 'string' ? authHeaderStr.substring(0, 17) : 'NOT SET'
    };
  } catch (error) {
    console.log('🧪 INTERCEPTOR TEST: Request failed', error);
    return {
      success: false,
      error: error
    };
  }
};

// Add request interceptor to include auth token
api.interceptors.request.use(
  async (config) => {
    try {
      console.log(`API Request to: ${config.method?.toUpperCase()} ${config.url}`);
      
      // Check if this is a test request
      const isTestRequest = config.headers?.['X-Test-Request'] === 'true';
      if (isTestRequest) {
        console.log('🧪 INTERCEPTOR TEST: Interceptor processing test request');
      }
      
      const token = await getSupabaseToken();
      
      // Always include the token if we have one
      if (token) {
        console.log(`[${config.method?.toUpperCase()}] Adding authorization token to request`);
        
        // Make sure to set Authorization as a string
        config.headers['Authorization'] = `Bearer ${token}`;
        console.log(`[${config.method?.toUpperCase()}] Authorization header set:`, `Bearer ${token.substring(0, 10)}...`);
        
        // Check that the header is actually there after setting
        console.log(`[${config.method?.toUpperCase()}] Verifying header was set:`, config.headers['Authorization'] ? 'YES' : 'NO');
        
        // WORKAROUND: Also set it directly on the reqConfig.headers for axios
        if (config.headers) {
          if (typeof config.headers.set === 'function') {
            console.log(`[${config.method?.toUpperCase()}] Using .set() method on headers`);
            config.headers.set('Authorization', `Bearer ${token}`);
          } else {
            // Direct property access as fallback
            console.log(`[${config.method?.toUpperCase()}] Using direct property assignment`);
            config.headers['Authorization'] = `Bearer ${token}`;
          }
        }
        
        if (isTestRequest) {
          console.log('🧪 INTERCEPTOR TEST: Token added to headers:', `Bearer ${token.substring(0, 10)}...`);
        }
      } else {
        console.warn(`⚠️ [${config.method?.toUpperCase()}] WARNING: No access token available - request will not be authenticated`);
        
        if (isTestRequest) {
          console.log('🧪 INTERCEPTOR TEST: No token available to add to headers');
        }
      }
      
      // Log the final headers for debugging
      console.log(`[${config.method?.toUpperCase()}] Final request headers:`, JSON.stringify({
        ...config.headers,
        Authorization: config.headers.Authorization ? 'Bearer ***' : undefined
      }));
    } catch (error) {
      console.error(`[${config.method?.toUpperCase()}] Error setting auth token:`, error);
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log(`API Response from ${response.config.url}: Status ${response.status}`);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('API error:', error.response.status, error.response.data);
      console.error('Request that caused error:', {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers?.Authorization ? 
                { ...error.config.headers, Authorization: 'Bearer ***' } : 
                error.config?.headers
      });
    } else {
      console.error('API error with no response:', error.message);
    }
    return Promise.reject(error);
  }
);

// Todo interfaces
export interface Todo {
  id?: string;
  title: string;
  description?: string;
  completed: boolean;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  status?: string;
  priority?: string;
  due_date?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
  tags?: { id: string; name: string; color: string }[];
}

// Todo API methods
export const TodoAPI = {
  // Get all todos
  getAll: async (sortField?: string, sortDirection?: string): Promise<Todo[]> => {
    const params = new URLSearchParams();
    if (sortField) params.append('sortField', sortField);
    if (sortDirection) params.append('sortDirection', sortDirection);
    
    const url = `/todos${params.toString() ? '?' + params.toString() : ''}`;
    
    // Extra debug logging
    const token = await getSupabaseToken();
    console.log('TodoAPI.getAll - Token available:', !!token);
    
    const response = await api.get(url);
    return response.data;
  },

  // Get a single todo
  getById: async (id: string): Promise<Todo> => {
    const response = await api.get(`/todos/${id}`);
    return response.data;
  },

  // Create a new todo
  create: async (todo: Omit<Todo, 'id'>): Promise<Todo> => {
    console.log('📝 TodoAPI.create - Starting with data:', {
      title: todo.title,
      status: todo.status,
      priority: todo.priority
    });
    
    // Get the current user to set user_id correctly
    try {
      console.log('📝 TodoAPI.create - Getting current session directly from supabase');
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        console.error('📝 TodoAPI.create - No active Supabase session found');
        throw new Error('Authentication required: No active session');
      }
      
      console.log('📝 TodoAPI.create - Session found, user ID:', 
        sessionData.session.user.id.substring(0, 8) + '...');
      
      // IMPORTANT: Always set the user_id to match the session user exactly
      todo.user_id = sessionData.session.user.id;
      
      console.log('📝 TodoAPI.create - Checking token validity:', 
        sessionData.session.access_token.substring(0, 10) + '...');
      
      console.log('📝 TodoAPI.create - Final todo data with user_id:', {
        title: todo.title,
        completed: todo.completed,
        status: todo.status,
        priority: todo.priority,
        user_id: todo.user_id?.substring(0, 8) + '...' // Log partial user_id for privacy
      });
      
      try {
        console.log('📝 TodoAPI.create - Sending POST request to /todos');
        
        // For extra debugging, add auth header manually in addition to interceptor
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.session.access_token}`
        };
        
        console.log('📝 TodoAPI.create - Using headers:', {
          ...headers,
          'Authorization': headers.Authorization ? 'Bearer ***' : undefined
        });
        
        const response = await api.post('/todos', todo, { headers });
        console.log('📝 TodoAPI.create - Request successful, received response');
        return response.data;
      } catch (error: any) {
        console.error('📝 TodoAPI.create - Server error:', error.response?.data || error);
        console.error('📝 TodoAPI.create - Error status:', error.response?.status);
        console.error('📝 TodoAPI.create - Request payload:', JSON.stringify(todo, null, 2));
        throw error;
      }
    } catch (error) {
      console.error('📝 TodoAPI.create - Authentication error:', error);
      throw error;
    }
  },

  // Update a todo
  update: async (id: string, todo: Partial<Todo>): Promise<Todo> => {
    console.log('🔄 TodoAPI.update - Starting update for todo:', id.substring(0, 8) + '...');
    
    try {
      // Don't allow changing user_id in updates to prevent RLS issues
      if (todo.user_id) {
        console.warn('🔄 TodoAPI.update - Removing user_id from update payload for security');
        delete todo.user_id;
      }
      
      console.log('🔄 TodoAPI.update - Sending update with data:', {
        ...todo,
        id: id.substring(0, 8) + '...'
      });
      
      const response = await api.put(`/todos/${id}`, todo);
      console.log('🔄 TodoAPI.update - Update successful');
      return response.data;
    } catch (error) {
      console.error('🔄 TodoAPI.update - Error updating todo:', error);
      throw error;
    }
  },

  // Delete a todo
  delete: async (id: string): Promise<void> => {
    await api.delete(`/todos/${id}`);
  },
  
  // Bulk operations
  bulkDelete: async (todoIds: string[]): Promise<any> => {
    const response = await api.post('/todos/bulk/delete', { todoIds });
    return response.data;
  },
  
  bulkUpdate: async (todoIds: string[], updates: Partial<Todo>): Promise<any> => {
    const response = await api.put('/todos/bulk/update', { todoIds, updates });
    return response.data;
  },
  
  bulkCapitalize: async (todoIds: string[]): Promise<any> => {
    const response = await api.put('/todos/bulk/capitalize', { todoIds });
    return response.data;
  },
  
  // Move todo (for drag and drop)
  moveTodo: async (todoId: string, toStatus: string, index: number): Promise<any> => {
    const response = await api.post(`/todos/${todoId}/move`, { 
      status: toStatus, 
      order: index 
    });
    return response.data;
  }
};

// Export the API instance for other API services
export default api; 