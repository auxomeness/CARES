import type { ReactElement } from 'react'
import {
  AdminDashboardPage,
  AdminDepartmentsPage,
  AdminFacultyPage,
  AdminOfficesPage,
  AdminProfilePage,
  AdminStudentsPage,
} from '../pages/admin'
import { AuthPage } from '../pages/auth'
import {
  DepartmentAppointmentsPage,
  DepartmentConcernsPage,
  DepartmentDashboardPage,
  DepartmentDirectoryPage,
  DepartmentProfilePage,
  DepartmentReportsPage,
} from '../pages/department'
import {
  FacultyAppointmentsPage,
  FacultyDashboardPage,
  FacultyProfilePage,
  FacultyReportsPage,
} from '../pages/faculty'
import {
  OfficeAppointmentsPage,
  OfficeConcernsPage,
  OfficeDashboardPage,
  OfficeProfilePage,
  OfficeReportsPage,
} from '../pages/office'
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
  StudentProfilePage,
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
  | 'student_profile'
  | 'office'
  | 'office_concerns'
  | 'office_appointments'
  | 'office_reports'
  | 'office_profile'
  | 'department'
  | 'department_concerns'
  | 'department_appointments'
  | 'department_reports'
  | 'department_directory'
  | 'department_profile'
  | 'faculty'
  | 'faculty_appointments'
  | 'faculty_reports'
  | 'faculty_profile'
  | 'office_head'
  | 'admin'
  | 'admin_offices'
  | 'admin_departments'
  | 'admin_faculty'
  | 'admin_students'
  | 'admin_profile'

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
    aliases: ['#home', '#student-home'],
    element: <StudentDashboardPage />,
  },
  {
    id: 'student_profile',
    label: 'Student Profile',
    path: '/student/profile',
    hash: '#student-profile',
    element: <StudentProfilePage />,
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
    id: 'office_concerns',
    label: 'Office Concerns',
    path: '/office/concerns',
    hash: '#office-concerns',
    element: <OfficeConcernsPage />,
  },
  {
    id: 'office_appointments',
    label: 'Office Appointments',
    path: '/office/appointments',
    hash: '#office-appointments',
    element: <OfficeAppointmentsPage />,
  },
  {
    id: 'office_reports',
    label: 'Office Reports',
    path: '/office/reports',
    hash: '#office-reports',
    element: <OfficeReportsPage />,
  },
  {
    id: 'office_profile',
    label: 'Office Profile',
    path: '/office/profile',
    hash: '#office-profile',
    element: <OfficeProfilePage />,
  },
  {
    id: 'department',
    label: 'Department',
    path: '/department',
    hash: '#department',
    element: <DepartmentDashboardPage />,
  },
  {
    id: 'department_concerns',
    label: 'Department Concerns',
    path: '/department/concerns',
    hash: '#department-concerns',
    element: <DepartmentConcernsPage />,
  },
  {
    id: 'department_appointments',
    label: 'Department Appointments',
    path: '/department/appointments',
    hash: '#department-appointments',
    element: <DepartmentAppointmentsPage />,
  },
  {
    id: 'department_reports',
    label: 'Department Reports',
    path: '/department/reports',
    hash: '#department-reports',
    element: <DepartmentReportsPage />,
  },
  {
    id: 'department_directory',
    label: 'Department Directory',
    path: '/department/directory',
    hash: '#department-directory',
    element: <DepartmentDirectoryPage />,
  },
  {
    id: 'department_profile',
    label: 'Department Profile',
    path: '/department/profile',
    hash: '#department-profile',
    element: <DepartmentProfilePage />,
  },
  {
    id: 'faculty',
    label: 'Faculty',
    path: '/faculty',
    hash: '#faculty',
    element: <FacultyDashboardPage />,
  },
  {
    id: 'faculty_appointments',
    label: 'Faculty Appointments',
    path: '/faculty/appointments',
    hash: '#faculty-appointments',
    element: <FacultyAppointmentsPage />,
  },
  {
    id: 'faculty_reports',
    label: 'Faculty Reports',
    path: '/faculty/reports',
    hash: '#faculty-reports',
    element: <FacultyReportsPage />,
  },
  {
    id: 'faculty_profile',
    label: 'Faculty Profile',
    path: '/faculty/profile',
    hash: '#faculty-profile',
    element: <FacultyProfilePage />,
  },
  {
    id: 'office_head',
    label: 'Office Head',
    path: '/office-head',
    hash: '#office-head',
    aliases: ['#office_head', '#department-office'],
    element: <OfficeHeadDashboardPage />,
  },
  {
    id: 'admin',
    label: 'Admin',
    path: '/admin',
    hash: '#admin',
    element: <AdminDashboardPage />,
  },
  {
    id: 'admin_offices',
    label: 'Admin Offices',
    path: '/admin/offices',
    hash: '#admin-offices',
    element: <AdminOfficesPage />,
  },
  {
    id: 'admin_departments',
    label: 'Admin Departments',
    path: '/admin/departments',
    hash: '#admin-departments',
    element: <AdminDepartmentsPage />,
  },
  {
    id: 'admin_faculty',
    label: 'Admin Faculty',
    path: '/admin/faculty',
    hash: '#admin-faculty',
    element: <AdminFacultyPage />,
  },
  {
    id: 'admin_students',
    label: 'Admin Students',
    path: '/admin/students',
    hash: '#admin-students',
    element: <AdminStudentsPage />,
  },
  {
    id: 'admin_profile',
    label: 'Admin Profile',
    path: '/admin/profile',
    hash: '#admin-profile',
    element: <AdminProfilePage />,
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
