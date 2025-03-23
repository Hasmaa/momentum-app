import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Button, 
  Container, 
  Heading, 
  Text, 
  Code, 
  VStack, 
  Divider, 
  Card, 
  CardBody, 
  useToast, 
  HStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Badge,
  Spinner
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { TodoAPI } from '../services/api';
import api, { testRequestInterceptor } from '../services/api';
import axios from 'axios';

const TestAuth: React.FC = () => {
  const { user, session, checkSession } = useAuth();
  const [testApiResponse, setTestApiResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenFromStorage, setTokenFromStorage] = useState<string | null>(null);
  const [newTodoTitle, setNewTodoTitle] = useState('Test Todo');
  const toast = useToast();

  useEffect(() => {
    // Check for token in localStorage (similar to our API interceptor logic)
    try {
      const supabaseUrlString = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321';
      const hostname = new URL(supabaseUrlString).hostname;
      const storageKey = 'sb-' + hostname.split('.')[0] + '-auth-token';
      
      const storedSession = localStorage.getItem(storageKey);
      if (storedSession) {
        try {
          const parsedSession = JSON.parse(storedSession);
          if (parsedSession?.access_token) {
            setTokenFromStorage(parsedSession.access_token.substring(0, 15) + '...');
          }
        } catch (e) {
          console.error('Error parsing stored session:', e);
        }
      }
    } catch (error) {
      console.error('Error checking storage token:', error);
    }
  }, []);

  // Test the API
  const testApi = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to get todos which requires authentication
      const todos = await TodoAPI.getAll('createdAt', 'desc');
      setTestApiResponse(todos);
      
      toast({
        title: 'API request successful',
        description: `Retrieved ${todos.length} todos`,
        status: 'success',
        duration: 3000,
      });
    } catch (err: any) {
      console.error('API test error:', err);
      setError(err.response?.data?.message || err.message || 'Unknown error');
      
      toast({
        title: 'API request failed',
        description: err.response?.data?.message || err.message || 'Unknown error',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Make direct API request with fetch (bypass axios interceptors)
  const testDirectFetch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Manually construct the fetch request with token
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const token = session?.access_token;
      
      if (!token) {
        throw new Error('No access token available');
      }
      
      const response = await fetch(`${apiUrl}/todos`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setTestApiResponse(data);
      
      toast({
        title: 'Direct fetch successful',
        description: `Retrieved ${data.length} todos`,
        status: 'success',
        duration: 3000,
      });
    } catch (err: any) {
      console.error('Direct fetch error:', err);
      setError(err.message || 'Unknown error');
      
      toast({
        title: 'Direct fetch failed',
        description: err.message || 'Unknown error',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Test direct Axios call
  const testDirectAxios = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Manually construct Axios request with token
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const token = session?.access_token;
      
      if (!token) {
        throw new Error('No access token available');
      }
      
      console.log('Making direct Axios request with token:', token.substring(0, 10) + '...');
      
      const response = await axios.get(`${apiUrl}/todos`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      setTestApiResponse(response.data);
      
      toast({
        title: 'Direct Axios successful',
        description: `Retrieved ${response.data.length} todos`,
        status: 'success',
        duration: 3000,
      });
    } catch (err: any) {
      console.error('Direct Axios error:', err);
      setError(err.response?.data?.message || err.message || 'Unknown error');
      
      toast({
        title: 'Direct Axios failed',
        description: err.response?.data?.message || err.message || 'Unknown error',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Test internal api without interceptors
  const testInternalDirect = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get token and make direct request
      const token = session?.access_token;
      
      if (!token) {
        throw new Error('No access token available');
      }
      
      // Use our API instance but set headers manually
      const response = await api.get('/todos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setTestApiResponse(response.data);
      
      toast({
        title: 'Internal direct successful',
        description: `Retrieved ${response.data.length} todos`,
        status: 'success',
        duration: 3000,
      });
    } catch (err: any) {
      console.error('Internal direct error:', err);
      setError(err.response?.data?.message || err.message || 'Unknown error');
      
      toast({
        title: 'Internal direct failed',
        description: err.response?.data?.message || err.message || 'Unknown error',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Test the interceptor directly
  const testInterceptor = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await testRequestInterceptor();
      setTestApiResponse(result);
      
      if (result.success) {
        toast({
          title: 'Interceptor test completed',
          description: result.tokenMatched 
            ? 'Token was correctly attached!' 
            : 'Token was not correctly attached',
          status: result.tokenMatched ? 'success' : 'warning',
          duration: 3000,
        });
      } else {
        throw new Error('Interceptor test failed');
      }
    } catch (err: any) {
      console.error('Interceptor test error:', err);
      setError(err.message || 'Unknown error during interceptor test');
      
      toast({
        title: 'Interceptor test failed',
        description: err.message || 'Unknown error',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Add function to create a new todo directly with Supabase
  const createTestTodo = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!user) {
        throw new Error('You must be logged in to create a todo');
      }
      
      console.log('Creating todo with user ID:', user.id);
      
      // Try to create a todo which requires authentication
      const newTodo = {
        title: newTodoTitle || 'Test Todo',
        description: 'Created for testing purposes',
        completed: false,
        user_id: user.id // Make sure this exactly matches the authenticated user's ID
      };
      
      const todo = await TodoAPI.create(newTodo);
      setTestApiResponse(todo);
      
      toast({
        title: 'Todo created successfully',
        description: `Created todo with ID: ${todo.id}`,
        status: 'success',
        duration: 3000,
      });
    } catch (err: any) {
      console.error('Create todo error:', err);
      setError(err.response?.data?.message || err.message || 'Unknown error');
      
      toast({
        title: 'Failed to create todo',
        description: err.response?.data?.message || err.message || 'Unknown error',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="container.lg" py={8}>
      <Heading mb={6}>Authentication Test Page</Heading>
      
      <VStack spacing={6} align="stretch">
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>Session Information</Heading>
            
            {/* Token Sources */}
            <Accordion allowToggle mb={4}>
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      Token Sources
                      {session || tokenFromStorage ? (
                        <Badge colorScheme="green" ml={2}>Available</Badge>
                      ) : (
                        <Badge colorScheme="red" ml={2}>Missing</Badge>
                      )}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <VStack align="stretch" spacing={2}>
                    <Box>
                      <Text fontWeight="bold">From Session Context:</Text>
                      <Code p={2} borderRadius="md">
                        {session?.access_token ? 
                          `${session.access_token.substring(0, 15)}...` : 
                          'No token in session context'}
                      </Code>
                    </Box>
                    
                    <Box>
                      <Text fontWeight="bold">From localStorage:</Text>
                      <Code p={2} borderRadius="md">
                        {tokenFromStorage || 'No token in localStorage'}
                      </Code>
                    </Box>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
            
            {/* User Info */}
            <VStack align="stretch" spacing={2}>
              <Text fontWeight="bold">User:</Text>
              <Code p={2} borderRadius="md" maxH="200px" overflow="auto">
                {user ? JSON.stringify(user, null, 2) : 'No user found'}
              </Code>
              
              <Text fontWeight="bold" mt={2}>Session:</Text>
              <Code p={2} borderRadius="md" maxH="200px" overflow="auto">
                {session ? JSON.stringify({
                  ...session,
                  access_token: `${session.access_token.substring(0, 15)}...`, // Truncate for display
                  refresh_token: session.refresh_token ? `${session.refresh_token.substring(0, 10)}...` : null
                }, null, 2) : 'No session found'}
              </Code>
            </VStack>
            
            <Button mt={4} colorScheme="blue" onClick={checkSession}>
              Refresh Session
            </Button>
          </CardBody>
        </Card>
        
        <Divider />
        
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>API Authentication Tests</Heading>
            
            <VStack spacing={4} mb={4} align="stretch">
              <HStack spacing={4}>
                <Button 
                  colorScheme="teal" 
                  onClick={testApi} 
                  isLoading={loading && !error}
                  loadingText="Testing API"
                >
                  Test with Axios
                </Button>
                
                <Button 
                  colorScheme="purple" 
                  onClick={testDirectFetch} 
                  isLoading={loading && !error}
                  loadingText="Fetching"
                >
                  Test with Fetch
                </Button>
              </HStack>
              
              <HStack spacing={4}>
                <Button 
                  colorScheme="blue" 
                  onClick={testDirectAxios} 
                  isLoading={loading && !error}
                  loadingText="Direct Axios"
                >
                  Direct Axios
                </Button>
                
                <Button 
                  colorScheme="orange" 
                  onClick={testInternalDirect} 
                  isLoading={loading && !error}
                  loadingText="Manual Headers"
                >
                  Manual Headers
                </Button>
              </HStack>
              
              <Button 
                colorScheme="pink" 
                onClick={testInterceptor} 
                isLoading={loading && !error}
                loadingText="Testing Interceptor"
              >
                Test Interceptor
              </Button>
            </VStack>
            
            {loading && !error && <Spinner size="sm" mr={2} />}
            
            {error && (
              <Box mt={2} p={3} bg="red.50" color="red.500" borderRadius="md">
                <Text fontWeight="bold">Error:</Text>
                <Text>{error}</Text>
              </Box>
            )}
            
            {testApiResponse && (
              <Box mt={4}>
                <Text fontWeight="bold">API Response:</Text>
                <Code p={2} borderRadius="md" mt={2} maxH="300px" overflow="auto">
                  {JSON.stringify(testApiResponse, null, 2)}
                </Code>
              </Box>
            )}
          </CardBody>
        </Card>
        
        <Card mt={6}>
          <CardBody>
            <Heading size="md" mb={4}>Create Test Todo</Heading>
            
            <VStack align="stretch" spacing={4}>
              <Box>
                <Text fontWeight="bold" mb={2}>Todo Title:</Text>
                <input 
                  value={newTodoTitle}
                  onChange={(e) => setNewTodoTitle(e.target.value)}
                  placeholder="Enter todo title"
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #E2E8F0'
                  }}
                />
              </Box>
              
              <Button 
                colorScheme="green" 
                onClick={createTestTodo} 
                isLoading={loading && !error}
                loadingText="Creating Todo"
              >
                Create Test Todo
              </Button>
            </VStack>
            
            {error && (
              <Box mt={4} p={3} bg="red.50" color="red.500" borderRadius="md">
                <Text fontWeight="bold">Error:</Text>
                <Text>{error}</Text>
              </Box>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default TestAuth; 