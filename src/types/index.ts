export type QuestionType =
  | 'Short Answer'
  | 'Paragraph'
  | 'Multiple Choice'
  | 'Checkboxes'
  | 'Dropdown';

export interface FormQuestion {
  id: string;
  questionText: string;
  page: number; // 1 = Member Details, 2 = Active Participation
  questionType: QuestionType;
  options: string[];
  required: boolean;
  enabled: boolean;
  order: number;
}

export interface MemberFormData {
  // Page 1: Member Details
  fullName: string;
  admissionNumber: string;
  email: string;
  phone: string;
  year: '1st Year' | '2nd Year' | '';
  branch: string;
  section: 'Section 1' | 'Section 2' | 'Section 3' | 'Section 4' | '';

  // Page 2: Active Participation
  continueActiveMember: 'Yes' | 'Maybe' | 'No' | '';
  activityParticipation: 'Regularly' | 'Whenever my schedule allows' | 'Occasionally' | '';
  meetingAttendance: 'Yes, regularly' | 'Whenever possible' | 'Not regularly' | '';
  groupCommunication: 'Yes' | 'Usually' | 'Not always' | '';
  eventParticipation: 'Yes' | 'Whenever possible' | 'Occasionally' | '';
  areasOfInterest: string[];
  contribution: string;
  suggestions: string;

  // Dynamic additional questions support (keyed by question ID)
  dynamicAnswers?: Record<string, string | string[]>;

  // Confirmation
  agreedToTerms: boolean;
}

export interface SubmissionRecord {
  id: string;
  timestamp: string;
  fullName: string;
  admissionNumber: string;
  email: string;
  phone: string;
  year: string;
  branch: string;
  section: string;
  continueActiveMember: string;
  activityParticipation: string;
  meetingAttendance: string;
  groupCommunication: string;
  eventParticipation: string;
  areasOfInterest: string;
  contribution: string;
  suggestions: string;
  [key: string]: string;
}

export interface DashboardMetrics {
  total: number;
  active: number;
  maybe: number;
  notContinuing: number;
  firstYear: number;
  secondYear: number;
}

export type FormMode = 'scheduled' | 'manual';
export type FormManualStatus = 'open' | 'closed';
export type FormState = 'OPEN' | 'CLOSED' | 'NOT_YET_OPEN';

export interface FormControlSettings {
  formMode: FormMode;
  manualStatus: FormManualStatus;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm (24-hour)
  stopDate: string;  // YYYY-MM-DD
  stopTime: string;  // HH:mm (24-hour)
  timezone: string;  // 'Asia/Kolkata'
  updatedAt?: string;
  updatedBy?: string;
}

export interface FormStatusResult {
  state: FormState;
  isOpen: boolean;
  message: string;
  settings: FormControlSettings;
  currentTimeIst: string;
}
