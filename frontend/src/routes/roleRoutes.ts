import type { AppRole, BackendRole } from '../types/roles'

export const roleHomePaths: Record<AppRole, string> = {
  student: '/student',
  office: '/office',
  department: '/department',
  faculty: '/faculty',
  office_head: '/office-head',
  admin: '/admin',
}

export const backendRoleWorkspaceMap: Record<BackendRole, AppRole> = {
  ADMIN: 'admin',
  STUDENT: 'student',
  OFFICE_STAFF: 'office',
  DEAN: 'department',
  CHAIR: 'department',
  PROFESSOR: 'faculty',
}

export function getWorkspaceForBackendRole(role: BackendRole) {
  return backendRoleWorkspaceMap[role]
}

export function getHomePathForBackendRole(role: BackendRole) {
  return roleHomePaths[getWorkspaceForBackendRole(role)]
}

export function getHomeHashForBackendRole(role: BackendRole) {
  return `#${getWorkspaceForBackendRole(role)}`
}
