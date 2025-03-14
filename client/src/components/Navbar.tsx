import { Box, Flex, Button, HStack, Link, useColorMode, useToast } from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { FiBarChart2 } from 'react-icons/fi';
import { ActiveTimers } from '../features/pomodoro';

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();
  const toast = useToast();

  // Handle opening the Pomodoro modal
  const handleOpenPomodoro = () => {
    // Navigate to the dashboard (if not already there)
    navigate('/');
    
    // Dispatch a custom event that Dashboard can listen for
    const event = new CustomEvent('open-pomodoro-modal');
    window.dispatchEvent(event);
    
    toast({
      title: 'Pomodoro Timer',
      description: 'Opening timer details',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
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
            onOpenPomodoro={handleOpenPomodoro}
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
