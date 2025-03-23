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
  body('completed').optional().isBoolean().withMessage('Completed must be a boolean'),
  body('status').optional().isIn(['pending', 'in-progress', 'completed']).withMessage('Status must be pending, in-progress, or completed'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
  body('dueDate').optional().isISO8601().withMessage('Due date must be a valid ISO8601 date'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
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

    console.log('Creating todo with request body:', JSON.stringify(req.body, null, 2));
    console.log('Authenticated user:', req.user.id);
    
    const { 
      title, 
      description, 
      status = 'pending', 
      priority = 'medium', 
      dueDate, 
      tags = [], 
      completed = false,
      user_id 
    } = req.body;
    
    // Compare the user_id in the request with the authenticated user
    if (user_id && user_id !== req.user.id) {
      console.warn(`User ID mismatch: Request has ${user_id} but authenticated user is ${req.user.id}`);
    }
    
    // ALWAYS use the authenticated user's ID from the token
    const newTodo: Todo = {
      title,
      description,
      completed,
      user_id: req.user.id, // Force the user_id to match the authenticated user
      status,
      priority,
      tags
    };

    // If dueDate is provided, add it to the todo
    if (dueDate) {
      newTodo.dueDate = dueDate;
    }

    console.log('Creating todo with data:', JSON.stringify({...newTodo, user_id: newTodo.user_id.substring(0, 8) + '...'}, null, 2));
    const createdTodo = await todoService.createTodo(newTodo);
    res.status(201).json(createdTodo);
  } catch (error: any) {
    console.error('Error creating todo:', error);
    res.status(500).json({ message: error.message, stack: error.stack });
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

// Bulk delete todos
router.post('/bulk/delete', async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { todoIds } = req.body;
    
    if (!Array.isArray(todoIds) || todoIds.length === 0) {
      return res.status(400).json({ message: 'Invalid or empty todoIds array' });
    }
    
    console.log(`Attempting to bulk delete ${todoIds.length} todos for user ${req.user.id}`);
    
    // Verify all todos belong to the user before deleting
    for (const id of todoIds) {
      const todo = await todoService.getTodoById(id, req.user.id);
      if (!todo) {
        return res.status(404).json({ 
          message: `Todo with ID ${id} not found or does not belong to the user` 
        });
      }
    }
    
    // Delete all todos one by one
    const results = await Promise.all(
      todoIds.map(id => todoService.deleteTodo(id, req.user.id))
    );
    
    res.json({ 
      message: `Successfully deleted ${results.length} todos`,
      count: results.length
    });
  } catch (error: any) {
    console.error('Error in bulk delete:', error);
    res.status(500).json({ message: error.message });
  }
});

// Bulk update todos
router.put('/bulk/update', async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { todoIds, updates } = req.body;
    
    if (!Array.isArray(todoIds) || todoIds.length === 0) {
      return res.status(400).json({ message: 'Invalid or empty todoIds array' });
    }
    
    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ message: 'Updates must be an object' });
    }
    
    console.log(`Attempting to bulk update ${todoIds.length} todos for user ${req.user.id}`);
    
    // Verify all todos belong to the user before updating
    for (const id of todoIds) {
      const todo = await todoService.getTodoById(id, req.user.id);
      if (!todo) {
        return res.status(404).json({ 
          message: `Todo with ID ${id} not found or does not belong to the user` 
        });
      }
    }
    
    // Update all todos one by one
    const updatedTodos = await Promise.all(
      todoIds.map(id => todoService.updateTodo(id, updates, req.user.id))
    );
    
    res.json({ 
      message: `Successfully updated ${updatedTodos.length} todos`,
      todos: updatedTodos 
    });
  } catch (error: any) {
    console.error('Error in bulk update:', error);
    res.status(500).json({ message: error.message });
  }
});

// Bulk capitalize todos
router.put('/bulk/capitalize', async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { todoIds } = req.body;
    
    if (!Array.isArray(todoIds) || todoIds.length === 0) {
      return res.status(400).json({ message: 'Invalid or empty todoIds array' });
    }
    
    console.log(`Attempting to capitalize ${todoIds.length} todos for user ${req.user.id}`);
    
    const updatedTodos = [];
    
    // For each todo, get it, capitalize the title, and update it
    for (const id of todoIds) {
      // First verify the todo exists and belongs to the user
      const todo = await todoService.getTodoById(id, req.user.id);
      
      if (!todo) {
        return res.status(404).json({ 
          message: `Todo with ID ${id} not found or does not belong to the user` 
        });
      }
      
      // Capitalize the title
      const capitalizedTitle = todo.title.charAt(0).toUpperCase() + todo.title.slice(1);
      
      if (capitalizedTitle !== todo.title) {
        // Only update if the title actually changed
        const updatedTodo = await todoService.updateTodo(
          id, 
          { title: capitalizedTitle },
          req.user.id
        );
        updatedTodos.push(updatedTodo);
      } else {
        updatedTodos.push(todo);
      }
    }
    
    res.json({ 
      message: `Successfully capitalized ${updatedTodos.length} todos`,
      todos: updatedTodos 
    });
  } catch (error: any) {
    console.error('Error capitalizing todos:', error);
    res.status(500).json({ message: error.message });
  }
});

// Move a todo (for drag and drop)
router.post('/:id/move', async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    const { status, order } = req.body;

    // First check if the todo exists and belongs to the user
    const existingTodo = await todoService.getTodoById(id, req.user.id);
    if (!existingTodo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    const updatedTodo = await todoService.moveTodo(id, status, order, req.user.id);
    res.json(updatedTodo);
  } catch (error: any) {
    console.error('Error moving todo:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router; 