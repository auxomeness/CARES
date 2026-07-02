import { Bell, CheckCheck, LogOut, UserRound, X } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import { getApiErrorMessage } from '@/lib/api'
import type { NotificationRecord, PaginatedEnvelope } from '@/lib/apiTypes'
import { queryKeys } from '@/lib/queryKeys'
import { notificationApi } from '@/services/caresApi'

export function AccountActions() {
  const { user, logout, updateProfile } = useAuth()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState<'notifications' | 'profile' | null>(null)
  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [lastName, setLastName] = useState(user?.lastName ?? '')
  const [error, setError] = useState('')
  const notifications = useQuery({
    queryKey: queryKeys.notifications,
    queryFn: () => notificationApi.list({ page: 1, limit: 20 }),
    enabled: Boolean(user),
  })
  const unread = notifications.data?.meta.unread ?? 0

  if (!user) return null

  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications })
  const patchNotificationQueries = (
    updater: (old: PaginatedEnvelope<NotificationRecord>) => PaginatedEnvelope<NotificationRecord>,
  ) => {
    queryClient.setQueriesData<PaginatedEnvelope<NotificationRecord>>(
      { queryKey: queryKeys.notifications },
      (old) => (old ? updater(old) : old),
    )
  }

  const withOptimisticNotifications = async (
    updater: (old: PaginatedEnvelope<NotificationRecord>) => PaginatedEnvelope<NotificationRecord>,
    action: () => Promise<unknown>,
  ) => {
    setError('')
    const previousQueries = queryClient.getQueriesData<PaginatedEnvelope<NotificationRecord>>({
      queryKey: queryKeys.notifications,
    })
    patchNotificationQueries(updater)
    try {
      await action()
      await refresh()
    } catch (failure) {
      previousQueries.forEach(([key, value]) => queryClient.setQueryData(key, value))
      setError(getApiErrorMessage(failure))
    }
  }

  return (
    <>
      <div className="fixed right-4 top-3 z-30 flex gap-2 sm:right-6 lg:right-8">
        <button
          aria-label="Notifications"
          className="relative grid size-10 place-items-center rounded-full border border-[#1b3a6b] bg-white text-[#1b3a6b] shadow-md"
          onClick={() => setOpen(open === 'notifications' ? null : 'notifications')}
          type="button"
        >
          <Bell size={18} />
          {unread > 0 ? (
            <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-red-700 px-1 text-[10px] text-white">
              {unread}
            </span>
          ) : null}
        </button>
        <button
          aria-label="Account"
          className="grid size-10 place-items-center rounded-full border border-[#1b3a6b] bg-white text-[#1b3a6b] shadow-md"
          onClick={() => setOpen(open === 'profile' ? null : 'profile')}
          type="button"
        >
          <UserRound size={18} />
        </button>
      </div>

      {open ? (
        <aside className="fixed right-4 top-16 z-40 max-h-[75vh] w-[min(380px,calc(100vw-2rem))] overflow-y-auto rounded-[7px] border border-[#1b3a6b] bg-white p-4 shadow-xl sm:right-6 lg:right-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#1b3a6b]">
              {open === 'notifications' ? 'Notifications' : 'My Profile'}
            </h2>
            <button aria-label="Close" onClick={() => setOpen(null)} type="button"><X size={18} /></button>
          </div>
          {open === 'notifications' ? (
            <>
              <button
                className="mt-4 inline-flex h-9 items-center gap-2 rounded border px-3 text-xs font-semibold text-[#1b3a6b]"
                onClick={() =>
                  void withOptimisticNotifications(
                    (old) => ({
                      ...old,
                      data: old.data.map((notification) => ({ ...notification, isRead: true })),
                      meta: { ...old.meta, unread: 0 },
                    }),
                    () => notificationApi.readAll(),
                  )
                }
                type="button"
              >
                <CheckCheck size={15} /> Mark all read
              </button>
              <div className="mt-4 grid gap-3">
                {error ? <p className="rounded bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{error}</p> : null}
                {notifications.isLoading ? <p className="text-sm">Loading...</p> : null}
                {notifications.data?.data.map((notification) => (
                  <article className={`rounded border p-3 ${notification.isRead ? 'bg-white' : 'bg-[#edf4ff]'}`} key={notification.id}>
                    <button
                      className="w-full text-left"
                      onClick={() =>
                        void withOptimisticNotifications(
                          (old) => ({
                            ...old,
                            data: old.data.map((entry) =>
                              entry.id === notification.id ? { ...entry, isRead: true } : entry,
                            ),
                            meta: {
                              ...old.meta,
                              unread: notification.isRead
                                ? old.meta.unread
                                : Math.max(0, (old.meta.unread ?? 0) - 1),
                            },
                          }),
                          () => notificationApi.read(notification.id),
                        )
                      }
                      type="button"
                    >
                      <strong className="text-sm">{notification.title}</strong>
                      <p className="mt-1 text-xs text-[#434343]">{notification.message}</p>
                      <time className="mt-2 block text-[10px] text-[#707070]">{new Date(notification.createdAt).toLocaleString()}</time>
                    </button>
                    <button
                      className="mt-2 text-[10px] font-semibold text-red-700"
                      onClick={() =>
                        void withOptimisticNotifications(
                          (old) => ({
                            ...old,
                            data: old.data.filter((entry) => entry.id !== notification.id),
                            meta: {
                              ...old.meta,
                              total: Math.max(0, old.meta.total - 1),
                              unread: notification.isRead
                                ? old.meta.unread
                                : Math.max(0, (old.meta.unread ?? 0) - 1),
                            },
                          }),
                          () => notificationApi.remove(notification.id),
                        )
                      }
                      type="button"
                    >
                      Delete
                    </button>
                  </article>
                ))}
                {!notifications.isLoading && !notifications.data?.data.length ? <p className="text-sm">No notifications.</p> : null}
              </div>
            </>
          ) : (
            <form
              className="mt-4 grid gap-3"
              onSubmit={(event) => {
                event.preventDefault()
                setError('')
                void updateProfile({ firstName, lastName })
                  .then(() => setOpen(null))
                  .catch((failure) => setError(getApiErrorMessage(failure)))
              }}
            >
              <p className="text-xs text-[#707070]">{user.email} · {user.role}</p>
              <input className="h-10 rounded border px-3 text-sm" onChange={(e) => setFirstName(e.target.value)} placeholder="First name" value={firstName} />
              <input className="h-10 rounded border px-3 text-sm" onChange={(e) => setLastName(e.target.value)} placeholder="Last name" value={lastName} />
              {error ? <p className="text-xs text-red-700">{error}</p> : null}
              <button className="h-10 rounded bg-[#1b3a6b] text-sm font-semibold text-white" type="submit">Save Profile</button>
              <button className="inline-flex h-10 items-center justify-center gap-2 rounded border border-red-700 text-sm font-semibold text-red-700" onClick={logout} type="button"><LogOut size={16} /> Logout</button>
            </form>
          )}
        </aside>
      ) : null}
    </>
  )
}
