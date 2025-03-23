import { Request, Response, NextFunction } from 'express';
import { supabase } from '../services/supabase';
import jwt from 'jsonwebtoken';

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    console.log('[AUTH] Headers:', JSON.stringify(req.headers));
    console.log('[AUTH] Authorization Header:', authHeader); 
    
    if (!authHeader) {
      console.log('[AUTH] No authorization header provided');
      return res.status(401).json({ message: 'No authorization header provided' });
    }
    
    // Extract the token (handle different formats)
    let token = '';
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      // In case the Authorization header doesn't use the Bearer scheme
      token = authHeader;
    }
    
    console.log('[AUTH] Token format:', authHeader.startsWith('Bearer ') ? 'Bearer scheme' : 'Non-Bearer format');
    console.log('[AUTH] Extracted token:', token ? `${token.substring(0, 10)}...` : 'None'); 
    
    if (!token || token === 'undefined' || token === 'null') {
      console.log('[AUTH] Invalid token found in authorization header');
      return res.status(401).json({ message: 'No valid token provided' });
    }
    
    // Try to get the user from Supabase using the token
    try {
      console.log('[AUTH] Verifying token with Supabase...');
      const { data, error } = await supabase.auth.getUser(token);
      
      if (error) {
        console.error('[AUTH] Supabase auth error:', error);
        // Try to decode the token to see what's wrong
        try {
          const decoded = jwt.decode(token);
          console.log('[AUTH] Token payload:', decoded);
        } catch (decodeErr) {
          console.log('[AUTH] Could not decode token:', decodeErr);
        }
        return res.status(401).json({ message: 'Invalid or expired token', error: error.message });
      }
      
      console.log('[AUTH] Supabase verified user:', data.user?.id || 'No user ID');
      
      if (!data.user) {
        console.log('[AUTH] User not found in verified token');
        return res.status(401).json({ message: 'User not found in token' });
      }
      
      // Set the user on the request object
      req.user = data.user;
      console.log('[AUTH] User authenticated successfully:', req.user.id);
      
      next();
    } catch (error: any) {
      console.error('[AUTH] Supabase token verification error:', error);
      // If Supabase verification fails, try manual JWT decoding as fallback
      try {
        // Just decode without verification to see what's in the token
        const decodedToken = jwt.decode(token);
        console.log('[AUTH] Decoded token content:', decodedToken);
        
        if (decodedToken && typeof decodedToken === 'object' && decodedToken.sub) {
          // We have a user ID, let's use it
          req.user = { id: decodedToken.sub };
          console.log('[AUTH] Using fallback JWT decoding, user ID:', decodedToken.sub);
          next();
          return;
        } else {
          console.log('[AUTH] Invalid token format in fallback JWT parsing');
          return res.status(401).json({ message: 'Invalid token format' });
        }
      } catch (jwtError) {
        console.error('[AUTH] JWT decode error:', jwtError);
        return res.status(401).json({ message: 'Invalid token' });
      }
    }
  } catch (error: any) {
    console.error('[AUTH] Authentication error:', error);
    return res.status(500).json({ message: 'Authentication error', error: error.message });
  }
}; 