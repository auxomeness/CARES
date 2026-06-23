import type { AppRole, BackendRole } from '../types/roles'

export const roleHomePaths: Record<AppRole, string> = {
  student: '/student',
  office: '/office',
  office_head: '/office-head',
  admin: '/admin',
}

export const backendRoleWorkspaceMap: Record<BackendRole, AppRole> = {
  ADMIN: 'admin',
  STUDENT: 'student',
  OFFICE_STAFF: 'office',
  DEAN: 'office_head',
  CHAIR: 'office_head',
  PROFESSOR: 'office_head',
}

export function getWorkspaceForBackendRole(role: BackendRole) {
  return backendRoleWorkspaceMap[role]
}

export function getHomePathForBackendRole(role: BackendRole) {
  return roleHomePaths[getWorkspaceForBackendRole(role)]
}
