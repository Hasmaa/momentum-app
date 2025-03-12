import { Box, Flex, Button, HStack, Link, useColorMode } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FiBarChart2 } from 'react-icons/fi';

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();

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
          
          <Button onClick={toggleColorMode} size="sm" ml={4}>
            {colorMode === 'light' ? 'Dark' : 'Light'} Mode
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Navbar;
