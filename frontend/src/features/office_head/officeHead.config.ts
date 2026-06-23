import type { RoleWorkspaceConfig } from '../../types/roles'

export const officeHeadWorkspaceConfig: RoleWorkspaceConfig = {
  role: 'office_head',
  title: 'Office Head Workspace',
  subtitle: 'Monitor work queues, oversee resolutions, and coordinate department action.',
  capabilities: [
    'Monitor concern workload',
    'Review escalated concerns',
    'Oversee resolution reports',
    'Manage department appointments',
    'Review staff or faculty availability',
    'Track operational notifications',
  ],
}
