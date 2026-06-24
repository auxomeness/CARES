import type { ReactElement } from 'react'
import { AdminDashboardPage } from '../pages/admin'
import { AuthPage } from '../pages/auth'
import { OfficeDashboardPage } from '../pages/office'
import { OfficeHeadDashboardPage } from '../pages/office_head'
import {
  StudentAppointmentFormPage,
  StudentAppointmentsPage,
  StudentConcernFormPage,
  StudentConcernsPage,
  StudentDashboardPage,
  StudentDirectoriesPage,
  StudentDirectoryDetailPage,
  StudentFeedPage,
} from '../pages/student'

export type AppRouteId =
  | 'login'
  | 'register'
  | 'student'
  | 'student_feed'
  | 'student_concerns'
  | 'student_concern_new'
  | 'student_appointments'
  | 'student_appointment_new'
  | 'student_directories'
  | 'student_directories_office'
  | 'student_directories_department'
  | 'student_directories_faculty'
  | 'student_directory_detail'
  | 'office'
  | 'office_head'
  | 'admin'

export type AppRoute = {
  id: AppRouteId
  label: string
  path: string
  hash: string
  aliases?: string[]
  matcher?: (normalizedHash: string) => boolean
  element: ReactElement
}

export const appRoutes: AppRoute[] = [
  {
    id: 'login',
    label: 'Login',
    path: '/',
    hash: '#login',
    element: <AuthPage />,
  },
  {
    id: 'register',
    label: 'Register',
    path: '/register',
    hash: '#register',
    element: <AuthPage />,
  },
  {
    id: 'student',
    label: 'Student Home',
    path: '/student',
    hash: '#student',
    aliases: ['#home', '#student-home', '#student-profile'],
    element: <StudentDashboardPage />,
  },
  {
    id: 'student_feed',
    label: 'Student Feed',
    path: '/student/feed',
    hash: '#student-feed',
    element: <StudentFeedPage />,
  },
  {
    id: 'student_concerns',
    label: 'My Concerns',
    path: '/student/concerns',
    hash: '#student-concerns',
    element: <StudentConcernsPage />,
  },
  {
    id: 'student_concern_new',
    label: 'Submit Concern',
    path: '/student/concerns/new',
    hash: '#student-concern-new',
    aliases: ['#student-submit-concern'],
    element: <StudentConcernFormPage />,
  },
  {
    id: 'student_appointments',
    label: 'My Appointments',
    path: '/student/appointments',
    hash: '#student-appointments',
    element: <StudentAppointmentsPage />,
  },
  {
    id: 'student_appointment_new',
    label: 'Set Appointment',
    path: '/student/appointments/new',
    hash: '#student-appointment-new',
    aliases: ['#student-book-appointment'],
    element: <StudentAppointmentFormPage />,
  },
  {
    id: 'student_directories',
    label: 'Directories',
    path: '/student/directories',
    hash: '#student-directories',
    element: <StudentDirectoriesPage />,
  },
  {
    id: 'student_directories_office',
    label: 'Office Directory',
    path: '/student/directories/office',
    hash: '#student-directories-office',
    aliases: ['#student-offices'],
    element: <StudentDirectoriesPage kind="office" />,
  },
  {
    id: 'student_directories_department',
    label: 'Department Directory',
    path: '/student/directories/department',
    hash: '#student-directories-department',
    element: <StudentDirectoriesPage kind="department" />,
  },
  {
    id: 'student_directories_faculty',
    label: 'Faculty Directory',
    path: '/student/directories/faculty',
    hash: '#student-directories-faculty',
    element: <StudentDirectoriesPage kind="faculty" />,
  },
  {
    id: 'student_directory_detail',
    label: 'Directory Detail',
    path: '/student/directories/detail',
    hash: '#student-directory-detail',
    matcher: (normalizedHash) =>
      /^#student-directory-(office|department|faculty)-/.test(normalizedHash),
    element: <StudentDirectoryDetailPage />,
  },
  {
    id: 'office',
    label: 'Office',
    path: '/office',
    hash: '#office',
    element: <OfficeDashboardPage />,
  },
  {
    id: 'office_head',
    label: 'Office Head',
    path: '/office-head',
    hash: '#office-head',
    aliases: ['#office_head'],
    element: <OfficeHeadDashboardPage />,
  },
  {
    id: 'admin',
    label: 'Admin',
    path: '/admin',
    hash: '#admin',
    element: <AdminDashboardPage />,
  },
]

export const defaultRoute = appRoutes[0]

export const pageLinks = appRoutes.map(({ id, label, path, hash }) => ({
  id,
  label,
  path,
  href: hash,
}))

export function getRouteByHash(hash: string) {
  const normalizedHash = hash.toLowerCase()

  return (
    appRoutes.find(
      (route) =>
        route.hash.toLowerCase() === normalizedHash ||
        route.aliases?.some((alias) => alias.toLowerCase() === normalizedHash) ||
        route.matcher?.(normalizedHash),
    ) ?? defaultRoute
  )
}
