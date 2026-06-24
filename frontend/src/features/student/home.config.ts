import {
  Bell,
  Building2,
  Briefcase,
  CalendarSearch,
  ChevronDown,
  FileText,
  GraduationCap,
  Home,
  LayoutDashboard,
  User,
} from 'lucide-react'
import type { NavigationItem, NavigationUtilityItem } from '@/components/navigation/types'

export type StudentHomeAction = {
  label: string
  href: string
}

export type StudentSection = 'home' | 'feed' | 'concerns' | 'appointments' | 'offices' | 'profile'

export type StudentConcernSummary = {
  id: string
  location: string
  title: string
  description: string
  status: string
}

export type StudentPopularConcern = {
  label: string
  count: number
}

export const studentHomeProfile = {
  name: 'Xian Humphrey',
  role: 'Student',
  href: '#student-profile',
}

export const studentHomeBrand = {
  name: 'CARES',
  subtitle: 'Centralized Ateneo Response and Engagement System',
  href: '#student',
}

export const studentDashboardIntro = {
  title: 'Student Dashboard',
  subtitle: 'Feel free to disclose any concerns or appoint meetings anytime.',
  greeting: 'Welcome back, Xian!',
  description:
    'Your active concerns and appointments are organized here so you can move from reporting to follow-up with fewer steps.',
}

export const studentHomeActions: StudentHomeAction[] = [
  {
    label: 'Submit Concern',
    href: '#student-concern-new',
  },
  {
    label: 'Book Appointment',
    href: '#student-appointment-new',
  },
  {
    label: 'View Directories',
    href: '#student-directories-office',
  },
]

const studentDesktopNavItems: Array<NavigationItem & { section: StudentSection }> = [
  {
    section: 'home',
    label: 'Home',
    href: '#student',
    icon: Home,
  },
  {
    section: 'feed',
    label: 'Feed',
    href: '#student-feed',
    icon: LayoutDashboard,
  },
  {
    section: 'concerns',
    label: 'My Concerns',
    href: '#student-concerns',
    icon: FileText,
  },
  {
    section: 'appointments',
    label: 'My Appointments',
    href: '#student-appointments',
    icon: CalendarSearch,
  },
]

const studentMobileNavBaseItems: Array<NavigationItem & { section: StudentSection }> = [
  {
    section: 'home',
    label: 'Home',
    href: '#student',
    icon: Home,
  },
  {
    section: 'feed',
    label: 'Feed',
    href: '#student-feed',
    icon: LayoutDashboard,
  },
  {
    section: 'concerns',
    label: 'Concerns',
    href: '#student-concerns',
    icon: FileText,
  },
  {
    section: 'appointments',
    label: 'Appointments',
    href: '#student-appointments',
    icon: CalendarSearch,
  },
  {
    section: 'offices',
    label: 'Directories',
    href: '#student-directories-office',
    icon: Briefcase,
  },
  {
    section: 'profile',
    label: 'User',
    href: '#student-profile',
    icon: User,
  },
]

function withActiveSection(
  items: Array<NavigationItem & { section: StudentSection }>,
  activeSection: StudentSection,
) {
  return items.map(({ section, ...item }) => ({
    ...item,
    active: section === activeSection,
  }))
}

export function getStudentHomeNavItems(activeSection: StudentSection): NavigationItem[] {
  return withActiveSection(studentDesktopNavItems, activeSection)
}

export function getStudentMobileNavItems(activeSection: StudentSection): NavigationItem[] {
  return withActiveSection(studentMobileNavBaseItems, activeSection)
}

export const studentConcernSummaries: StudentConcernSummary[] = [
  {
    id: 'ID-001',
    location: 'Location',
    title: 'Appointment Title',
    description: 'Concerns and suggestions description raised across campus.',
    status: 'Status',
  },
  {
    id: 'ID-002',
    location: 'Location',
    title: 'Appointment Title',
    description: 'Concerns and suggestions description raised across campus.',
    status: 'Status',
  },
  {
    id: 'ID-004',
    location: 'Location',
    title: 'Appointment Title',
    description: 'Concerns and suggestions description raised across campus.',
    status: 'Status',
  },
]

export const studentNotifications = [
  'Your appointment request was received.',
  'Office staff updated a concern status.',
  'A response is ready for review.',
]

export const studentPopularConcerns: StudentPopularConcern[] = [
  {
    label: 'OSA',
    count: 3,
  },
  {
    label: 'PE Department',
    count: 2,
  },
  {
    label: 'Department of Justice',
    count: 6,
  },
  {
    label: 'Bureau of Fire',
    count: 1,
  },
]

export const studentUtilityNavItem: NavigationUtilityItem = {
  label: 'Directories',
  href: '#student-directories-office',
  icon: Briefcase,
  indicator: ChevronDown,
  children: [
    {
      label: 'Office',
      href: '#student-directories-office',
      icon: Building2,
    },
    {
      label: 'Department',
      href: '#student-directories-department',
      icon: GraduationCap,
    },
    {
      label: 'Faculty',
      href: '#student-directories-faculty',
      icon: User,
    },
  ],
}

export const studentNotificationIcon = Bell
