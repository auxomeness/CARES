import { Menu, X } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import type { StaffRoleConfig, StaffSection } from '../staffData'

type StaffWorkspaceShellProps = {
  activeSection: StaffSection
  children: ReactNode
  config: StaffRoleConfig
}

export function StaffWorkspaceShell({
  activeSection,
  children,
  config,
}: StaffWorkspaceShellProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const activeNav = config.nav.find((item) => item.section === activeSection)

  return (
    <main className="min-h-svh overflow-x-hidden bg-[#f2f2f2] text-[#101010] lg:flex">
      <aside className="hidden min-h-svh w-[287px] shrink-0 flex-col bg-[#1b3a6b] px-[23px] pb-6 pt-6 text-white lg:flex">
        <a className="flex items-start gap-[11px] no-underline" href={config.baseHash}>
          <span
            className="grid size-[55px] shrink-0 place-items-center rounded-[5px]"
            style={{ backgroundColor: config.accent }}
          />
          <span>
            <span className="block text-[20px] font-semibold leading-none">CARES</span>
            <span className="mt-1 block max-w-[198px] text-[10px] font-extralight leading-[1.18]">
              Centralized Ateneo Response and Engagement System
            </span>
          </span>
        </a>

        <nav className="mt-[92px] grid gap-6" aria-label={`${config.title} navigation`}>
          {config.nav.map((item) => {
            const Icon = item.icon
            const isActive = item.section === activeSection

            return (
              <a
                aria-current={isActive ? 'page' : undefined}
                className={`flex min-h-[43px] items-center gap-[15px] rounded-md px-[18px] text-[19px] leading-tight text-white no-underline transition duration-200 hover:translate-x-1 hover:bg-[#295498] hover:shadow-[0_8px_18px_rgba(14,35,70,0.22)] active:scale-[0.99] ${
                  isActive ? 'bg-[#295498] font-semibold' : 'font-medium opacity-80 hover:opacity-100'
                }`}
                href={item.href}
                key={item.label}
              >
                <Icon aria-hidden="true" size={23} strokeWidth={2} />
                <span>{item.label}</span>
              </a>
            )
          })}
        </nav>

        <div className="mt-auto border-t border-white/70 pt-4">
          <p className="m-0 text-[10px] font-extrabold leading-none">{config.profileName}</p>
          <p className="m-0 mt-1 text-[13px] leading-none text-white/70">{config.profileRole}</p>
        </div>
      </aside>

      <div className="min-h-svh min-w-0 flex-1 px-4 pb-[92px] pt-5 sm:px-6 lg:px-8 lg:pb-12 lg:pt-10">
        <header className="mb-6 flex items-start justify-between gap-4 lg:hidden">
          <div>
            <p className="m-0 text-[11px] font-bold uppercase tracking-[0.08em] text-[#1b3a6b]">
              {config.profileRole}
            </p>
            <h1 className="m-0 mt-1 text-[24px] font-bold leading-tight text-[#1b3a6b]">
              {activeNav?.label ?? config.title}
            </h1>
          </div>
          <button
            aria-label="Open role menu"
            className="grid size-10 place-items-center rounded-[6px] border border-[#1b3a6b] bg-white text-[#1b3a6b] shadow-sm transition duration-200 active:scale-95"
            onClick={() => setIsMenuOpen(true)}
            type="button"
          >
            <Menu aria-hidden="true" size={20} />
          </button>
        </header>

        {children}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-40 grid h-[67px] bg-[#1b3a6b] px-4 pt-3 shadow-[0_-8px_24px_rgba(27,58,107,0.22)] lg:hidden" style={{ gridTemplateColumns: `repeat(${config.nav.length}, minmax(0, 1fr))` }}>
        {config.nav.map((item) => {
          const Icon = item.icon
          const isActive = item.section === activeSection

          return (
            <a
              className="group grid justify-items-center gap-1 text-[7px] font-bold leading-none text-white no-underline transition duration-200 hover:-translate-y-0.5 active:scale-95"
              href={item.href}
              key={item.label}
            >
              <span
                className={`grid size-[29px] place-items-center rounded-md transition duration-200 group-hover:bg-[#295498] ${
                  isActive ? 'bg-[#295498]' : 'bg-[#1b3a6b] text-white/90'
                }`}
              >
                <Icon aria-hidden="true" size={22} strokeWidth={2} />
              </span>
              <span className="text-white">{item.label}</span>
            </a>
          )
        })}
      </nav>

      {isMenuOpen ? (
        <div className="fixed inset-0 z-50 bg-[#101010]/35 px-3 py-4 backdrop-blur-[2px] lg:hidden">
          <aside className="ml-auto h-full max-w-[340px] animate-[modalIn_220ms_ease-out] rounded-[8px] bg-[#1b3a6b] p-4 text-white shadow-[0_18px_45px_rgba(27,58,107,0.28)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/65">
                  CARES
                </p>
                <h2 className="m-0 mt-1 text-[22px] font-semibold">{config.title}</h2>
              </div>
              <button
                aria-label="Close role menu"
                className="grid size-9 place-items-center rounded-full border border-white/50 text-white transition duration-200 hover:bg-white/10 active:scale-95"
                onClick={() => setIsMenuOpen(false)}
                type="button"
              >
                <X aria-hidden="true" size={18} />
              </button>
            </div>

            <div className="mt-6 grid gap-2">
              {config.nav.map((item) => {
                const Icon = item.icon
                return (
                  <a
                    className="inline-flex min-h-11 items-center gap-3 rounded-[6px] px-3 text-[14px] font-semibold text-white no-underline transition duration-200 hover:translate-x-1 hover:bg-[#295498]"
                    href={item.href}
                    key={item.label}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon aria-hidden="true" size={18} />
                    {item.label}
                  </a>
                )
              })}
            </div>
          </aside>
        </div>
      ) : null}
    </main>
  )
}
