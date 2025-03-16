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
            <MotionBox
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear", repeatType: "loop" }}
              display="inline-block"
              mr={3}
              position="relative"
              _groupHover={{ scale: 1.1 }}
            >
              <Box 
                w="36px" 
                h="36px" 
                borderRadius="xl" 
                bg={useColorModeValue(
                  'linear-gradient(135deg, #3182CE 0%, #63B3ED 100%)',
                  'linear-gradient(135deg, #90CDF4 0%, #BEE3F8 100%)'
                )}
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
                fontWeight="bold"
                position="relative"
                overflow="hidden"
                _after={{
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 60%)',
                }}
              >
                <Text 
                  fontSize="xl" 
                  fontWeight="black"
                  textShadow="0 2px 4px rgba(0,0,0,0.1)"
                >
                  M
                </Text>
              </Box>
            </MotionBox>
            <Box>
              <Text 
                fontSize="xl" 
                fontWeight="bold" 
                bgGradient={useColorModeValue(
                  'linear-gradient(135deg, #3182CE 0%, #63B3ED 100%)',
                  'linear-gradient(135deg, #90CDF4 0%, #BEE3F8 100%)'
                )}
                bgClip="text"
                letterSpacing="tight"
                mb={-1}
                _groupHover={{
                  bgGradient: useColorModeValue(
                    'linear-gradient(135deg, #2C5282 0%, #3182CE 100%)',
                    'linear-gradient(135deg, #BEE3F8 0%, #E9F3FB 100%)'
                  )
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
                _groupHover={{ opacity: 1 }}
                transition="all 0.2s"
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
          
          {/* Pomodoro Button */}
          <Tooltip label="Track your focus time with Pomodoro" hasArrow placement="bottom">
            <Box
              px={3}
              py={2}
              borderRadius="full"
              bg={useColorModeValue('purple.50', 'purple.900')}
              color={useColorModeValue('purple.600', 'purple.200')}
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
                bg: useColorModeValue('purple.100', 'purple.800'),
                transform: 'translateY(-2px)'
              }}
              _active={{
                bg: useColorModeValue('purple.200', 'purple.700'),
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
              aria-label="Open Pomodoro Timer"
            >
              <Box 
                animation={isHovered ? `${rotateAnimation} 1s infinite ease-in-out` : 'none'}
                mr={2}
              >
                <FaClock size="16px" />
              </Box>
              <Text fontWeight="medium" mr={2} display={{ base: "none", md: "block" }}>Pomodoro</Text>
              <ActiveTimers 
                onOpenPomodoro={handleOpenPomodoro}
              />
            </Box>
          </Tooltip>
          
          {/* Theme Toggle Button */}
          <Tooltip label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`} hasArrow placement="bottom">
            <IconButton
              aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
              variant="ghost"
              icon={colorMode === 'light' ? <FaMoon /> : <FaSun />}
              onClick={toggleColorMode}
              size="sm"
              borderRadius="md"
              _hover={{ bg: hoverBg }}
            />
          </Tooltip>
          
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
