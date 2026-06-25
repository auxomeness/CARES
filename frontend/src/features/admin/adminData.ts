import { Building2, GraduationCap, LayoutDashboard, UserRound, UsersRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type AdminSection = 'dashboard' | 'offices' | 'departments' | 'faculty' | 'students'

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
  { section: 'students', label: 'Students', href: '#admin-students', icon: UsersRound },
]
