import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Spinner, 
  Center, 
  Text, 
  Button, 
  Flex, 
  useToast, 
  useColorModeValue,
  Heading
} from '@chakra-ui/react';
import { FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard';
import { Task } from '../types';

const AnalyticsDashboardPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  // Enhanced colors for dark mode
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const buttonHoverBg = useColorModeValue('gray.100', 'gray.700');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        // Fetch all tasks without filters for analytics
        const response = await fetch('http://localhost:5001/api/todos');
        
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        
        const data = await response.json();
        setTasks(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch tasks for analytics:', err);
        setError('Failed to load task data. Please try again later.');
        toast({
          title: 'Error loading data',
          description: 'Could not load your task data for analysis.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [toast]);

  return (
    <Box p={4} bg={bgColor} minH="calc(100vh - 64px)">
      <Flex mb={6} alignItems="center">
        <Button 
          as={Link} 
          to="/" 
          leftIcon={<FiArrowLeft />}
          variant="ghost"
          mr={4}
          color={textColor}
          _hover={{ bg: buttonHoverBg }}
        >
          Back to Tasks
        </Button>
      </Flex>

      {isLoading ? (
        <Center h="70vh" flexDirection="column">
          <Spinner size="xl" color="blue.500" mb={4} thickness="4px" />
          <Text color={textColor}>Loading your analytics data...</Text>
        </Center>
      ) : error ? (
        <Center h="50vh" flexDirection="column">
          <Text color="red.500" fontSize="xl" mb={4}>{error}</Text>
          <Button 
            colorScheme="blue" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </Center>
      ) : (
        <AnalyticsDashboard tasks={tasks} />
      )}
    </Box>
  );
};

export default AnalyticsDashboardPage; 