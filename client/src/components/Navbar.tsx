import { Box, Flex, Button, HStack, Link, useColorMode } from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { FiBarChart2 } from 'react-icons/fi';
import { ActiveTimers } from '../features/pomodoro';

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();

  // Handle selecting a task from the active timers
  const handleSelectTask = (taskId: string) => {
    // Navigate to the dashboard (if not already there)
    navigate('/');
    
    // Find the task element and scroll to it
    setTimeout(() => {
      const taskElement = document.getElementById(`task-${taskId}`);
      if (taskElement) {
        taskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Add a temporary highlight effect
        taskElement.classList.add('task-highlight');
        setTimeout(() => {
          taskElement.classList.remove('task-highlight');
        }, 2000);
      }
    }, 100);
  };

  // Handle completing a task
  const handleCompleteTask = async (taskId: string) => {
    try {
      // Use the same API endpoint that handleStatusChange in Dashboard uses
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: 'completed',
          completedAt: new Date().toISOString()
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update task status');
      }
      
      // Force a page refresh to update the task list
      // This is a simple solution - ideally you would use a global state manager
      // or context to update the task list
      window.location.reload();
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  return (
    <Box px={4} bg={colorMode === 'light' ? 'white' : 'gray.800'} shadow="sm">
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <Box fontWeight="bold">Super Todo</Box>
        
        <HStack spacing={4}>
          <Link as={RouterLink} to="/" px={3} py={2} _hover={{ textDecoration: 'none' }}>
            Tasks
          </Link>
          
          <Link 
            as={RouterLink} 
            to="/analytics" 
            px={3} 
            py={2} 
            display="flex" 
            alignItems="center"
            borderRadius="md"
            _hover={{ 
              textDecoration: 'none', 
              bg: colorMode === 'light' ? 'gray.100' : 'gray.700' 
            }}
          >
            <FiBarChart2 style={{ marginRight: '8px' }} />
            Analytics
          </Link>
          
          <ActiveTimers 
            onSelectTask={handleSelectTask}
            onCompleteTask={handleCompleteTask}
          />
          
          <Button onClick={toggleColorMode} size="sm" ml={4}>
            {colorMode === 'light' ? 'Dark' : 'Light'} Mode
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Navbar;
