import {
  AlertCircle,
  BarChart3,
  CalendarCheck,
  ClipboardCheck,
  ClipboardList,
  FileClock,
  FileText,
  LayoutDashboard,
  Send,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type StaffRole = 'office' | 'department' | 'faculty'

export type StaffSection = 'dashboard' | 'concerns' | 'appointments' | 'reports'

export type StaffConcernStatus =
  | 'New'
  | 'Acknowledged'
  | 'Investigating'
  | 'Transferred'
  | 'Resolved'

export type StaffAppointmentStatus =
  | 'Requested'
  | 'Verified'
  | 'Approved'
  | 'Transferred'
  | 'Completed'
  | 'Declined'

export type StaffConcern = {
  id: string
  title: string
  description: string
  category: string
  location: string
  submittedBy: string
  submittedAt: string
  target: string
  role: StaffRole
  status: StaffConcernStatus
  urgency: 'Normal' | 'High' | 'Critical'
  upCount: number
  assignedTo: string
  timeline: string[]
}

export type StaffAppointment = {
  id: string
  requester: string
  purpose: string
  target: string
  role: StaffRole
  date: string
  time: string
  status: StaffAppointmentStatus
  notes: string
  timeline: string[]
}

export type StaffReport = {
  id: string
  title: string
  scope: string
  submittedAt: string
  status: 'Draft' | 'Submitted' | 'Reviewed'
}

export type StaffRoleConfig = {
  role: StaffRole
  title: string
  subtitle: string
  unitName: string
  profileName: string
  profileRole: string
  baseHash: string
  accent: string
  nav: Array<{
    section: StaffSection
    label: string
    href: string
    icon: LucideIcon
  }>
}

const sharedOperationalNav = (baseHash: string): StaffRoleConfig['nav'] => [
  { section: 'dashboard', label: 'Dashboard', href: baseHash, icon: LayoutDashboard },
  { section: 'concerns', label: 'Concerns', href: `${baseHash}-concerns`, icon: ClipboardList },
  {
    section: 'appointments',
    label: 'Appointments',
    href: `${baseHash}-appointments`,
    icon: CalendarCheck,
  },
  { section: 'reports', label: 'Reports', href: `${baseHash}-reports`, icon: FileText },
]

export const staffRoleConfigs: Record<StaffRole, StaffRoleConfig> = {
  office: {
    role: 'office',
    title: 'Office Workspace',
    subtitle: 'Review routed concerns, manage appointment approvals, and report resolutions.',
    unitName: 'Office of Student Affairs',
    profileName: 'OSA Desk',
    profileRole: 'Office Staff',
    baseHash: '#office',
    accent: '#d4a017',
    nav: sharedOperationalNav('#office'),
  },
  department: {
    role: 'department',
    title: 'Department Workspace',
    subtitle: 'Handle academic concerns, department appointments, and faculty coordination.',
    unitName: 'Department of Computer Studies',
    profileName: 'CS Department',
    profileRole: 'Department Office',
    baseHash: '#department',
    accent: '#7fa8de',
    nav: sharedOperationalNav('#department'),
  },
  faculty: {
    role: 'faculty',
    title: 'Faculty Workspace',
    subtitle: 'Manage consultation availability, appointment requests, and completion logs.',
    unitName: 'Prof. Adrian Lee',
    profileName: 'Adrian Lee',
    profileRole: 'Faculty',
    baseHash: '#faculty',
    accent: '#c1d9ff',
    nav: [
      { section: 'dashboard', label: 'Dashboard', href: '#faculty', icon: LayoutDashboard },
      {
        section: 'appointments',
        label: 'Appointments',
        href: '#faculty-appointments',
        icon: CalendarCheck,
      },
      { section: 'reports', label: 'Reports', href: '#faculty-reports', icon: FileText },
    ],
  },
}

export const staffConcerns: StaffConcern[] = [
  {
    id: 'CON-104',
    title: 'Broken lights near covered courts',
    description:
      'Pathway lighting remains unavailable after evening classes and students flagged safety concerns.',
    category: 'Safety',
    location: 'Covered Courts',
    submittedBy: 'Xian Humphrey',
    submittedAt: 'June 25, 2026',
    target: 'Office of Student Affairs',
    role: 'office',
    status: 'New',
    urgency: 'Critical',
    upCount: 36,
    assignedTo: 'Unassigned',
    timeline: ['Concern received', 'Queued for office review'],
  },
  {
    id: 'CON-105',
    title: 'Delayed certificate release',
    description:
      'Student records request has not moved after the expected processing window.',
    category: 'Records',
    location: 'Registrar',
    submittedBy: 'Anonymous student',
    submittedAt: 'June 24, 2026',
    target: 'Registrar',
    role: 'office',
    status: 'Acknowledged',
    urgency: 'High',
    upCount: 21,
    assignedTo: 'Records Desk',
    timeline: ['Concern received', 'Student notified', 'Registrar desk assigned'],
  },
  {
    id: 'CON-204',
    title: 'Need additional capstone consultation slots',
    description:
      'Several groups need academic consultation before the capstone proposal deadline.',
    category: 'Academic',
    location: 'Computer Studies',
    submittedBy: 'Capstone Group 4',
    submittedAt: 'June 25, 2026',
    target: 'Department of Computer Studies',
    role: 'department',
    status: 'Investigating',
    urgency: 'High',
    upCount: 28,
    assignedTo: 'Program Coordinator',
    timeline: ['Concern received', 'Department office assigned', 'Faculty availability checked'],
  },
  {
    id: 'CON-205',
    title: 'Course prerequisite conflict',
    description:
      'Students cannot enroll due to a prerequisite record mismatch in the department advising list.',
    category: 'Academic',
    location: 'College Building',
    submittedBy: 'Second Year CS',
    submittedAt: 'June 23, 2026',
    target: 'Department of Computer Studies',
    role: 'department',
    status: 'New',
    urgency: 'Normal',
    upCount: 12,
    assignedTo: 'Unassigned',
    timeline: ['Concern received'],
  },
]

export const staffAppointments: StaffAppointment[] = [
  {
    id: 'APT-311',
    requester: 'Xian Humphrey',
    purpose: 'Concern discussion',
    target: 'Office of Student Affairs',
    role: 'office',
    date: 'June 26, 2026',
    time: '9:30 AM',
    status: 'Requested',
    notes: 'Discuss the pending safety concern and possible next steps.',
    timeline: ['Appointment request received'],
  },
  {
    id: 'APT-312',
    requester: 'Mika Reyes',
    purpose: 'Document request follow-up',
    target: 'Registrar',
    role: 'office',
    date: 'June 27, 2026',
    time: '1:00 PM',
    status: 'Verified',
    notes: 'Student needs clarification on release requirements.',
    timeline: ['Appointment request received', 'Identity verified'],
  },
  {
    id: 'APT-411',
    requester: 'Capstone Group 4',
    purpose: 'Academic consultation',
    target: 'Department of Computer Studies',
    role: 'department',
    date: 'June 27, 2026',
    time: '10:30 AM',
    status: 'Requested',
    notes: 'Consultation for proposal review and adviser routing.',
    timeline: ['Appointment request received'],
  },
  {
    id: 'APT-511',
    requester: 'Mika Reyes',
    purpose: 'Faculty consultation',
    target: 'Prof. Adrian Lee',
    role: 'faculty',
    date: 'June 28, 2026',
    time: '2:30 PM',
    status: 'Approved',
    notes: 'Programming project review and completion check.',
    timeline: ['Appointment request received', 'Faculty approved schedule'],
  },
  {
    id: 'APT-512',
    requester: 'John Velasco',
    purpose: 'Capstone consultation',
    target: 'Prof. Adrian Lee',
    role: 'faculty',
    date: 'June 29, 2026',
    time: '9:30 AM',
    status: 'Requested',
    notes: 'Needs adviser review before submission.',
    timeline: ['Appointment request received'],
  },
]

export const staffReports: StaffReport[] = [
  {
    id: 'RPT-020',
    title: 'Weekly concern resolution summary',
    scope: 'Office of Student Affairs',
    submittedAt: 'June 24, 2026',
    status: 'Submitted',
  },
  {
    id: 'RPT-021',
    title: 'Academic consultation load report',
    scope: 'Department of Computer Studies',
    submittedAt: 'June 24, 2026',
    status: 'Draft',
  },
  {
    id: 'RPT-022',
    title: 'Faculty appointment completion log',
    scope: 'Prof. Adrian Lee',
    submittedAt: 'June 23, 2026',
    status: 'Reviewed',
  },
]

export const transferTargets = [
  'Office of Student Affairs',
  'Registrar',
  'Guidance Office',
  'Facilities Management',
  'Department of Computer Studies',
  'Department of Engineering',
]

export const assigneeOptions = [
  'Unassigned',
  'Records Desk',
  'Program Coordinator',
  'Facilities Lead',
  'Guidance Counselor',
  'Faculty Adviser',
]

export const concernStatusOptions: StaffConcernStatus[] = [
  'New',
  'Acknowledged',
  'Investigating',
  'Transferred',
  'Resolved',
]

export const appointmentStatusOptions: StaffAppointmentStatus[] = [
  'Requested',
  'Verified',
  'Approved',
  'Transferred',
  'Completed',
  'Declined',
]

export const staffMetricIcons = {
  concerns: ClipboardList,
  appointments: CalendarCheck,
  urgent: AlertCircle,
  resolved: ClipboardCheck,
  reports: FileClock,
  analytics: BarChart3,
  notify: Send,
  people: Users,
}
