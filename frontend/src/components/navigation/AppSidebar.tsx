import { LogOut } from 'lucide-react'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { useAuth } from '@/features/auth/AuthContext'
import type {
  NavigationBrand,
  NavigationItem,
  NavigationProfile,
  NavigationUtilityItem,
} from './types'

type AppSidebarProps = {
  brand: NavigationBrand
  items: NavigationItem[]
  profile: NavigationProfile
  utilityItem?: NavigationUtilityItem
}

function SidebarUtilityLink({ item }: { item: NavigationUtilityItem }) {
  const Icon = item.icon
  const IndicatorIcon = item.indicator

  if (item.children?.length) {
    return (
      <details className="group" open={item.active}>
        <summary
          aria-current={item.active ? 'page' : undefined}
          className={`flex h-[43px] cursor-pointer list-none items-center gap-[15px] rounded-md px-[18px] text-[22px] leading-none text-white transition duration-200 hover:translate-x-1 hover:bg-[#295498] hover:shadow-[0_8px_18px_rgba(14,35,70,0.22)] focus-visible:bg-[#295498] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9fbef1] active:scale-[0.99] [&::-webkit-details-marker]:hidden ${
            item.active ? 'font-semibold' : 'font-medium opacity-80 hover:opacity-100'
          }`}
        >
          <Icon aria-hidden="true" size={24} strokeWidth={2} />
          <span>{item.label}</span>
          {IndicatorIcon ? (
            <IndicatorIcon
              aria-hidden="true"
              className="ml-auto transition-transform duration-200 group-open:rotate-180"
              size={18}
              strokeWidth={2.2}
            />
          ) : null}
        </summary>

        <div className="ml-[56px] mt-3 grid gap-2">
          {item.children.map((child) => {
            const ChildIcon = child.icon

            return (
              <a
                aria-current={child.active ? 'page' : undefined}
                className={`inline-flex h-9 items-center gap-2 rounded-md px-3 text-[14px] text-white no-underline transition duration-200 hover:translate-x-1 hover:bg-[#295498] active:scale-[0.99] ${
                  child.active ? 'bg-[#295498] font-semibold' : 'font-medium opacity-80 hover:opacity-100'
                }`}
                href={child.href}
                key={child.label}
              >
                <ChildIcon aria-hidden="true" size={16} strokeWidth={2.1} />
                {child.label}
              </a>
            )
          })}
        </div>
      </details>
    )
  }

  return (
    <a
      aria-current={item.active ? 'page' : undefined}
      className={`flex h-[43px] items-center gap-[15px] rounded-md px-[18px] text-[22px] leading-none text-white no-underline transition duration-200 hover:translate-x-1 hover:bg-[#295498] hover:shadow-[0_8px_18px_rgba(14,35,70,0.22)] focus-visible:bg-[#295498] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9fbef1] active:scale-[0.99] ${
        item.active ? 'font-semibold' : 'font-medium opacity-80 hover:opacity-100'
      }`}
      href={item.href}
    >
      <Icon aria-hidden="true" size={24} strokeWidth={2} />
      <span>{item.label}</span>
      {IndicatorIcon ? (
        <IndicatorIcon aria-hidden="true" className="ml-auto" size={18} strokeWidth={2.2} />
      ) : null}
    </a>
  )
}

export function AppSidebar({ brand, items, profile, utilityItem }: AppSidebarProps) {
  const { logout } = useAuth()

  return (
    <aside className="hidden min-h-svh w-[287px] shrink-0 flex-col bg-[#1b3a6b] px-[23px] pb-6 pt-6 text-[#dfdddd] lg:flex">
      <a className="flex items-start gap-[11px] no-underline" href={brand.href} aria-label={`${brand.name} home`}>
        <BrandLogo className="size-[55px] bg-white p-1" />
        <span className="pt-0">
          <span className="block text-[20px] font-semibold leading-none text-[#dfdddd]">
            {brand.name}
          </span>
          <span className="mt-1 block max-w-[198px] text-[10px] font-extralight leading-[1.18] text-[#f7f4ec]">
            {brand.subtitle}
          </span>
        </span>
      </a>

      <nav className="mt-[92px] grid gap-[31px]" aria-label="Primary navigation">
        {items.map((item) => {
          const Icon = item.icon

          return (
            <a
              aria-current={item.active ? 'page' : undefined}
              className={`flex h-[43px] items-center gap-[15px] rounded-md px-[18px] text-[20px] leading-none text-white no-underline transition duration-200 hover:translate-x-1 hover:bg-[#295498] hover:shadow-[0_8px_18px_rgba(14,35,70,0.22)] focus-visible:bg-[#295498] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9fbef1] active:scale-[0.99] ${
                item.active ? 'font-semibold' : 'font-medium opacity-80 hover:opacity-100'
              }`}
              href={item.href}
              key={item.label}
            >
              <Icon aria-hidden="true" size={24} strokeWidth={2} />
              <span>{item.label}</span>
            </a>
          )
        })}

        {utilityItem ? <SidebarUtilityLink item={utilityItem} /> : null}
      </nav>

      <div className="mt-auto grid gap-3 border-t border-[#f7f4ec]/70 pt-4">
        <a
          className="flex items-center gap-2 rounded-md no-underline transition duration-200 hover:translate-x-1 hover:bg-[#295498]/60"
          href={profile.href}
        >
          <span className="size-[52px] rounded-full bg-[#d9d9d9]" aria-hidden="true" />
          <span>
            <span className="block text-[10px] font-extrabold leading-none text-[#f7f4ec]">
              {profile.name}
            </span>
            <span className="mt-1 block text-[13px] font-normal leading-none text-[#b2b2b2]">
              {profile.role}
            </span>
          </span>
        </a>
        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/45 bg-transparent text-[13px] font-semibold text-white transition duration-200 hover:bg-[#295498] active:scale-[0.98]"
          onClick={logout}
          type="button"
        >
          <LogOut aria-hidden="true" size={15} />
          Log out
        </button>
      </div>
    </aside>
  )
}
