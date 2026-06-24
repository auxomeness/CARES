import type { NavigationItem } from './types'

type AppBottomNavProps = {
  items: NavigationItem[]
}

export function AppBottomNav({ items }: AppBottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-20 grid h-[67px] grid-cols-6 bg-[#1b3a6b] px-4 pt-3 sm:px-[35px] lg:hidden"
      aria-label="Mobile navigation"
    >
      {items.map((item) => {
        const Icon = item.icon

        return (
          <a
            aria-current={item.active ? 'page' : undefined}
            className="grid justify-items-center gap-1 text-[6px] font-bold leading-none text-[#d9d9d9] no-underline transition duration-200 active:scale-95"
            href={item.href}
            key={item.label}
          >
            <span
              className={`grid size-[29px] place-items-center rounded-md transition duration-200 ${
                item.active ? 'bg-[#295498] text-white' : 'bg-[#1b3a6b] hover:bg-[#295498]'
              }`}
            >
              <Icon aria-hidden="true" size={24} strokeWidth={2} />
            </span>
            <span>{item.label}</span>
          </a>
        )
      })}
    </nav>
  )
}
