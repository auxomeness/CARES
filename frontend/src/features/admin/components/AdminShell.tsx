import { LogOut, Menu, UserRound, X } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import { adminNav, type AdminSection } from '../adminData'

type AdminShellProps = {
  activeSection: AdminSection
  children: ReactNode
}

export function AdminShell({ activeSection, children }: AdminShellProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { logout } = useAuth()
  const mobileNav = [
    ...adminNav,
    { section: 'dashboard' as const, label: 'User', href: '#admin-profile', icon: UserRound },
  ]

  return (
    <main className="min-h-svh overflow-x-hidden bg-[#f2f2f2] text-[#101010] lg:flex">
      <aside className="hidden min-h-svh w-[287px] shrink-0 flex-col bg-[#101827] px-[23px] pb-6 pt-6 text-white lg:flex">
        <a className="flex items-start gap-[11px] no-underline" href="#admin">
          <span className="grid size-[55px] shrink-0 place-items-center rounded-[5px] bg-[#d4a017]" />
          <span>
            <span className="block text-[20px] font-semibold leading-none">CARES Admin</span>
            <span className="mt-1 block max-w-[198px] text-[10px] font-extralight leading-[1.18]">
              System analytics, accounts, offices, departments, and faculty records
            </span>
          </span>
        </a>

        <nav className="mt-[92px] grid gap-6" aria-label="Admin navigation">
          {adminNav.map((item) => {
            const Icon = item.icon
            const isActive = item.section === activeSection

            return (
              <a
                className={`flex min-h-[43px] items-center gap-[15px] rounded-md px-[18px] text-[19px] leading-tight text-white no-underline transition duration-200 hover:translate-x-1 hover:bg-[#1b3a6b] hover:shadow-[0_8px_18px_rgba(14,35,70,0.22)] active:scale-[0.99] ${
                  isActive ? 'bg-[#1b3a6b] font-semibold' : 'font-medium opacity-80 hover:opacity-100'
                }`}
                href={item.href}
                key={item.label}
              >
                <Icon aria-hidden="true" size={22} />
                {item.label}
              </a>
            )
          })}
        </nav>

        <div className="mt-auto grid gap-3 border-t border-white/70 pt-4">
          <a
            className="flex items-center gap-2 rounded-md text-white no-underline transition duration-200 hover:translate-x-1 hover:bg-[#1b3a6b]/70"
            href="#admin-profile"
          >
            <span className="grid size-[52px] place-items-center rounded-full bg-white/20">
              <UserRound aria-hidden="true" size={22} />
            </span>
            <span>
              <span className="block text-[10px] font-extrabold leading-none">System Admin</span>
              <span className="mt-1 block text-[13px] leading-none text-white/70">Full Access</span>
            </span>
          </a>
          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/45 bg-transparent text-[13px] font-semibold text-white transition duration-200 hover:bg-[#1b3a6b] active:scale-[0.98]"
            onClick={logout}
            type="button"
          >
            <LogOut aria-hidden="true" size={15} />
            Log out
          </button>
        </div>
      </aside>

      <div className="min-h-svh min-w-0 flex-1 px-4 pb-[92px] pt-5 sm:px-6 lg:px-8 lg:pb-12 lg:pt-10">
        <header className="mb-6 flex items-start justify-between gap-4 lg:hidden">
          <div>
            <p className="m-0 text-[11px] font-bold uppercase tracking-[0.08em] text-[#1b3a6b]">
              Admin
            </p>
            <h1 className="m-0 mt-1 text-[24px] font-bold leading-tight text-[#1b3a6b]">
              {adminNav.find((item) => item.section === activeSection)?.label}
            </h1>
          </div>
          <button
            aria-label="Open admin menu"
            className="grid size-10 place-items-center rounded-[6px] border border-[#1b3a6b] bg-white text-[#1b3a6b] shadow-sm transition duration-200 active:scale-95"
            onClick={() => setIsMenuOpen(true)}
            type="button"
          >
            <Menu aria-hidden="true" size={20} />
          </button>
        </header>

        {children}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-40 grid h-[67px] grid-cols-5 bg-[#101827] px-4 pt-3 shadow-[0_-8px_24px_rgba(16,24,39,0.25)] lg:hidden">
        {mobileNav.map((item) => {
          const Icon = item.icon
          const isActive =
            item.href === '#admin-profile'
              ? window.location.hash === '#admin-profile'
              : item.section === activeSection

          return (
            <a
              className="group grid min-w-0 justify-items-center gap-1 text-[8px] font-semibold leading-none text-white no-underline transition duration-200 hover:-translate-y-0.5 active:scale-95"
              href={item.href}
              key={item.label}
            >
              <span
                className={`grid size-[29px] place-items-center rounded-md transition duration-200 group-hover:bg-[#1b3a6b] ${
                  isActive ? 'bg-[#1b3a6b]' : 'bg-[#101827] text-white/90'
                }`}
              >
                <Icon aria-hidden="true" size={22} />
              </span>
              <span className="max-w-full truncate text-white">{item.label}</span>
            </a>
          )
        })}
      </nav>

      {isMenuOpen ? (
        <div className="fixed inset-0 z-50 bg-[#101010]/35 px-3 py-4 backdrop-blur-[2px] lg:hidden">
          <aside className="ml-auto h-full max-w-[340px] animate-[modalIn_220ms_ease-out] rounded-[8px] bg-[#101827] p-4 text-white shadow-[0_18px_45px_rgba(16,24,39,0.28)]">
            <div className="flex items-start justify-between gap-4">
              <h2 className="m-0 text-[22px] font-semibold">Admin Menu</h2>
              <button
                aria-label="Close admin menu"
                className="grid size-9 place-items-center rounded-full border border-white/50 text-white transition duration-200 hover:bg-white/10 active:scale-95"
                onClick={() => setIsMenuOpen(false)}
                type="button"
              >
                <X aria-hidden="true" size={18} />
              </button>
            </div>

            <div className="mt-6 grid gap-2">
              {adminNav.map((item) => {
                const Icon = item.icon
                return (
                  <a
                    className="inline-flex min-h-11 items-center gap-3 rounded-[6px] px-3 text-[14px] font-semibold text-white no-underline transition duration-200 hover:translate-x-1 hover:bg-[#1b3a6b]"
                    href={item.href}
                    key={item.label}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon aria-hidden="true" size={18} />
                    {item.label}
                  </a>
                )
              })}
              <a
                className="inline-flex min-h-11 items-center gap-3 rounded-[6px] px-3 text-[14px] font-semibold text-white no-underline transition duration-200 hover:translate-x-1 hover:bg-[#1b3a6b]"
                href="#admin-profile"
                onClick={() => setIsMenuOpen(false)}
              >
                <UserRound aria-hidden="true" size={18} />
                Profile
              </a>
              <button
                className="inline-flex min-h-11 items-center gap-3 rounded-[6px] px-3 text-[14px] font-semibold text-white transition duration-200 hover:translate-x-1 hover:bg-[#1b3a6b]"
                onClick={logout}
                type="button"
              >
                <LogOut aria-hidden="true" size={18} />
                Log out
              </button>
            </div>
          </aside>
        </div>
      ) : null}
    </main>
  )
}
