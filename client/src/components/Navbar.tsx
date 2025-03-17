import { 
  Box, 
  Flex, 
  HStack, 
  Link, 
  useColorMode, 
  useToast, 
  Text, 
  Tooltip, 
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  useBreakpointValue,
  ButtonGroup,
  MenuDivider,
  Badge,
  VisuallyHidden,
  useColorModeValue
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  FiBarChart2, 
  FiSettings, 
  FiHelpCircle, 
  FiUser, 
  FiMenu, 
  FiGrid, 
  FiList,
  FiHome,
  FiPlus,
  FiTag
} from 'react-icons/fi';
import { 
  FaClock, 
  FaSun, 
  FaMoon, 
  FaTrophy 
} from 'react-icons/fa';
import { ActiveTimers } from '../features/pomodoro';
import { useState, useEffect } from 'react';
import { keyframes } from '@emotion/react';
import FontSelector from './FontSelector';
import { FontOption } from '../theme';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Responsive design
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  // Theme colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const primaryColor = useColorModeValue('blue.500', 'blue.300');
  const activeItemBg = useColorModeValue('blue.50', 'gray.700');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  const pomodoroGradient = useColorModeValue(
    'linear-gradient(90deg, #E9D8FD 0%, #D6BCFA 100%)',
    'linear-gradient(90deg, #44337A 0%, #6B46C1 100%)'
  );

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
      position: 'top-right'
    });
  };

  const handleFontChange = (font: FontOption) => {
    // This function will be called when the font is changed in FontSelector
    // The App component already has a storage listener that will update the theme
  };
  
  // Add scroll listener to change navbar appearance on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Check if a path is active
  const isActive = (path: string) => location.pathname === path;
  
  // Handle new task
  const handleNewTask = () => {
    navigate('/');
    
    // Dispatch a custom event that Dashboard can listen for
    const event = new CustomEvent('create-new-task');
    window.dispatchEvent(event);
  };

  return (
    <Box
      as="nav"
      bg={bgColor}
      py={3}
      px={{ base: 3, md: 6 }}
      borderBottom="1px"
      borderColor={isScrolled ? borderColor : 'transparent'}
      position="sticky"
      top={0}
      zIndex={100}
      width="100%"
      boxShadow={isScrolled ? 'sm' : 'none'}
      transition="all 0.2s ease"
      backdropFilter="blur(10px)"
      aria-label="Main navigation"
    >
      <Flex align="center" justify="space-between" wrap="wrap" maxW="container.xl" mx="auto">
        {/* Enhanced Logo and Brand */}
        <HStack spacing={{ base: 2, md: 4 }} align="center">
          <Link 
            as={RouterLink} 
            to="/" 
            _hover={{ textDecoration: 'none' }}
            aria-label="Home page"
            display="flex" 
            alignItems="center"
            position="relative"
            role="group"
          >
            <Box
              display="inline-block"
              mr={3}
              position="relative"
              transition="transform 0.2s ease"
              _groupHover={{ transform: 'translateY(-2px)' }}
            >
              <Box 
                w="40px" 
                h="40px" 
                borderRadius="xl" 
                bg={useColorModeValue(
                  'linear-gradient(135deg, #3182CE 0%, #63B3ED 100%)',
                  'linear-gradient(135deg, #2C5282 0%, #4299E1 100%)'
                )}
                display="flex"
                alignItems="center"
                justifyContent="center"
                position="relative"
                overflow="hidden"
                transition="all 0.3s ease"
                _groupHover={{
                  bg: useColorModeValue(
                    'linear-gradient(135deg, #2C5282 0%, #3182CE 100%)',
                    'linear-gradient(135deg, #4299E1 0%, #63B3ED 100%)'
                  ),
                  transform: 'scale(1.05)'
                }}
              >
                <Text 
                  fontSize="2xl" 
                  fontWeight="black"
                  color="white"
                  textShadow="0 2px 4px rgba(0,0,0,0.1)"
                  transition="all 0.3s ease"
                  _groupHover={{ 
                    textShadow: '0 4px 8px rgba(0,0,0,0.2)',
                  }}
                >
                  M
                </Text>
                {/* Subtle shine effect */}
                <Box
                  position="absolute"
                  top="-50%"
                  left="-50%"
                  width="200%"
                  height="200%"
                  background="linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)"
                  transform="translateX(-100%)"
                  transition="transform 0.6s ease"
                  _groupHover={{ transform: 'translateX(100%)' }}
                />
              </Box>
            </Box>
            <Box>
              <Text 
                fontSize="xl" 
                fontWeight="bold" 
                bgGradient={useColorModeValue(
                  'linear-gradient(135deg, #2B6CB0 0%, #3182CE 100%)',
                  'linear-gradient(135deg, #63B3ED 0%, #90CDF4 100%)'
                )}
                bgClip="text"
                letterSpacing="tight"
                mb={-1}
                transition="all 0.3s ease"
                _groupHover={{
                  bgGradient: useColorModeValue(
                    'linear-gradient(135deg, #1A365D 0%, #2B6CB0 100%)',
                    'linear-gradient(135deg, #90CDF4 0%, #BEE3F8 100%)'
                  ),
                  transform: 'translateY(-1px)'
                }}
              >
                Momentum
              </Text>
              <Text 
                fontSize="xs" 
                color={useColorModeValue('gray.600', 'gray.400')}
                fontWeight="medium"
                letterSpacing="wider"
                textTransform="uppercase"
                opacity={0.8}
                transition="all 0.3s ease"
                _groupHover={{ 
                  opacity: 1,
                  color: useColorModeValue('blue.600', 'blue.200')
                }}
              >
                Task Management
              </Text>
            </Box>
          </Link>
        </HStack>

        {/* Desktop Navigation */}
        {!isMobile && (
          <HStack spacing={2} flex="1" justifyContent="center">
            <ButtonGroup variant="ghost" spacing={1} size="sm">
              <Tooltip label="Tasks Dashboard" hasArrow placement="bottom">
                <Link
                  as={RouterLink}
                  to="/"
                  px={3}
                  py={2}
                  borderRadius="md"
                  fontWeight="medium"
                  display="flex"
                  alignItems="center"
                  bg={isActive('/') ? activeItemBg : 'transparent'}
                  color={isActive('/') ? primaryColor : 'inherit'}
                  _hover={{
                    textDecoration: 'none',
                    bg: hoverBg
                  }}
                  aria-current={isActive('/') ? 'page' : undefined}
                >
                  <FiHome style={{ marginRight: '8px' }} />
                  Tasks
                </Link>
              </Tooltip>

              <Tooltip label="Analytics Dashboard" hasArrow placement="bottom">
                <Link
                  as={RouterLink}
                  to="/analytics"
                  px={3}
                  py={2}
                  borderRadius="md"
                  fontWeight="medium"
                  display="flex"
                  alignItems="center"
                  bg={isActive('/analytics') ? activeItemBg : 'transparent'}
                  color={isActive('/analytics') ? primaryColor : 'inherit'}
                  _hover={{
                    textDecoration: 'none',
                    bg: hoverBg
                  }}
                  aria-current={isActive('/analytics') ? 'page' : undefined}
                >
                  <FiBarChart2 style={{ marginRight: '8px' }} />
                  Analytics
                </Link>
              </Tooltip>
            </ButtonGroup>
          </HStack>
        )}

        {/* Right Side Tools */}
        <HStack spacing={{ base: 2, md: 3 }}>
          {!isMobile && <FontSelector onFontChange={handleFontChange} />}
          

          
          {/* More Menu for mobile */}
          {isMobile && (
            <Menu>
              <MenuButton
                as={IconButton}
                aria-label="Open menu"
                icon={<FiMenu />}
                variant="ghost"
                size="sm"
                borderRadius="md"
              />
              <MenuList zIndex={200}>
                <Link as={RouterLink} to="/" _hover={{ textDecoration: 'none' }}>
                  <MenuItem icon={<FiHome />} isDisabled={isActive('/')}>
                    Tasks
                  </MenuItem>
                </Link>
                <Link as={RouterLink} to="/analytics" _hover={{ textDecoration: 'none' }}>
                  <MenuItem icon={<FiBarChart2 />} isDisabled={isActive('/analytics')}>
                    Analytics
                  </MenuItem>
                </Link>
                <MenuItem icon={<FiPlus />} onClick={handleNewTask}>
                  New Task
                </MenuItem>
                <MenuItem 
                  icon={<FiTag />} 
                  onClick={() => {
                    navigate('/');
                    const event = new CustomEvent('open-tag-manager');
                    window.dispatchEvent(event);
                  }}
                >
                  Manage Tags
                </MenuItem>
                <MenuDivider />
                <MenuItem icon={<FiSettings />}>Settings</MenuItem>
                <MenuItem icon={<FiHelpCircle />}>Help & Support</MenuItem>
                <MenuDivider />
                <MenuItem>
                  <FontSelector onFontChange={handleFontChange} />
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </HStack>
      </Flex>
    </Box>
  );
};

export default Navbar;
