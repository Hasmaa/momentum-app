import { Todo } from './todo';

export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'patient-care' | 'clinical-operations' | 'staff-workflows' | 'emergency-protocols';
  categoryIcon: string;
  tasks: Array<{
    title: string;
    description?: string;
    status: Todo['status'];
    priority: Todo['priority'];
    dueDate: number; // Days from now
  }>;
}

// Helper function to get category display info
export const getCategoryInfo = (category: TaskTemplate['category']) => {
  const categories = {
    'patient-care': {
      name: 'Patient Care Excellence',
      description: 'Comprehensive workflows for exceptional patient care and treatment',
      icon: '🐾'
    },
    'clinical-operations': {
      name: 'Clinical Operations',
      description: 'Streamline your clinic\'s daily operations and management',
      icon: '🏥'
    },
    'staff-workflows': {
      name: 'Staff Workflows',
      description: 'Optimize team performance and daily responsibilities',
      icon: '👥'
    },
    'emergency-protocols': {
      name: 'Emergency & Special Protocols',
      description: 'Critical care and specialized situation management',
      icon: '🚨'
    }
  };
  return categories[category];
};

export const PREDEFINED_TEMPLATES: TaskTemplate[] = [
  {
    id: 'new-patient',
    name: 'New Patient Workflow',
    description: '🌟 Transform first-time visitors into lifelong patients with our comprehensive new patient experience workflow. From warm welcomes to thorough assessments, ensure every new friend gets the royal treatment!',
    icon: '🐾',
    category: 'patient-care',
    categoryIcon: '🏥',
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
    description: '🎯 Your ultimate pre-surgery checklist ensuring nothing is left to chance. From blood work to recovery plans, make every procedure a success story!',
    icon: '⚕️',
    category: 'patient-care',
    categoryIcon: '🏥',
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
    description: '✨ Keep those pearly whites sparkling! A complete dental care journey from examination to home care instructions. Because every smile matters!',
    icon: '🦷',
    category: 'patient-care',
    categoryIcon: '🏥',
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
  },
  {
    id: 'puppy-kitten-vaccines',
    name: 'Puppy/Kitten Vaccines',
    description: '🌈 Give our littlest patients the best start in life! A complete vaccination journey from first tiny steps to fully protected companions.',
    icon: '💉',
    category: 'patient-care',
    categoryIcon: '🏥',
    tasks: [
      {
        title: 'Initial Vaccination Visit',
        description: 'First round of core vaccines and deworming (6-8 weeks)',
        status: 'pending',
        priority: 'high',
        dueDate: 0
      },
      {
        title: 'Second Vaccination Visit',
        description: 'Second round of core vaccines and parasite check (10-12 weeks)',
        status: 'pending',
        priority: 'high',
        dueDate: 21
      },
      {
        title: 'Third Vaccination Visit',
        description: 'Third round of core vaccines and health check (14-16 weeks)',
        status: 'pending',
        priority: 'high',
        dueDate: 42
      },
      {
        title: 'Rabies Vaccination',
        description: 'First rabies vaccine (16 weeks)',
        status: 'pending',
        priority: 'high',
        dueDate: 56
      },
      {
        title: 'Schedule Spay/Neuter',
        description: 'Discuss and schedule sterilization procedure',
        status: 'pending',
        priority: 'medium',
        dueDate: 70
      }
    ]
  },
  {
    id: 'chronic-condition',
    name: 'Chronic Condition Monitoring',
    description: '💪 Partner with pet parents for the long haul! Your comprehensive guide to managing ongoing conditions with care, compassion, and expertise.',
    icon: '📊',
    category: 'patient-care',
    categoryIcon: '🏥',
    tasks: [
      {
        title: 'Baseline Diagnostics',
        description: 'Complete initial blood work, imaging, and specific disease markers',
        status: 'pending',
        priority: 'high',
        dueDate: 0
      },
      {
        title: 'Medication Protocol',
        description: 'Establish medication schedule and dosing instructions',
        status: 'pending',
        priority: 'high',
        dueDate: 1
      },
      {
        title: 'Diet & Exercise Plan',
        description: 'Develop specialized nutrition and activity guidelines',
        status: 'pending',
        priority: 'medium',
        dueDate: 1
      },
      {
        title: '2-Week Follow-up',
        description: 'Assess medication effectiveness and adjust as needed',
        status: 'pending',
        priority: 'high',
        dueDate: 14
      },
      {
        title: 'Monthly Progress Check',
        description: 'Review progress and update treatment plan',
        status: 'pending',
        priority: 'medium',
        dueDate: 30
      },
      {
        title: 'Quarterly Assessment',
        description: 'Comprehensive evaluation including follow-up diagnostics',
        status: 'pending',
        priority: 'high',
        dueDate: 90
      }
    ]
  },
  {
    id: 'clinic-management',
    name: 'Clinic Management',
    description: '🎯 Keep your clinic running like a well-oiled machine! From schedules to supplies, master the art of seamless operations.',
    icon: '🏥',
    category: 'clinical-operations',
    categoryIcon: '📋',
    tasks: [
      {
        title: 'Staff Schedule Review',
        description: 'Review and adjust weekly staff schedules',
        status: 'pending',
        priority: 'high',
        dueDate: 0
      },
      {
        title: 'Inventory Check',
        description: 'Check medical supplies, medications, and equipment inventory',
        status: 'pending',
        priority: 'high',
        dueDate: 0
      },
      {
        title: 'Equipment Maintenance',
        description: 'Schedule routine maintenance for medical equipment',
        status: 'pending',
        priority: 'medium',
        dueDate: 7
      },
      {
        title: 'Controlled Substances Audit',
        description: 'Perform monthly audit of controlled substances',
        status: 'pending',
        priority: 'high',
        dueDate: 30
      },
      {
        title: 'Staff Training Update',
        description: 'Review and update staff training requirements',
        status: 'pending',
        priority: 'medium',
        dueDate: 14
      }
    ]
  },
  {
    id: 'technician-daily',
    name: 'Vet Tech Daily Tasks',
    description: '⭐ Your daily roadmap to veterinary excellence! Streamline your workflow and ensure every patient receives top-notch care.',
    icon: '👩‍⚕️',
    category: 'staff-workflows',
    categoryIcon: '👥',
    tasks: [
      {
        title: 'Morning Kennel Rounds',
        description: 'Check all hospitalized patients and update treatment sheets',
        status: 'pending',
        priority: 'high',
        dueDate: 0
      },
      {
        title: 'Treatment Administration',
        description: 'Administer scheduled medications and treatments',
        status: 'pending',
        priority: 'high',
        dueDate: 0
      },
      {
        title: 'Lab Work Processing',
        description: 'Process and log laboratory samples',
        status: 'pending',
        priority: 'high',
        dueDate: 0
      },
      {
        title: 'Equipment Sterilization',
        description: 'Clean and sterilize medical instruments',
        status: 'pending',
        priority: 'high',
        dueDate: 0
      },
      {
        title: 'Patient Monitoring',
        description: 'Monitor vital signs and update patient records',
        status: 'pending',
        priority: 'high',
        dueDate: 0
      }
    ]
  },
  {
    id: 'dvm-rounds',
    name: 'DVM Daily Rounds',
    description: '🌟 Navigate your day with precision! From morning rounds to final charts, keep your practice flowing smoothly and patients thriving.',
    icon: '👨‍⚕️',
    category: 'staff-workflows',
    categoryIcon: '👥',
    tasks: [
      {
        title: 'Morning Rounds Review',
        description: 'Review overnight cases and hospitalized patient updates',
        status: 'pending',
        priority: 'high',
        dueDate: 0
      },
      {
        title: 'Surgery Schedule',
        description: 'Review and prepare for scheduled surgical procedures',
        status: 'pending',
        priority: 'high',
        dueDate: 0
      },
      {
        title: 'Patient Consultations',
        description: 'Conduct scheduled patient examinations and consultations',
        status: 'pending',
        priority: 'high',
        dueDate: 0
      },
      {
        title: 'Lab Results Review',
        description: 'Review and follow up on laboratory results',
        status: 'pending',
        priority: 'high',
        dueDate: 0
      },
      {
        title: 'Medical Records Update',
        description: 'Complete and sign medical records and prescriptions',
        status: 'pending',
        priority: 'high',
        dueDate: 0
      }
    ]
  },
  {
    id: 'emergency-protocol',
    name: 'Emergency Protocol',
    description: '⚡ When seconds count, be prepared! Your comprehensive guide to handling critical situations with confidence and expertise.',
    icon: '🚨',
    category: 'emergency-protocols',
    categoryIcon: '🆘',
    tasks: [
      {
        title: 'Triage Assessment',
        description: 'Perform initial emergency assessment and stabilization',
        status: 'pending',
        priority: 'high',
        dueDate: 0
      },
      {
        title: 'Critical Care Setup',
        description: 'Prepare emergency supplies and equipment',
        status: 'pending',
        priority: 'high',
        dueDate: 0
      },
      {
        title: 'Diagnostic Tests',
        description: 'Order and process urgent diagnostic tests',
        status: 'pending',
        priority: 'high',
        dueDate: 0
      },
      {
        title: 'Treatment Implementation',
        description: 'Administer emergency treatments and medications',
        status: 'pending',
        priority: 'high',
        dueDate: 0
      },
      {
        title: 'Owner Communication',
        description: 'Update owner on patient status and obtain treatment consent',
        status: 'pending',
        priority: 'high',
        dueDate: 0
      }
    ]
  },
  {
    id: 'specialty-referral',
    name: 'Specialty Referral Process',
    description: '🎯 Seamlessly coordinate specialized care! Ensure your patients get the expert attention they need with our streamlined referral workflow.',
    icon: '📋',
    category: 'clinical-operations',
    categoryIcon: '📋',
    tasks: [
      {
        title: 'Case Summary',
        description: 'Prepare detailed case summary and history',
        status: 'pending',
        priority: 'high',
        dueDate: 0
      },
      {
        title: 'Diagnostic Package',
        description: 'Compile all relevant lab results and imaging',
        status: 'pending',
        priority: 'high',
        dueDate: 1
      },
      {
        title: 'Specialist Coordination',
        description: 'Contact specialist and arrange consultation',
        status: 'pending',
        priority: 'high',
        dueDate: 2
      },
      {
        title: 'Owner Instructions',
        description: 'Provide referral instructions and expectations to owner',
        status: 'pending',
        priority: 'high',
        dueDate: 2
      },
      {
        title: 'Follow-up Schedule',
        description: 'Schedule follow-up after specialist consultation',
        status: 'pending',
        priority: 'medium',
        dueDate: 14
      }
    ]
  },
  {
    id: 'isolation-protocol',
    name: 'Isolation Protocol',
    description: '🛡️ Protect your patients and team! Master the art of infection control with our comprehensive isolation management system.',
    icon: '🔬',
    category: 'emergency-protocols',
    categoryIcon: '🆘',
    tasks: [
      {
        title: 'Isolation Setup',
        description: 'Prepare isolation ward and required PPE',
        status: 'pending',
        priority: 'high',
        dueDate: 0
      },
      {
        title: 'Staff Briefing',
        description: 'Brief team on isolation procedures and precautions',
        status: 'pending',
        priority: 'high',
        dueDate: 0
      },
      {
        title: 'Disease Testing',
        description: 'Collect and process samples for diagnostic testing',
        status: 'pending',
        priority: 'high',
        dueDate: 0
      },
      {
        title: 'Treatment Protocol',
        description: 'Implement appropriate treatment and monitoring protocol',
        status: 'pending',
        priority: 'high',
        dueDate: 0
      },
      {
        title: 'Exposure Documentation',
        description: 'Document potential exposure cases and contact information',
        status: 'pending',
        priority: 'high',
        dueDate: 0
      }
    ]
  }
]; 