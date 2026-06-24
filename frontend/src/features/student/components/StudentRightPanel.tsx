import { SearchField } from '@/components/forms/SearchField'
import {
  studentNotificationIcon,
  studentNotifications,
  studentPopularConcerns,
} from '../home.config'

export function StudentRightPanel() {
  const NotificationIcon = studentNotificationIcon

  return (
    <aside className="hidden w-[280px] shrink-0 pt-[15px] xl:block">
      <SearchField className="h-9 w-full" />

      <section className="mt-[68px] min-h-[197px] rounded-[15px] border border-[#1b3a6b] bg-[#c1d9ff] px-[17px] py-4 shadow-[0_4px_4px_0_#1b3a6b] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_6px_0_#1b3a6b]">
        <div className="flex items-center gap-2">
          <NotificationIcon aria-hidden="true" size={18} strokeWidth={2.1} />
          <h2 className="m-0 text-[17px] font-semibold leading-none text-[#101010]">
            Recent Notifications
          </h2>
        </div>

        <div className="mt-4 grid gap-3">
          {studentNotifications.map((notification) => (
            <p
              className="m-0 rounded-md bg-white/55 px-3 py-2 text-[12px] font-medium leading-snug text-[#1b3a6b]"
              key={notification}
            >
              {notification}
            </p>
          ))}
        </div>
      </section>

      <section className="mt-[33px] min-h-[235px] rounded-[15px] border border-[#1b3a6b] bg-[#c1d9ff] px-[13px] py-4 shadow-[0_4px_4px_0_#1b3a6b] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_6px_0_#1b3a6b]">
        <h2 className="m-0 text-[17px] font-semibold leading-none text-[#101010]">
          Popular Concerns
        </h2>
        <div className="mt-[13px] h-px bg-[#1b3a6b]" />

        <div className="mt-3 grid gap-[22px]">
          {studentPopularConcerns.map((concern) => (
            <div
              className="flex items-center justify-between text-[17px] leading-none text-[#101010]"
              key={concern.label}
            >
              <span>{concern.label}</span>
              <span className="font-semibold text-[#1b3a6b]">{concern.count}</span>
            </div>
          ))}
        </div>
      </section>
    </aside>
  )
}
