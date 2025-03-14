import { ChakraProvider, Box, ColorModeScript } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useState, useEffect } from 'react';
import theme, { createTheme, getCurrentFont, FontOption } from './theme';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import AnalyticsDashboardPage from './pages/AnalyticsDashboardPage';
import './index.css';

const queryClient = new QueryClient();

function App() {
  const [currentTheme, setCurrentTheme] = useState(theme);

  // Update theme when font changes
  useEffect(() => {
    const updateThemeOnFontChange = () => {
      const handleStorageChange = () => {
        const newFont = getCurrentFont();
        setCurrentTheme(createTheme(newFont));
      };

      window.addEventListener('storage', (event) => {
        if (event.key === 'selectedFont') {
          handleStorageChange();
        }
      });

      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    };

    const cleanup = updateThemeOnFontChange();
    return cleanup;
  }, []);

  const handleFontChange = (font: FontOption) => {
    setCurrentTheme(createTheme(font));
  };

  return (
    <>
      <ColorModeScript initialColorMode={currentTheme.config.initialColorMode} />
      <ChakraProvider theme={currentTheme}>
        <QueryClientProvider client={queryClient}>
          <Router>
            <Box minH="100vh" bg="gray.50">
              <Navbar />
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/analytics" element={<AnalyticsDashboardPage />} />
              </Routes>
            </Box>
          </Router>
        </QueryClientProvider>
      </ChakraProvider>
    </>
  );
}

export default App; 