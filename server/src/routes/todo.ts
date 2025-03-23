import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import * as todoService from '../services/todo';
import { authMiddleware } from '../middleware/auth';
import { Todo } from '../services/todo';

const router = express.Router();

// Add delay function to simulate network latency (optional - for development only)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Protect all todo routes with authentication
router.use(authMiddleware);

// Validation middleware
const todoValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').optional().trim(),
  body('completed').optional().isBoolean().withMessage('Completed must be a boolean')
];

// Get all todos
router.get('/', async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Optional: add artificial delay for development
    // await delay(500);

    const todos = await todoService.getTodos(req.user.id);
    res.json(todos);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific todo
router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    const todo = await todoService.getTodoById(id, req.user.id);

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    res.json(todo);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create a todo
router.post('/', todoValidation, async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, completed = false } = req.body;
    
    const newTodo: Todo = {
      title,
      description,
      completed,
      user_id: req.user.id
    };

    const createdTodo = await todoService.createTodo(newTodo);
    res.status(201).json(createdTodo);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update a todo
router.put('/:id', todoValidation, async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { title, description, completed } = req.body;

    // First check if the todo exists and belongs to the user
    const existingTodo = await todoService.getTodoById(id, req.user.id);
    if (!existingTodo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    const updatedTodo = await todoService.updateTodo(
      id,
      { title, description, completed },
      req.user.id
    );

    res.json(updatedTodo);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a todo
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;

    // First check if the todo exists and belongs to the user
    const existingTodo = await todoService.getTodoById(id, req.user.id);
    if (!existingTodo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    await todoService.deleteTodo(id, req.user.id);
    res.json({ message: 'Todo deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 