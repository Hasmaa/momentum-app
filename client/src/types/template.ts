import { Todo } from './todo';

export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  tasks: Array<{
    title: string;
    description?: string;
    status: Todo['status'];
    priority: Todo['priority'];
    dueDate: number; // Days from now
  }>;
}

export const PREDEFINED_TEMPLATES: TaskTemplate[] = [
  {
    id: 'plan-trip',
    name: 'Plan a Trip',
    description: 'Everything you need to organize a successful trip',
    icon: '✈️',
    tasks: [
      {
        title: 'Research Destination',
        description: 'Look up potential destinations, costs, and best times to visit',
        status: 'pending',
        priority: 'high',
        dueDate: 0
      },
      {
        title: 'Book Flights',
        description: 'Compare prices and book flights',
        status: 'pending',
        priority: 'high',
        dueDate: 1
      },
      {
        title: 'Book Accommodation',
        description: 'Find and reserve hotels or rentals',
        status: 'pending',
        priority: 'high',
        dueDate: 2
      },
      {
        title: 'Plan Activities',
        description: 'Research and list activities and attractions to visit',
        status: 'pending',
        priority: 'medium',
        dueDate: 3
      },
      {
        title: 'Pack Essentials',
        description: 'Prepare packing list and pack bags',
        status: 'pending',
        priority: 'medium',
        dueDate: 7
      }
    ]
  },
  {
    id: 'project-setup',
    name: 'Start a Project',
    description: 'Initial setup tasks for starting a new project',
    icon: '🚀',
    tasks: [
      {
        title: 'Define Project Scope',
        description: 'Outline project goals, requirements, and deliverables',
        status: 'pending',
        priority: 'high',
        dueDate: 0
      },
      {
        title: 'Create Project Timeline',
        description: 'Set milestones and deadlines',
        status: 'pending',
        priority: 'high',
        dueDate: 1
      },
      {
        title: 'Assign Team Roles',
        description: 'Define responsibilities and assign team members',
        status: 'pending',
        priority: 'medium',
        dueDate: 2
      },
      {
        title: 'Setup Project Tools',
        description: 'Configure necessary software and tools',
        status: 'pending',
        priority: 'medium',
        dueDate: 2
      }
    ]
  },
  {
    id: 'weekly-review',
    name: 'Weekly Review',
    description: 'Tasks for conducting a productive weekly review',
    icon: '📅',
    tasks: [
      {
        title: 'Review Last Week\'s Goals',
        description: 'Evaluate progress on previous week\'s objectives',
        status: 'pending',
        priority: 'high',
        dueDate: 0
      },
      {
        title: 'Process Inbox',
        description: 'Clear emails and messages, create action items',
        status: 'pending',
        priority: 'medium',
        dueDate: 0
      },
      {
        title: 'Update Task List',
        description: 'Review and update all ongoing tasks',
        status: 'pending',
        priority: 'medium',
        dueDate: 0
      },
      {
        title: 'Plan Next Week',
        description: 'Set goals and priorities for the coming week',
        status: 'pending',
        priority: 'high',
        dueDate: 0
      }
    ]
  }
]; 