import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { signUp, signIn, signOut } from '../services/supabase';

const router = express.Router();

router.post('/register',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('name').notEmpty().withMessage('Name is required')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, name } = req.body;
      
      const userData = {
        name,
        created_at: new Date().toISOString()
      };
      
      const data = await signUp(email, password, userData);
      
      res.status(201).json({ 
        message: 'User registered successfully',
        user: data.user,
        session: data.session
      });
    } catch (error: any) {
      res.status(500).json({ 
        message: 'Registration failed', 
        error: error.message 
      });
    }
  }
);

router.post('/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').exists().withMessage('Password is required')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      
      const data = await signIn(email, password);
      
      res.json({ 
        message: 'Login successful',
        user: data.user,
        session: data.session
      });
    } catch (error: any) {
      res.status(401).json({ 
        message: 'Authentication failed', 
        error: error.message 
      });
    }
  }
);

router.post('/logout', async (req: Request, res: Response) => {
  try {
    await signOut();
    res.json({ message: 'Logout successful' });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Logout failed', 
      error: error.message 
    });
  }
});

export default router; 