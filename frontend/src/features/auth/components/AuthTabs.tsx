import { authModeList, authModes } from '../auth.config'
import type { AuthMode } from '../types'

type AuthTabsProps = {
  mode: AuthMode
  onModeChange: (mode: AuthMode) => void
}

export function AuthTabs({ mode, onModeChange }: AuthTabsProps) {
  return (
    <div
      className="ml-[33px] hidden h-[46px] w-[396px] grid-cols-2 rounded-[10px] bg-[#84a2c7] p-[5px] lg:grid"
      role="tablist"
      aria-label="Authentication mode"
    >
      {authModeList.map((authMode) => (
        <button
          aria-selected={mode === authMode}
          className="cursor-pointer rounded-md border-0 bg-transparent text-[18px] font-medium leading-none tracking-[1.8px] text-[#1b3a6b] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3875d7] aria-selected:bg-white"
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
