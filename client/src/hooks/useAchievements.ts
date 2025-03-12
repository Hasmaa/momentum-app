import { useState, useEffect, useCallback } from 'react';
import { Achievement, Task } from '../types';
import { PREDEFINED_ACHIEVEMENTS } from '../types/achievements';

// Key for storing achievements in localStorage
const ACHIEVEMENTS_STORAGE_KEY = 'momentum_achievements';

interface UseAchievementsResult {
  achievements: Achievement[];
  recentlyUnlocked: Achievement | null;
  checkAchievements: (tasks: Task[], context?: any) => void;
  hasUnlocked: (achievementId: string) => boolean;
  dismissRecentAchievement: () => void;
  getProgressPercentage: (achievement: Achievement) => number;
}

export const useAchievements = (): UseAchievementsResult => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [recentlyUnlocked, setRecentlyUnlocked] = useState<Achievement | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Initialize achievements from localStorage or use defaults
  useEffect(() => {
    const loadAchievements = () => {
      try {
        const storedAchievements = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
        
        if (storedAchievements) {
          setAchievements(JSON.parse(storedAchievements));
        } else {
          // If no stored achievements, use the predefined ones
          setAchievements(PREDEFINED_ACHIEVEMENTS);
        }
        setInitialized(true);
      } catch (error) {
        console.error('Error loading achievements:', error);
        setAchievements(PREDEFINED_ACHIEVEMENTS);
        setInitialized(true);
      }
    };

    loadAchievements();
  }, []);

  // Save achievements to localStorage whenever they change
  useEffect(() => {
    if (initialized) {
      localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(achievements));
    }
  }, [achievements, initialized]);

  // Check if an achievement is unlocked
  const hasUnlocked = useCallback((achievementId: string): boolean => {
    const achievement = achievements.find(a => a.id === achievementId);
    return !!achievement?.unlockedAt;
  }, [achievements]);

  // Calculate progress percentage for an achievement
  const getProgressPercentage = useCallback((achievement: Achievement): number => {
    if (!achievement.maxProgress || achievement.maxProgress === 0) return 0;
    const progress = achievement.progress || 0;
    return Math.min(100, Math.round((progress / achievement.maxProgress) * 100));
  }, []);

  // Clear recently unlocked achievement
  const dismissRecentAchievement = useCallback(() => {
    setRecentlyUnlocked(null);
  }, []);

  // Check for completed achievements
  const checkAchievements = useCallback((tasks: Task[], context?: any) => {
    const updatedAchievements = [...achievements];
    let newlyUnlocked: Achievement | null = null;

    // Task count achievements
    updatedAchievements.forEach(achievement => {
      if (achievement.unlockedAt) return; // Skip already unlocked achievements
      
      switch (achievement.condition.type) {
        case 'task_count': {
          const { target, criteria } = achievement.condition;
          let matchingTasks = [...tasks];
          
          // Filter by status if specified
          if (criteria?.status) {
            matchingTasks = matchingTasks.filter(task => task.status === criteria.status);
          }
          
          // Filter by priority if specified
          if (criteria?.priority) {
            matchingTasks = matchingTasks.filter(task => task.priority === criteria.priority);
          }
          
          // Update progress
          achievement.progress = matchingTasks.length;
          
          // Check if achievement is unlocked
          if (achievement.progress >= target) {
            achievement.unlockedAt = new Date().toISOString();
            newlyUnlocked = achievement;
          }
          break;
        }
        
        case 'priority_count': {
          const { target, criteria } = achievement.condition;
          let matchingTasks = [...tasks];
          
          // Filter completed high priority tasks
          if (criteria?.status && criteria?.priority) {
            matchingTasks = matchingTasks.filter(
              task => task.status === criteria.status && task.priority === criteria.priority
            );
          }
          
          // Update progress
          achievement.progress = matchingTasks.length;
          
          // Check if achievement is unlocked
          if (achievement.progress >= target) {
            achievement.unlockedAt = new Date().toISOString();
            newlyUnlocked = achievement;
          }
          break;
        }
        
        case 'drag_drop': {
          // This is handled by the context parameter
          if (context?.type === 'drag_drop') {
            achievement.progress = (achievement.progress || 0) + 1;
            
            if (achievement.progress >= achievement.condition.target) {
              achievement.unlockedAt = new Date().toISOString();
              newlyUnlocked = achievement;
            }
          }
          break;
        }
        
        case 'template_use': {
          // This is handled by the context parameter
          if (context?.type === 'template_use') {
            const templateIds = new Set(context.templateIds || []);
            achievement.progress = templateIds.size;
            
            if (achievement.progress >= achievement.condition.target) {
              achievement.unlockedAt = new Date().toISOString();
              newlyUnlocked = achievement;
            }
          }
          break;
        }
        
        case 'bulk_action': {
          // This is handled by the context parameter
          if (context?.type === 'bulk_action' && context.count >= achievement.condition.target) {
            achievement.progress = achievement.condition.target;
            achievement.unlockedAt = new Date().toISOString();
            newlyUnlocked = achievement;
          }
          break;
        }
        
        // Implement other achievement types as needed
        default:
          break;
      }
    });

    // Check for "Completionist" achievement (unlock all other achievements)
    const completionist = updatedAchievements.find(a => a.name === 'Completionist');
    if (completionist && !completionist.unlockedAt) {
      const unlockedCount = updatedAchievements.filter(
        a => a.unlockedAt && a.name !== 'Completionist'
      ).length;
      
      completionist.progress = unlockedCount;
      
      if (unlockedCount >= completionist.condition.target) {
        completionist.unlockedAt = new Date().toISOString();
        newlyUnlocked = completionist;
      }
    }

    // Update achievements state
    setAchievements(updatedAchievements);
    
    // Set recently unlocked achievement
    if (newlyUnlocked) {
      setRecentlyUnlocked(newlyUnlocked);
    }
  }, [achievements]);

  return {
    achievements,
    recentlyUnlocked,
    checkAchievements,
    hasUnlocked,
    dismissRecentAchievement,
    getProgressPercentage
  };
}; 