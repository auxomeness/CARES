import {
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

export const studentHomeProfile = {
  name: 'Student',
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
  greeting: 'Welcome back!',
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
