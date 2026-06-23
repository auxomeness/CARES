import type { RoleWorkspaceConfig } from '../../types/roles'

export const studentWorkspaceConfig: RoleWorkspaceConfig = {
  role: 'student',
  title: 'Student Workspace',
  subtitle: 'Submit concerns, follow progress, and manage campus appointments.',
  capabilities: [
    'Submit concerns and suggestions',
    'Track concern status and timelines',
    'Book and manage appointments',
    'Support public concerns',
    'Request concern reopening',
    'View notifications',
  ],
}
