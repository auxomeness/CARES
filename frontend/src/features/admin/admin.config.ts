import type { RoleWorkspaceConfig } from '../../types/roles'

export const adminWorkspaceConfig: RoleWorkspaceConfig = {
  role: 'admin',
  title: 'Admin Workspace',
  subtitle: 'Manage users, offices, departments, and system-wide oversight.',
  capabilities: [
    'Manage users and roles',
    'Manage offices and departments',
    'Review system-wide concerns',
    'Configure appointment targets',
    'Monitor notifications',
    'Maintain platform settings',
  ],
}
