import { useQuery } from '@tanstack/react-query'
import { notificationApi } from '@/services/caresApi'

export function StudentRightPanel() {
  const notifications = useQuery({ queryKey: ['notifications', 'right-panel'], queryFn: () => notificationApi.list({ page: 1, limit: 5 }) })
  return (
    <aside className="hidden w-[350px] shrink-0 pt-[15px] xl:block">
      <section className="mt-[68px] rounded-[15px] border border-[#1b3a6b] bg-[#c1d9ff] p-4 shadow-[0_4px_4px_0_#1b3a6b]">
        <h2 className="text-lg font-semibold">Recent Notifications</h2>
        <div className="mt-4 grid gap-3">
          {notifications.data?.data.map((notification) => <article className="rounded bg-white/60 p-3" key={notification.id}><strong className="text-xs">{notification.title}</strong><p className="mt-1 text-xs">{notification.message}</p></article>)}
          {!notifications.isLoading && !notifications.data?.data.length ? <p className="text-sm">No notifications.</p> : null}
        </div>
      </section>
    </aside>
  )
}
