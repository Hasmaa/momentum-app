import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  supabase, 
  signIn as supabaseSignIn, 
  signInWithGoogle as supabaseSignInWithGoogle,
  signUp as supabaseSignUp,
  signOut as supabaseSignOut,
  getCurrentUser,
  getSession
} from '../services/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Debug session and user
  useEffect(() => {
    if (session) {
      console.log('*** AUTH CONTEXT: Session Updated ***');
      console.log('Access Token:', session.access_token ? `${session.access_token.substring(0, 10)}...` : 'None');
      console.log('Refresh Token:', session.refresh_token ? `${session.refresh_token.substring(0, 5)}...` : 'None');
      console.log('Expires At:', session.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'Unknown');
      console.log('User ID:', session.user?.id || 'None');
      
      // Store session token in localStorage for debugging
      localStorage.setItem('supabase_token_first_10_chars', session.access_token.substring(0, 10));
    } else {
      console.log('*** AUTH CONTEXT: No Active Session ***');
      localStorage.removeItem('supabase_token_first_10_chars');
    }
  }, [session]);

  const checkSession = async () => {
    try {
      console.log('Checking session...');
      // Get current session
      const sessionData = await getSession();
      console.log('Session check result:', sessionData ? 'Active session found' : 'No active session');
      
      if (sessionData) {
        console.log('Session token (first 10 chars):', sessionData.access_token.substring(0, 10));
        setSession(sessionData);
        
        const userData = await getCurrentUser();
        console.log('User data retrieved:', userData ? 'Yes' : 'No');
        setUser(userData);
      } else {
        setSession(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking session:', error);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await checkSession();
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('*** AUTH STATE CHANGED ***');
        console.log('Event:', event);
        console.log('Session:', newSession ? 'Available' : 'None');
        
        if (newSession) {
          console.log('New session token (first 10):', newSession.access_token.substring(0, 10));
        }
        
        setSession(newSession);
        
        if (newSession?.user) {
          setUser(newSession.user);
        } else {
          setUser(null);
        }
      }
    );

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Signing in with email:', email);
      const { session: newSession, user: newUser } = await supabaseSignIn(email, password);
      
      console.log('Sign-in result:', newSession ? 'Success' : 'Failed');
      if (newSession) {
        console.log('New token (first 10):', newSession.access_token.substring(0, 10));
      }
      
      setSession(newSession);
      setUser(newUser);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      await supabaseSignInWithGoogle();
      // The redirect will happen automatically, and onAuthStateChange will update the state upon return
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { session: newSession, user: newUser } = await supabaseSignUp(email, password);
      setSession(newSession);
      setUser(newUser);
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabaseSignOut();
      setSession(null);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signInWithGoogle,
    signUp,
    signOut: logout,
    checkSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 