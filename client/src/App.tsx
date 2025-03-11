import { ChakraProvider, Box, ColorModeScript } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import theme from './theme';
// import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';

const queryClient = new QueryClient();

function App() {
  return (
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <Router>
            <Box minH="100vh" bg="gray.50">
              {/* <Navbar /> */}
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/auth" element={<Auth />} />
              </Routes>
            </Box>
          </Router>
        </QueryClientProvider>
      </ChakraProvider>
    </>
  );
}

export default App; 