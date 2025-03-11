import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import * as todoService from '../services/todoService';
import { FilterOptions, SortOptions, Todo } from '../services/todoService';

const router = express.Router();

// Validation middleware
const todoValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').optional().trim(),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority')
];

// Get all todos
router.get('/', async (req: Request, res: Response) => {
  try {
    const filters: FilterOptions = {};
    const sort: SortOptions = {
      field: (req.query.sortField as keyof Todo) || 'createdAt',
      direction: (req.query.sortDirection as 'asc' | 'desc') || 'desc'
    };

    // Handle multiple status values
    if (req.query.status) {
      const statusValues = Array.isArray(req.query.status) 
        ? req.query.status as Todo['status'][]
        : [req.query.status as Todo['status']];
      filters.status = statusValues;
    }

    // Handle multiple priority values
    if (req.query.priority) {
      const priorityValues = Array.isArray(req.query.priority)
        ? req.query.priority as Todo['priority'][]
        : [req.query.priority as Todo['priority']];
      filters.priority = priorityValues;
    }

    if (req.query.search) {
      filters.search = req.query.search as string;
    }

    const todos = await todoService.readTodos(filters, sort);
    res.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ message: 'Error fetching todos' });
  }
});

// Create a todo
router.post('/', todoValidation, async (req: Request<any, any, Partial<Todo>>, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const todo = await todoService.createTodo({
      title: req.body.title!,
      description: req.body.description,
      status: req.body.status || 'pending',
      priority: req.body.priority || 'medium',
      dueDate: req.body.dueDate || new Date().toISOString()
    });

    res.status(201).json(todo);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ message: 'Error creating todo' });
  }
});

// Update a todo
router.put('/:id', async (req, res) => {
  try {
    const todo = await todoService.updateTodo(req.params.id, req.body);
    
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    res.json(todo);
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ message: 'Error updating todo' });
  }
});

// Delete a todo
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await todoService.deleteTodo(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ message: 'Error deleting todo' });
  }
});

export default router; 