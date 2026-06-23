import type { RoleWorkspaceConfig } from '../../types/roles'

export const officeWorkspaceConfig: RoleWorkspaceConfig = {
  role: 'office',
  title: 'Office Workspace',
  subtitle: 'Handle assigned concerns, appointment requests, and resolution updates.',
  capabilities: [
    'Review assigned concerns',
    'Update concern timelines',
    'Transfer concerns to offices or departments',
    'Submit resolution reports',
    'Manage office appointments',
    'View office notifications',
  ],
}
