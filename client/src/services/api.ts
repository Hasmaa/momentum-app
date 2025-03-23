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
    
    // See if token was attached as expected
    if (response.config.headers?.Authorization === `Bearer ${expectedToken}`) {
      console.log('✅ INTERCEPTOR TEST: SUCCESS - Token was correctly attached by interceptor');
    } else {
      console.log('❌ INTERCEPTOR TEST: FAILED - Token was not attached or doesn\'t match expected token');
      console.log('Expected:', `Bearer ${expectedToken?.substring(0, 10)}...`);
      console.log('Actual:', response.config.headers?.Authorization?.substring(0, 17) || 'NOT SET');
    }
    
    return {
      success: true,
      tokenMatched: response.config.headers?.Authorization === `Bearer ${expectedToken}`,
      expectedToken: expectedToken ? `${expectedToken.substring(0, 10)}...` : 'NO TOKEN',
      actualHeader: response.config.headers?.Authorization?.substring(0, 17) || 'NOT SET'
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
      console.log('API Request to:', config.url);
      
      // Check if this is a test request
      const isTestRequest = config.headers?.['X-Test-Request'] === 'true';
      if (isTestRequest) {
        console.log('🧪 INTERCEPTOR TEST: Interceptor processing test request');
      }
      
      const token = await getSupabaseToken();
      
      // Always include the token if we have one
      if (token) {
        // Make sure to set Authorization as a string
        config.headers['Authorization'] = `Bearer ${token}`;
        console.log('Authorization header set:', `Bearer ${token.substring(0, 10)}...`);
        
        // WORKAROUND: Also set it directly on the reqConfig.headers for axios
        if (config.headers) {
          if (typeof config.headers.set === 'function') {
            config.headers.set('Authorization', `Bearer ${token}`);
          } else {
            // Direct property access as fallback
            config.headers['Authorization'] = `Bearer ${token}`;
          }
        }
        
        if (isTestRequest) {
          console.log('🧪 INTERCEPTOR TEST: Token added to headers:', `Bearer ${token.substring(0, 10)}...`);
        }
      } else {
        console.warn('⚠️ WARNING: No access token available - request will not be authenticated');
        
        if (isTestRequest) {
          console.log('🧪 INTERCEPTOR TEST: No token available to add to headers');
        }
      }
      
      // Log the final headers for debugging
      console.log('Request headers:', JSON.stringify({
        ...config.headers,
        Authorization: config.headers.Authorization ? 'Bearer ***' : undefined
      }));
    } catch (error) {
      console.error('Error setting auth token:', error);
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
    // Make sure we have the user_id 
    if (!todo.user_id) {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        todo.user_id = data.user.id;
        console.log('Setting user_id from current user:', todo.user_id.substring(0, 8) + '...');
      } else {
        console.error('No authenticated user found when creating todo');
        throw new Error('Cannot create todo: No authenticated user');
      }
    } else {
      console.log('Using provided user_id:', todo.user_id.substring(0, 8) + '...');
    }
    
    console.log('Creating todo with data:', {
      title: todo.title,
      completed: todo.completed,
      user_id: todo.user_id.substring(0, 8) + '...' // Log partial user_id for privacy
    });
    
    const response = await api.post('/todos', todo);
    return response.data;
  },

  // Update a todo
  update: async (id: string, todo: Partial<Todo>): Promise<Todo> => {
    const response = await api.put(`/todos/${id}`, todo);
    return response.data;
  },

  // Delete a todo
  delete: async (id: string): Promise<void> => {
    await api.delete(`/todos/${id}`);
  },
};

// Export the API instance for other API services
export default api; 