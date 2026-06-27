import type { QueryClient } from '@tanstack/react-query'
import type {
  AppointmentRecord,
  BootstrapPage,
  BootstrapPayload,
  ConcernRecord,
  DirectoryRecord,
  FacultyRecord,
  NotificationRecord,
  PaginatedEnvelope,
} from '@/lib/apiTypes'

function asPaginatedEnvelope<T>(
  message: string,
  page?: BootstrapPage<T>,
): PaginatedEnvelope<T> | undefined {
  if (!page) return undefined

  return {
    success: true,
    message,
    data: page.data,
    meta: page.meta,
  }
}

function setPage<T>(
  queryClient: QueryClient,
  key: readonly unknown[],
  message: string,
  page?: BootstrapPage<T>,
) {
  const value = asPaginatedEnvelope(message, page)
  if (value) queryClient.setQueryData(key, value)
}

export function hydrateBootstrapCache(queryClient: QueryClient, bootstrap?: BootstrapPayload) {
  if (!bootstrap) return

  queryClient.setQueryData(['bootstrap'], bootstrap)
  queryClient.setQueryData(['currentUser'], bootstrap.user)
  setPage<NotificationRecord>(
    queryClient,
    ['notifications'],
    'Notifications retrieved from bootstrap',
    bootstrap.notifications,
  )
  setPage<ConcernRecord>(
    queryClient,
    ['concerns', 'mine'],
    'Concerns retrieved from bootstrap',
    bootstrap.concerns,
  )
  setPage<AppointmentRecord>(
    queryClient,
    ['appointments', 'mine'],
    'Appointments retrieved from bootstrap',
    bootstrap.appointments,
  )
  setPage<ConcernRecord>(
    queryClient,
    ['concerns', 'public', ''],
    'Public concerns retrieved from bootstrap',
    bootstrap.publicConcerns,
  )
  setPage<DirectoryRecord>(
    queryClient,
    ['directory', 'office', ''],
    'Offices retrieved from bootstrap',
    bootstrap.directory?.offices,
  )
  setPage<DirectoryRecord>(
    queryClient,
    ['directory', 'department', ''],
    'Departments retrieved from bootstrap',
    bootstrap.directory?.departments,
  )
  setPage<FacultyRecord>(
    queryClient,
    ['directory', 'faculty', ''],
    'Faculty retrieved from bootstrap',
    bootstrap.directory?.faculty,
  )
  setPage<DirectoryRecord>(
    queryClient,
    ['directory', 'office', 'form'],
    'Offices retrieved from bootstrap',
    bootstrap.directory?.offices,
  )
  setPage<DirectoryRecord>(
    queryClient,
    ['directory', 'department', 'form'],
    'Departments retrieved from bootstrap',
    bootstrap.directory?.departments,
  )
  setPage<FacultyRecord>(
    queryClient,
    ['directory', 'faculty', 'form'],
    'Faculty retrieved from bootstrap',
    bootstrap.directory?.faculty,
  )
}
