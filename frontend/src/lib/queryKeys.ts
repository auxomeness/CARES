type DirectoryKind = 'office' | 'department' | 'faculty'

export const queryKeys = {
  bootstrap: ['bootstrap'] as const,
  currentUser: ['currentUser'] as const,
  notifications: ['notifications'] as const,
  notificationsPanel: ['notifications', 'panel'] as const,
  concerns: {
    all: ['concerns'] as const,
    mine: ['concerns', 'mine'] as const,
    staff: ['concerns', 'staff'] as const,
    dashboard: ['concerns', 'staff'] as const,
    detail: (id: string | undefined) => ['concern', id] as const,
    publicRoot: ['concerns', 'public'] as const,
    public: (search = '') => ['concerns', 'public', search] as const,
  },
  appointments: {
    all: ['appointments'] as const,
    mine: ['appointments', 'mine'] as const,
    staff: ['appointments', 'staff'] as const,
    dashboard: ['appointments', 'staff'] as const,
  },
  directory: {
    all: ['directory'] as const,
    list: (kind: DirectoryKind, search = '') => ['directory', kind, search] as const,
    form: (kind: DirectoryKind) => ['directory', kind, 'form'] as const,
    detail: (kind: DirectoryKind | undefined, id: string | undefined) => ['directory-detail', kind, id] as const,
    admin: (section: string) => ['admin-directory', section] as const,
    students: ['students', 'department-scope'] as const,
    departments: ['directory', 'department', ''] as const,
  },
} as const
