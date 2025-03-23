import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import todoRoutes from './routes/todo';
import authRoutes from './routes/auth';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/todos', todoRoutes);
app.use('/api/auth', authRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  // Log auth header for debugging
  const authHeader = req.headers.authorization;
  console.log('[HEALTH] Request headers:', JSON.stringify(req.headers));
  console.log('[HEALTH] Auth header:', authHeader ? authHeader.substring(0, 20) + '...' : 'Not provided');
  
  res.status(200).json({ 
    status: 'ok',
    authHeaderPresent: !!authHeader,
    timestamp: new Date().toISOString() 
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise rejection:', err);
  process.exit(1);
}); 