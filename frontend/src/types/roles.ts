export type BackendRole =
  | 'ADMIN'
  | 'STUDENT'
  | 'OFFICE_STAFF'
  | 'DEAN'
  | 'CHAIR'
  | 'PROFESSOR'

export type AppRole = 'student' | 'office' | 'office_head' | 'admin'

export type RoleWorkspaceConfig = {
  role: AppRole
  title: string
  subtitle: string
  capabilities: string[]
}
