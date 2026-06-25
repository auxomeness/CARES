import {
  BarChart3,
  Building2,
  GraduationCap,
  LayoutDashboard,
  Plus,
  UserRound,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type AdminSection = 'dashboard' | 'offices' | 'departments' | 'faculty'

export type AdminDirectoryItem = {
  id: string
  name: string
  lead: string
  email: string
  status: 'Active' | 'Needs Setup' | 'Archived'
  members: number
  category: string
}

export const adminNav: Array<{
  section: AdminSection
  label: string
  href: string
  icon: LucideIcon
}> = [
  { section: 'dashboard', label: 'Dashboard', href: '#admin', icon: LayoutDashboard },
  { section: 'offices', label: 'Offices', href: '#admin-offices', icon: Building2 },
  { section: 'departments', label: 'Departments', href: '#admin-departments', icon: GraduationCap },
  { section: 'faculty', label: 'Faculty', href: '#admin-faculty', icon: UserRound },
]

export const adminOffices: AdminDirectoryItem[] = [
  {
    id: 'OFF-001',
    name: 'Office of Student Affairs',
    lead: 'Rhea Santos',
    email: 'osa@adnu.edu.ph',
    status: 'Active',
    members: 8,
    category: 'Student Services',
  },
  {
    id: 'OFF-002',
    name: 'Registrar',
    lead: 'Marco Lim',
    email: 'registrar@adnu.edu.ph',
    status: 'Active',
    members: 6,
    category: 'Records',
  },
  {
    id: 'OFF-003',
    name: 'Facilities Management',
    lead: 'Elena Cruz',
    email: 'facilities@adnu.edu.ph',
    status: 'Needs Setup',
    members: 5,
    category: 'Facilities',
  },
]

export const adminDepartments: AdminDirectoryItem[] = [
  {
    id: 'DEP-001',
    name: 'Department of Computer Studies',
    lead: 'Prof. Adrian Lee',
    email: 'cs@adnu.edu.ph',
    status: 'Active',
    members: 18,
    category: 'Academic',
  },
  {
    id: 'DEP-002',
    name: 'Department of Engineering',
    lead: 'Dr. Maya Gutierrez',
    email: 'engineering@adnu.edu.ph',
    status: 'Active',
    members: 22,
    category: 'Academic',
  },
  {
    id: 'DEP-003',
    name: 'Department of Business',
    lead: 'Dr. Victor Tan',
    email: 'business@adnu.edu.ph',
    status: 'Needs Setup',
    members: 15,
    category: 'Academic',
  },
]

export const adminFaculty: AdminDirectoryItem[] = [
  {
    id: 'FAC-001',
    name: 'Prof. Adrian Lee',
    lead: 'Computer Studies',
    email: 'adrian.lee@adnu.edu.ph',
    status: 'Active',
    members: 1,
    category: 'Faculty',
  },
  {
    id: 'FAC-002',
    name: 'Dr. Maria Santos',
    lead: 'Business Administration',
    email: 'maria.santos@adnu.edu.ph',
    status: 'Active',
    members: 1,
    category: 'Faculty',
  },
  {
    id: 'FAC-003',
    name: 'Ms. Clara Reyes',
    lead: 'Humanities',
    email: 'clara.reyes@adnu.edu.ph',
    status: 'Needs Setup',
    members: 1,
    category: 'Faculty',
  },
]

export const adminAnalytics = [
  { label: 'Total Concerns', value: 148, detail: 'Across offices and departments', icon: BarChart3 },
  { label: 'Active Offices', value: adminOffices.length, detail: 'Operational units', icon: Building2 },
  {
    label: 'Departments',
    value: adminDepartments.length,
    detail: 'Academic units',
    icon: GraduationCap,
  },
  { label: 'Faculty Users', value: adminFaculty.length, detail: 'Assignable accounts', icon: UserRound },
]

export const adminCreateIcon = Plus
