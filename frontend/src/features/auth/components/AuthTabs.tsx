import { authModeList, authModes } from '../auth.config'
import type { AuthMode } from '../types'

type AuthTabsProps = {
  mode: AuthMode
  onModeChange: (mode: AuthMode) => void
}

export function AuthTabs({ mode, onModeChange }: AuthTabsProps) {
  return (
    <div
      className="relative ml-[33px] hidden h-[46px] w-[396px] grid-cols-2 overflow-hidden rounded-[10px] bg-[#84a2c7] p-[5px] lg:grid"
      role="tablist"
      aria-label="Authentication mode"
    >
      <span
        className={`pointer-events-none absolute left-[5px] top-[5px] h-9 w-[calc((100%-10px)/2)] rounded-md bg-white shadow-[0_4px_14px_rgba(27,58,107,0.18)] transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          mode === 'register' ? 'translate-x-full' : 'translate-x-0'
        }`}
        aria-hidden="true"
      />
      {authModeList.map((authMode) => (
        <button
          aria-selected={mode === authMode}
          className="relative z-10 cursor-pointer rounded-md border-0 bg-transparent text-[18px] font-medium leading-none tracking-[1.8px] text-[#1b3a6b] transition duration-300 hover:text-[#0f2d5d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3875d7] active:scale-[0.98] aria-selected:font-semibold"
          key={authMode}
          onClick={() => onModeChange(authMode)}
          role="tab"
          type="button"
        >
          {authModes[authMode].tab}
        </button>
      ))}
    </div>
  )
}
