import { Box, Flex, Button, HStack, Link, useColorMode, useToast, Text, Tooltip } from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { FiBarChart2 } from 'react-icons/fi';
import { FaClock } from 'react-icons/fa';
import { ActiveTimers } from '../features/pomodoro';
import { useState } from 'react';
import { keyframes } from '@emotion/react';

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();
  const toast = useToast();
  const [isHovered, setIsHovered] = useState(false);

  // Keyframes for the pulse animation
  const pulseAnimation = keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  `;
  
  // Keyframes for the clock animation
  const rotateAnimation = keyframes`
    0% { transform: rotate(0deg); }
    25% { transform: rotate(3deg); }
    75% { transform: rotate(-3deg); }
    100% { transform: rotate(0deg); }
  `;

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
          
          <Tooltip label="Track your focus time with Pomodoro" hasArrow placement="bottom">
            <Box
              px={4}
              py={2}
              borderRadius="full"
              bg={colorMode === 'light' ? 'purple.50' : 'purple.900'}
              color={colorMode === 'light' ? 'purple.600' : 'purple.200'}
              boxShadow={isHovered ? 
                (colorMode === 'light' ? '0 0 8px rgba(128, 90, 213, 0.6)' : '0 0 8px rgba(214, 188, 250, 0.4)') 
                : 'none'}
              transition="all 0.3s ease"
              cursor="pointer"
              position="relative"
              overflow="hidden"
              onClick={handleOpenPomodoro}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              _hover={{ 
                bg: colorMode === 'light' ? 'purple.100' : 'purple.800',
                transform: 'translateY(-2px)'
              }}
              _active={{
                bg: colorMode === 'light' ? 'purple.200' : 'purple.700',
                transform: 'translateY(0)'
              }}
              sx={{
                animation: isHovered ? `${pulseAnimation} 2s infinite ease-in-out` : 'none',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: colorMode === 'light' 
                    ? 'linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)'
                    : 'linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%)',
                  transform: isHovered ? 'translateX(100%)' : 'translateX(-100%)',
                  transition: 'transform 0.6s ease',
                }
              }}
              display="flex"
              alignItems="center"
            >
              <Box 
                animation={isHovered ? `${rotateAnimation} 1s infinite ease-in-out` : 'none'}
                mr={2}
              >
                <FaClock size="18px" />
              </Box>
              <Text fontWeight="medium" mr={2}>Pomodoro</Text>
              <ActiveTimers 
                onOpenPomodoro={handleOpenPomodoro}
              />
            </Box>
          </Tooltip>
          
          <Button onClick={toggleColorMode} size="sm" ml={4}>
            {colorMode === 'light' ? 'Dark' : 'Light'} Mode
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Navbar;
