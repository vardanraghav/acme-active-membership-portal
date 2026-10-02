import { FormQuestion } from '@/types';

export const SOCIETY_INFO = {
  name: 'ACME Society',
  acronym: 'ACME',
  department: 'Department of Electrical and Electronics Engineering',
  university: 'Galgotias University',
  tagline: 'Association of Computer, Mechanical & Electrical Engineering Enthusiasts',
  portalTitle: 'ACME Active Membership Portal',
};

export const INITIAL_ADMIN_CREDENTIALS = {
  email: process.env.ADMIN_EMAIL || 'adminvardan@acme.in',
  password: process.env.ADMIN_PASSWORD || 'TEAMINDIA',
};

export const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const DEFAULT_QUESTIONS_PAGE_2: FormQuestion[] = [
  {
    id: 'q_continue',
    questionText: 'Do you want to continue as an active member of ACME?',
    page: 2,
    questionType: 'Multiple Choice',
    options: ['Yes', 'Maybe', 'No'],
    required: true,
    enabled: true,
    order: 1,
  },
  {
    id: 'q_activity',
    questionText: 'How actively can you participate in ACME activities?',
    page: 2,
    questionType: 'Multiple Choice',
    options: ['Regularly', 'Whenever my schedule allows', 'Occasionally'],
    required: true,
    enabled: true,
    order: 2,
  },
  {
    id: 'q_meeting',
    questionText: 'Are you able to attend ACME meetings when required?',
    page: 2,
    questionType: 'Multiple Choice',
    options: ['Yes, regularly', 'Whenever possible', 'Not regularly'],
    required: true,
    enabled: true,
    order: 3,
  },
  {
    id: 'q_communication',
    questionText: 'Are you comfortable staying updated and responding to important messages in ACME groups?',
    page: 2,
    questionType: 'Multiple Choice',
    options: ['Yes', 'Usually', 'Not always'],
    required: true,
    enabled: true,
    order: 4,
  },
  {
    id: 'q_event',
    questionText: 'Are you willing to participate in ACME events and activities when required?',
    page: 2,
    questionType: 'Multiple Choice',
    options: ['Yes', 'Whenever possible', 'Occasionally'],
    required: true,
    enabled: true,
    order: 5,
  },
  {
    id: 'q_areas',
    questionText: 'Which areas of ACME are you interested in?',
    page: 2,
    questionType: 'Checkboxes',
    options: [
      'Technical Activities',
      'Event Management',
      'Workshops',
      'Design & Content',
      'Social Media',
      'Documentation',
      'Coordination',
      'Other',
    ],
    required: true,
    enabled: true,
    order: 6,
  },
  {
    id: 'q_contribution',
    questionText: 'Is there anything you would like to contribute or take part in through ACME?',
    page: 2,
    questionType: 'Paragraph',
    options: [],
    required: false,
    enabled: true,
    order: 7,
  },
  {
    id: 'q_suggestions',
    questionText: 'What would you like to see more of in ACME?',
    page: 2,
    questionType: 'Paragraph',
    options: [],
    required: false,
    enabled: true,
    order: 8,
  },
];
