import { Box, Flex, Button, useColorMode } from '@chakra-ui/react';

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Box px={4} bg={colorMode === 'light' ? 'white' : 'gray.800'} shadow="sm">
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <Box fontWeight="bold">Super Todo</Box>
        <Button onClick={toggleColorMode}>
          {colorMode === 'light' ? 'Dark' : 'Light'} Mode
        </Button>
      </Flex>
    </Box>
  );
};

export default Navbar;
