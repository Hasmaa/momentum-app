import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Spinner, Text, VStack } from '@chakra-ui/react';
import { supabase } from '../services/supabase';

const AuthCallback = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Handle the OAuth callback
    const handleCallback = async () => {
      try {
        // Supabase Auth will automatically handle the callback
        // Just need to wait for the session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error during OAuth callback:', error);
          navigate('/auth');
          return;
        }
        
        if (data.session) {
          // Success! Redirect to the dashboard
          navigate('/');
        } else {
          // No session, redirect to login
          navigate('/auth');
        }
      } catch (error) {
        console.error('Error during auth callback:', error);
        navigate('/auth');
      }
    };
    
    handleCallback();
  }, [navigate]);
  
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      bg="gray.50"
    >
      <VStack spacing={6}>
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="xl"
        />
        <Text fontSize="lg" fontWeight="medium">
          Completing authentication...
        </Text>
      </VStack>
    </Box>
  );
};

export default AuthCallback; 