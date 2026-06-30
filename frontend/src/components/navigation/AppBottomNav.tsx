import { useState } from 'react'
import type { NavigationItem } from './types'

type AppBottomNavProps = {
  items: NavigationItem[]
}

export function AppBottomNav({ items }: AppBottomNavProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const activeMenuItem = items.find((item) => item.label === openMenu && item.children?.length)

  return (
    <>
      <div
        className={`fixed bottom-[78px] left-4 right-4 z-30 rounded-[8px] border border-[#7fa8de] bg-[#1b3a6b] p-3 shadow-[0_10px_24px_rgba(27,58,107,0.28)] transition duration-300 sm:left-auto sm:right-8 sm:w-[320px] lg:hidden ${
          activeMenuItem
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-4 opacity-0'
        }`}
      >
        <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/70">
          Directories
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {activeMenuItem?.children?.map((child) => {
            const ChildIcon = child.icon

            return (
              <a
                className="grid min-h-[68px] place-items-center gap-1 rounded-[6px] bg-white/10 px-2 py-2 text-center text-[10px] font-semibold leading-tight text-white no-underline transition duration-200 hover:-translate-y-0.5 hover:bg-[#295498] active:scale-95"
                href={child.href}
                key={child.label}
                onClick={() => setOpenMenu(null)}
              >
                <ChildIcon aria-hidden="true" size={18} strokeWidth={2.1} />
                {child.label}
              </a>
            )
          })}
        </div>
      </div>

      {activeMenuItem ? (
        <button
          aria-label="Close directory menu"
          className="fixed inset-0 z-20 bg-transparent lg:hidden"
          onClick={() => setOpenMenu(null)}
          type="button"
        />
      ) : null}

      <nav
        className="fixed bottom-0 left-0 right-0 z-40 grid h-[67px] grid-cols-6 bg-[#1b3a6b] px-4 pt-3 shadow-[0_-8px_24px_rgba(27,58,107,0.22)] sm:px-[35px] lg:hidden"
        aria-label="Mobile navigation"
      >
        {items.map((item) => {
          const Icon = item.icon
          const hasChildren = Boolean(item.children?.length)

          return (
            <a
              aria-current={item.active ? 'page' : undefined}
              className="group grid min-w-0 justify-items-center gap-1 text-[8px] font-semibold leading-none text-white no-underline transition duration-200 hover:-translate-y-0.5 active:scale-95 sm:text-[9px]"
              href={item.href}
              key={item.label}
              onClick={(event) => {
                if (!hasChildren) {
                  setOpenMenu(null)
                  return
                }

                event.preventDefault()
                setOpenMenu((currentMenu) => (currentMenu === item.label ? null : item.label))
              }}
            >
              <span
                className={`grid size-[29px] place-items-center rounded-md transition duration-200 group-hover:bg-[#295498] ${
                  item.active || openMenu === item.label
                    ? 'bg-[#295498] text-white shadow-[0_4px_10px_rgba(159,190,241,0.24)]'
                    : 'bg-[#1b3a6b] text-white/90'
                }`}
              >
                <Icon aria-hidden="true" size={24} strokeWidth={2} />
              </span>
              <span className="max-w-full truncate text-white">{item.label}</span>
            </a>
          )
        })}
      </nav>
    </>
  )
}
