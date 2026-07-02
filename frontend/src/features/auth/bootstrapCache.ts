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
import { queryKeys } from '@/lib/queryKeys'

const BOOTSTRAP_CACHE_KEY = 'cares.bootstrap.snapshot'

type StoredBootstrap = {
  savedAt: number
  token: string
  payload: BootstrapPayload
}

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

function setPages<T>(
  queryClient: QueryClient,
  keys: Array<readonly unknown[]>,
  message: string,
  page?: BootstrapPage<T>,
) {
  keys.forEach((key) => setPage(queryClient, key, message, page))
}

export function readStoredBootstrap(token: string | null) {
  if (!token) return null
  try {
    const raw = localStorage.getItem(BOOTSTRAP_CACHE_KEY)
    if (!raw) return null
    const stored = JSON.parse(raw) as StoredBootstrap
    return stored.token === token ? stored.payload : null
  } catch {
    return null
  }
}

export function writeStoredBootstrap(token: string | null, payload?: BootstrapPayload) {
  if (!token || !payload) return
  try {
    localStorage.setItem(
      BOOTSTRAP_CACHE_KEY,
      JSON.stringify({ savedAt: Date.now(), token, payload } satisfies StoredBootstrap),
    )
  } catch {
    // Cache writes must never block auth restore or navigation.
  }
}

export function clearStoredBootstrap() {
  try {
    localStorage.removeItem(BOOTSTRAP_CACHE_KEY)
  } catch {
    // Ignore unavailable storage.
  }
}

export function hydrateBootstrapCache(queryClient: QueryClient, bootstrap?: BootstrapPayload) {
  if (!bootstrap) return

  queryClient.setQueryData(queryKeys.bootstrap, bootstrap)
  queryClient.setQueryData(queryKeys.currentUser, bootstrap.user)
  setPage<NotificationRecord>(
    queryClient,
    queryKeys.notifications,
    'Notifications retrieved from bootstrap',
    bootstrap.notifications,
  )
  setPage<NotificationRecord>(
    queryClient,
    queryKeys.notificationsPanel,
    'Notifications retrieved from bootstrap',
    bootstrap.notifications
      ? {
          ...bootstrap.notifications,
          data: bootstrap.notifications.data.slice(0, 5),
          meta: { ...bootstrap.notifications.meta, limit: 5 },
        }
      : undefined,
  )
  setPage<ConcernRecord>(
    queryClient,
    queryKeys.concerns.mine,
    'Concerns retrieved from bootstrap',
    bootstrap.concerns,
  )
  setPage<AppointmentRecord>(
    queryClient,
    queryKeys.appointments.mine,
    'Appointments retrieved from bootstrap',
    bootstrap.appointments,
  )
  setPage<ConcernRecord>(
    queryClient,
    queryKeys.concerns.public(''),
    'Public concerns retrieved from bootstrap',
    bootstrap.publicConcerns,
  )
  setPages<DirectoryRecord>(
    queryClient,
    [queryKeys.directory.list('office'), queryKeys.directory.form('office')],
    'Offices retrieved from bootstrap',
    bootstrap.directory?.offices,
  )
  setPages<DirectoryRecord>(
    queryClient,
    [queryKeys.directory.list('department'), queryKeys.directory.form('department')],
    'Departments retrieved from bootstrap',
    bootstrap.directory?.departments,
  )
  setPages<FacultyRecord>(
    queryClient,
    [queryKeys.directory.list('faculty'), queryKeys.directory.form('faculty')],
    'Faculty retrieved from bootstrap',
    bootstrap.directory?.faculty,
  )
}
