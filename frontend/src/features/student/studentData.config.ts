import type {
  AppointmentStatus,
  ConcernCategory,
  ConcernStatus,
  StudentAppointment,
  StudentConcern,
} from './studentData.types'

export const concernStatuses: ConcernStatus[] = [
  'For Approval',
  'Pending',
  'Approved',
  'Completed',
]

export const concernCategories: ConcernCategory[] = [
  'Facilities',
  'Student Services',
  'Safety',
  'Academic',
  'Campus Life',
]

export const campusLocations = [
  'Arrupe Hall',
  'College Building',
  'Library',
  'Covered Courts',
  'Student Center',
]

export const officeOptions = [
  'Office of Student Affairs',
  'Registrar',
  'Guidance Office',
  'Campus Ministry',
  'Physical Plant Office',
]

export const departmentOptions = [
  'Computer Studies',
  'Business Administration',
  'Education',
  'Humanities',
  'Natural Sciences',
]

export const facultyOptions = [
  'Dr. Maria Santos',
  'Prof. Adrian Lee',
  'Ms. Clara Reyes',
  'Mr. Paolo Tan',
]

export const appointmentPurposes = [
  'Academic consultation',
  'Clearance follow-up',
  'Concern discussion',
  'Document request',
  'Wellness consultation',
]

export const consultationCategories = [
  'General inquiry',
  'Student support',
  'Records and documents',
  'Facilities request',
  'Faculty consultation',
]

export const appointmentStatuses: AppointmentStatus[] = [
  'Pending',
  'Approved',
  'Completed',
  'Cancelled',
]

export const availableAppointmentTimes = [
  '8:00 AM',
  '9:30 AM',
  '10:30 AM',
  '1:00 PM',
  '2:30 PM',
  '4:00 PM',
]

export const initialStudentConcerns: StudentConcern[] = [
  {
    id: 'CON-001',
    title: 'Broken lights near the covered courts',
    description:
      'Several pathway lights are out after evening classes, making the area difficult to pass through.',
    category: 'Safety',
    location: 'Covered Courts',
    status: 'For Approval',
    visibility: 'public',
    anonymous: false,
    author: 'Xian Humphrey',
    createdAt: 'June 22, 2026',
    reactions: 24,
    progress: 25,
  },
  {
    id: 'CON-002',
    title: 'Air-conditioning concern in lecture room',
    description:
      'The room gets too warm during afternoon classes and students have trouble focusing.',
    category: 'Facilities',
    location: 'College Building',
    status: 'Pending',
    visibility: 'public',
    anonymous: true,
    author: 'Anonymous student',
    createdAt: 'June 21, 2026',
    reactions: 18,
    progress: 45,
  },
  {
    id: 'CON-003',
    title: 'Request for more study tables',
    description:
      'The library study area fills up quickly during exam week and additional tables would help.',
    category: 'Academic',
    location: 'Library',
    status: 'Approved',
    visibility: 'public',
    anonymous: false,
    author: 'Xian Humphrey',
    createdAt: 'June 20, 2026',
    reactions: 36,
    progress: 70,
  },
  {
    id: 'CON-004',
    title: 'Personal guidance appointment follow-up',
    description:
      'Private concern submitted directly for office review. Details are hidden from the community feed.',
    category: 'Student Services',
    location: 'Student Center',
    status: 'Completed',
    visibility: 'private',
    anonymous: false,
    author: 'Xian Humphrey',
    createdAt: 'June 18, 2026',
    reactions: 0,
    progress: 100,
  },
]

export const initialStudentAppointments: StudentAppointment[] = [
  {
    id: 'APT-001',
    mode: 'office',
    office: 'Office of Student Affairs',
    date: 'June 25, 2026',
    time: '9:30 AM',
    purpose: 'Concern discussion',
    consultationCategory: 'Student support',
    description: 'Discuss the pending concern and possible next steps with student affairs.',
    status: 'Pending',
    createdAt: 'June 22, 2026',
  },
  {
    id: 'APT-002',
    mode: 'department',
    office: 'Computer Studies',
    department: 'Computer Studies',
    faculty: 'Prof. Adrian Lee',
    date: 'June 27, 2026',
    time: '1:00 PM',
    purpose: 'Academic consultation',
    consultationCategory: 'Faculty consultation',
    description: 'Clarify capstone consultation schedule and required document format.',
    status: 'Approved',
    createdAt: 'June 21, 2026',
  },
]
