import { CalendarCheck, ClipboardList, FileText, LayoutDashboard, UsersRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type StaffRole = 'office' | 'department' | 'faculty'
export type StaffSection = 'dashboard' | 'concerns' | 'appointments' | 'reports' | 'directory'
export type StaffConcernStatus = 'New' | 'Acknowledged' | 'Investigating' | 'Transferred' | 'Resolved'
export type StaffAppointmentStatus = 'Requested' | 'Verified' | 'Approved' | 'Transferred' | 'Completed' | 'Declined'

export type StaffRoleConfig = {
  role: StaffRole
  title: string
  subtitle: string
  unitName: string
  profileName: string
  profileRole: string
  baseHash: string
  accent: string
  nav: Array<{ section: StaffSection; label: string; href: string; icon: LucideIcon }>
}

const sharedOperationalNav = (baseHash: string): StaffRoleConfig['nav'] => [
  { section: 'dashboard', label: 'Dashboard', href: baseHash, icon: LayoutDashboard },
  { section: 'concerns', label: 'Concerns', href: `${baseHash}-concerns`, icon: ClipboardList },
  { section: 'appointments', label: 'Appointments', href: `${baseHash}-appointments`, icon: CalendarCheck },
  { section: 'reports', label: 'History', href: `${baseHash}-reports`, icon: FileText },
]

export const staffRoleConfigs: Record<StaffRole, StaffRoleConfig> = {
  office: {
    role: 'office', title: 'Office Workspace', subtitle: 'Review routed concerns and appointment requests.', unitName: 'Assigned Office', profileName: 'Office Staff', profileRole: 'Office Staff', baseHash: '#office', accent: '#d4a017', nav: sharedOperationalNav('#office'),
  },
  department: {
    role: 'department', title: 'Department Workspace', subtitle: 'Handle academic concerns and department appointments.', unitName: 'Assigned Department', profileName: 'Department Lead', profileRole: 'Dean / Chair', baseHash: '#department', accent: '#7fa8de',
    nav: [
      ...sharedOperationalNav('#department'),
      { section: 'directory', label: 'Directory', href: '#department-directory', icon: UsersRound },
    ],
  },
  faculty: {
    role: 'faculty', title: 'Faculty Workspace', subtitle: 'Manage consultation requests and completion history.', unitName: 'Faculty', profileName: 'Faculty', profileRole: 'Professor', baseHash: '#faculty', accent: '#c1d9ff',
    nav: [
      { section: 'dashboard', label: 'Dashboard', href: '#faculty', icon: LayoutDashboard },
      { section: 'appointments', label: 'Appointments', href: '#faculty-appointments', icon: CalendarCheck },
      { section: 'reports', label: 'History', href: '#faculty-reports', icon: FileText },
    ],
  },
}
