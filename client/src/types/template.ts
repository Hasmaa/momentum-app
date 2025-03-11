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
    id: 'new-patient',
    name: 'New Patient Workflow',
    description: 'Standard protocol for new patient intake and examination',
    icon: '🐾',
    tasks: [
      {
        title: 'Initial Patient History',
        description: 'Collect comprehensive medical history, vaccination records, and previous treatments',
        status: 'pending',
        priority: 'high',
        dueDate: 0
      },
      {
        title: 'Physical Examination',
        description: 'Conduct thorough physical exam including vitals, weight, and general health assessment',
        status: 'pending',
        priority: 'high',
        dueDate: 0
      },
      {
        title: 'Vaccination Review',
        description: 'Check vaccination status and schedule necessary updates',
        status: 'pending',
        priority: 'high',
        dueDate: 1
      },
      {
        title: 'Lab Work Orders',
        description: 'Order and schedule required laboratory tests',
        status: 'pending',
        priority: 'medium',
        dueDate: 2
      },
      {
        title: 'Treatment Plan',
        description: 'Develop and document initial treatment plan',
        status: 'pending',
        priority: 'high',
        dueDate: 2
      }
    ]
  },
  {
    id: 'surgery-prep',
    name: 'Surgery Preparation',
    description: 'Pre-operative checklist and preparation tasks',
    icon: '⚕️',
    tasks: [
      {
        title: 'Pre-op Blood Work',
        description: 'Complete blood count, chemistry panel, and other required tests',
        status: 'pending',
        priority: 'high',
        dueDate: 3
      },
      {
        title: 'Patient Fasting Instructions',
        description: 'Communicate fasting requirements to pet owners',
        status: 'pending',
        priority: 'high',
        dueDate: 2
      },
      {
        title: 'Surgery Equipment Check',
        description: 'Verify all necessary surgical instruments and equipment',
        status: 'pending',
        priority: 'high',
        dueDate: 1
      },
      {
        title: 'Anesthesia Plan',
        description: 'Review patient history and develop anesthesia protocol',
        status: 'pending',
        priority: 'high',
        dueDate: 1
      },
      {
        title: 'Post-op Care Plan',
        description: 'Prepare post-operative care instructions and medications',
        status: 'pending',
        priority: 'medium',
        dueDate: 0
      }
    ]
  },
  {
    id: 'dental-procedure',
    name: 'Dental Procedure',
    description: 'Dental cleaning and examination workflow',
    icon: '🦷',
    tasks: [
      {
        title: 'Dental X-rays',
        description: 'Take full mouth radiographs',
        status: 'pending',
        priority: 'high',
        dueDate: 0
      },
      {
        title: 'Scaling and Cleaning',
        description: 'Perform thorough dental cleaning and scaling',
        status: 'pending',
        priority: 'high',
        dueDate: 0
      },
      {
        title: 'Dental Chart',
        description: 'Complete detailed dental chart noting any abnormalities',
        status: 'pending',
        priority: 'medium',
        dueDate: 0
      },
      {
        title: 'Treatment Planning',
        description: 'Document needed extractions or follow-up procedures',
        status: 'pending',
        priority: 'high',
        dueDate: 0
      },
      {
        title: 'Home Care Instructions',
        description: 'Prepare dental home care instructions for pet owners',
        status: 'pending',
        priority: 'medium',
        dueDate: 0
      }
    ]
  }
]; 