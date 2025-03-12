import { Achievement } from './index';
import { v4 as uuidv4 } from 'uuid';

// Define all achievements
export const PREDEFINED_ACHIEVEMENTS: Achievement[] = [
  // Completion Achievements
  {
    id: uuidv4(),
    name: 'First Steps',
    description: 'Complete your first task',
    icon: 'star',
    condition: {
      type: 'task_count',
      target: 1,
      criteria: { status: 'completed' }
    },
    category: 'completion',
    rarity: 'common',
    progress: 0,
    maxProgress: 1
  },
  {
    id: uuidv4(),
    name: 'Getting Things Done',
    description: 'Complete 10 tasks',
    icon: 'check-circle',
    condition: {
      type: 'task_count',
      target: 10,
      criteria: { status: 'completed' }
    },
    category: 'completion',
    rarity: 'common',
    progress: 0,
    maxProgress: 10
  },
  {
    id: uuidv4(),
    name: 'Productivity Maven',
    description: 'Complete 50 tasks',
    icon: 'trophy',
    condition: {
      type: 'task_count',
      target: 50,
      criteria: { status: 'completed' }
    },
    category: 'completion',
    rarity: 'uncommon',
    progress: 0,
    maxProgress: 50
  },
  {
    id: uuidv4(),
    name: 'Task Master',
    description: 'Complete 100 tasks',
    icon: 'crown',
    condition: {
      type: 'task_count',
      target: 100,
      criteria: { status: 'completed' }
    },
    category: 'completion',
    rarity: 'rare',
    progress: 0,
    maxProgress: 100
  },
  
  // Priority Achievements
  {
    id: uuidv4(),
    name: 'High Achiever',
    description: 'Complete 5 high-priority tasks',
    icon: 'flame',
    condition: {
      type: 'priority_count',
      target: 5,
      criteria: { 
        status: 'completed',
        priority: 'high'
      }
    },
    category: 'productivity',
    rarity: 'uncommon',
    progress: 0,
    maxProgress: 5
  },
  {
    id: uuidv4(),
    name: 'Balance Keeper',
    description: 'Have at least one task in each priority level',
    icon: 'balance-scale',
    condition: {
      type: 'task_count',
      target: 3
    },
    category: 'productivity',
    rarity: 'uncommon',
    progress: 0,
    maxProgress: 3
  },
  
  // Consistency Achievements
  {
    id: uuidv4(),
    name: 'Momentum Builder',
    description: 'Complete at least one task for 3 days in a row',
    icon: 'calendar-check',
    condition: {
      type: 'streak',
      target: 3
    },
    category: 'consistency',
    rarity: 'uncommon',
    progress: 0,
    maxProgress: 3
  },
  {
    id: uuidv4(),
    name: 'Habit Former',
    description: 'Complete at least one task for 7 days in a row',
    icon: 'fire',
    condition: {
      type: 'streak',
      target: 7
    },
    category: 'consistency',
    rarity: 'rare',
    progress: 0,
    maxProgress: 7
  },
  {
    id: uuidv4(),
    name: 'Perfect Day',
    description: 'Complete all tasks scheduled for a single day',
    icon: 'sun',
    condition: {
      type: 'perfect_day',
      target: 1
    },
    category: 'consistency',
    rarity: 'rare',
    progress: 0,
    maxProgress: 1
  },
  
  // Explorer Achievements
  {
    id: uuidv4(),
    name: 'Drag and Drop Master',
    description: 'Move 10 tasks using drag and drop',
    icon: 'hand-paper',
    condition: {
      type: 'drag_drop',
      target: 10
    },
    category: 'explorer',
    rarity: 'common',
    progress: 0,
    maxProgress: 10
  },
  {
    id: uuidv4(),
    name: 'Template Expert',
    description: 'Use 3 different task templates',
    icon: 'copy',
    condition: {
      type: 'template_use',
      target: 3
    },
    category: 'explorer',
    rarity: 'uncommon',
    progress: 0,
    maxProgress: 3
  },
  {
    id: uuidv4(),
    name: 'Bulk Operator',
    description: 'Perform a bulk action on 5+ tasks at once',
    icon: 'layer-group',
    condition: {
      type: 'bulk_action',
      target: 5
    },
    category: 'explorer',
    rarity: 'uncommon',
    progress: 0,
    maxProgress: 5
  },
  {
    id: uuidv4(),
    name: 'Completionist',
    description: 'Unlock all other achievements',
    icon: 'award',
    condition: {
      type: 'task_count',
      target: 12 // Total number of other achievements
    },
    category: 'explorer',
    rarity: 'legendary',
    progress: 0,
    maxProgress: 12
  }
];

// Helper function to get achievement icons
export const getAchievementIcon = (iconName: string): React.ReactNode => {
  // This function will return SVG or icon component based on the name
  // Implementation will be done in the component file
  return null;
}; 