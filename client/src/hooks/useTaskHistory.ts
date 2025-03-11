import { useState, useCallback, useEffect, useRef } from 'react';
import { Task } from '../types';

interface TaskHistory {
  past: Task[][];
  present: Task[];
  future: Task[][];
}

export const useTaskHistory = (initialTasks: Task[]) => {
  const [history, setHistory] = useState<TaskHistory>({
    past: [],
    present: initialTasks,
    future: [],
  });

  // Use a ref to track if the change is from undo/redo
  const isUndoRedoRef = useRef(false);

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const updateTasks = useCallback((newTasks: Task[]) => {
    // Don't record history if this update is from undo/redo
    if (isUndoRedoRef.current) {
      isUndoRedoRef.current = false;
      return;
    }

    setHistory(prev => ({
      past: [...prev.past, prev.present],
      present: newTasks,
      future: [],
    }));
  }, []);

  const undo = useCallback(() => {
    if (!canUndo) return;

    isUndoRedoRef.current = true;
    setHistory(prev => ({
      past: prev.past.slice(0, -1),
      present: prev.past[prev.past.length - 1],
      future: [prev.present, ...prev.future],
    }));
  }, [canUndo]);

  const redo = useCallback(() => {
    if (!canRedo) return;

    isUndoRedoRef.current = true;
    setHistory(prev => ({
      past: [...prev.past, prev.present],
      present: prev.future[0],
      future: prev.future.slice(1),
    }));
  }, [canRedo]);

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent handling if in an input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault(); // Prevent default browser undo
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    tasks: history.present,
    updateTasks,
    undo,
    redo,
    canUndo,
    canRedo,
  };
};

export default useTaskHistory; 