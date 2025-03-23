import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  useColorModeValue,
  HStack,
  FormErrorMessage,
  useToast,
  Icon,
} from '@chakra-ui/react';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../context/AuthContext';

type AuthMode = 'login' | 'register';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mode, setMode] = useState<AuthMode>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { signIn, signInWithGoogle, signUp, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  
  // Check if coming from callback
  useEffect(() => {
    if (location.pathname === '/auth/callback') {
      // Handle the callback from OAuth provider
      // This is automatically handled by the Supabase Auth client
      // Just show a loading message briefly
      toast({
        title: 'Processing login...',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
    }
  }, [location.pathname, toast]);
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);
  
  const validateForm = () => {
    setError(null);
    
    if (!email || !password) {
      setError('Email and password are required');
      return false;
    }
    
    if (mode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      if (mode === 'login') {
        await signIn(email, password);
        toast({
          title: 'Login successful',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await signUp(email, password);
        toast({
          title: 'Registration successful',
          description: 'Please check your email for the confirmation link.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
      
      // Navigate to dashboard (if not redirected by useEffect)
      navigate('/');
    } catch (error: any) {
      setError(error.message || 'An error occurred during authentication');
      toast({
        title: 'Authentication error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      // The redirect will happen automatically
    } catch (error: any) {
      toast({
        title: 'Google Sign-In Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError(null); // Clear any previous errors
  };
  
  const bgColor = useColorModeValue('white', 'gray.700');
  
  return (
    <Container maxW="lg" py={{ base: '12', md: '24' }} px={{ base: '0', sm: '8' }}>
      <Stack spacing="8">
        <Box
          py={{ base: '0', sm: '8' }}
          px={{ base: '4', sm: '10' }}
          bg={bgColor}
          boxShadow={{ base: 'none', sm: 'md' }}
          borderRadius={{ base: 'none', sm: 'xl' }}
        >
          <Stack spacing="6">
            <Stack spacing={{ base: '2', md: '3' }} textAlign="center">
              <Heading size={{ base: 'md', md: 'lg' }}>
                {mode === 'login' ? 'Log in to your account' : 'Create an account'}
              </Heading>
              <Text color="gray.500">
                {mode === 'login'
                  ? "Don't have an account?"
                  : 'Already have an account?'}{' '}
                <Button variant="link" colorScheme="blue" onClick={toggleMode}>
                  {mode === 'login' ? 'Sign up' : 'Log in'}
                </Button>
              </Text>
            </Stack>
            
            <form onSubmit={handleSubmit}>
              <Stack spacing="6">
                <Stack spacing="5">
                  <FormControl isRequired isInvalid={!!error}>
                    <FormLabel htmlFor="email">Email</FormLabel>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </FormControl>
                  
                  <FormControl isRequired isInvalid={!!error}>
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </FormControl>
                  
                  {mode === 'register' && (
                    <FormControl isRequired isInvalid={!!error}>
                      <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </FormControl>
                  )}
                  
                  {error && <FormErrorMessage>{error}</FormErrorMessage>}
                </Stack>
                
                <Stack spacing="6">
                  <Button
                    colorScheme="blue"
                    type="submit"
                    isLoading={isSubmitting}
                    loadingText={mode === 'login' ? 'Logging in' : 'Signing up'}
                  >
                    {mode === 'login' ? 'Log in' : 'Sign up'}
                  </Button>
                  
                  <HStack>
                    <Divider />
                    <Text fontSize="sm" whiteSpace="nowrap" color="gray.500">
                      or continue with
                    </Text>
                    <Divider />
                  </HStack>
                  
                  <Button
                    w="full"
                    variant="outline"
                    leftIcon={<Icon as={FcGoogle} boxSize="5" />}
                    onClick={handleGoogleSignIn}
                  >
                    Google
                  </Button>
                </Stack>
              </Stack>
            </form>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
};

export default Auth;
