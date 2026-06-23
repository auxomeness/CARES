import type { ReactElement } from 'react'
import { AdminDashboardPage } from '../pages/admin'
import { AuthPage } from '../pages/auth'
import { OfficeDashboardPage } from '../pages/office'
import { OfficeHeadDashboardPage } from '../pages/office_head'
import { StudentDashboardPage } from '../pages/student'

export type AppRouteId =
  | 'login'
  | 'register'
  | 'student'
  | 'office'
  | 'office_head'
  | 'admin'

export type AppRoute = {
  id: AppRouteId
  label: string
  path: string
  hash: string
  aliases?: string[]
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
    label: 'Student',
    path: '/student',
    hash: '#student',
    element: <StudentDashboardPage />,
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
        route.aliases?.some((alias) => alias.toLowerCase() === normalizedHash),
    ) ?? defaultRoute
  )
}
