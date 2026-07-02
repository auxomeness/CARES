import type { AuthMode, AuthModeConfig } from '../types'
import { AuthForm } from './AuthForm'
import { AuthTabs } from './AuthTabs'
import { MobileHero } from './MobileHero'

type AuthPanelProps = {
  config: AuthModeConfig
  mode: AuthMode
  onModeChange: (mode: AuthMode) => void
}

export function AuthPanel({ config, mode, onModeChange }: AuthPanelProps) {
  const isRegister = mode === 'register'

  return (
    <section
      className="min-h-svh bg-[#1b3a6b] lg:flex lg:items-start lg:justify-start lg:bg-[#f2f2f2] lg:pb-[46px] lg:pl-[clamp(32px,calc(50vw-469px),168px)] lg:pr-6 lg:pt-[120px]"
      aria-label={`${config.tab} form`}
    >
      <MobileHero config={config} isRegister={isRegister} />

      {!isRegister ? (
        <p className="fixed bottom-4 left-4 z-50 m-0 rounded bg-black/30 px-2 py-1 text-[11px] font-semibold leading-none text-white shadow-sm backdrop-blur-sm">
          v1.0.1
        </p>
      ) : null}

      <div
        className={`relative box-border min-h-[calc(100svh-289px)] w-full overflow-hidden rounded-t-[15px] bg-[#f7f4ec] px-[52px] pb-10 lg:min-h-0 lg:w-[445px] lg:rounded-none lg:bg-transparent lg:p-0 ${
          isRegister
            ? 'min-h-[calc(100svh-282px)] pt-16'
            : 'pt-[57px]'
        }`}
      >
        <AuthTabs mode={mode} onModeChange={onModeChange} />

        <div
          className={
            isRegister
              ? 'animate-[authSwipeInFromRight_300ms_ease-out_both]'
              : 'animate-[authSwipeInFromLeft_300ms_ease-out_both]'
          }
          key={mode}
        >
          <div className="mt-[35px] hidden lg:block">
            <h2 className="m-0 text-[35px] font-semibold leading-[1.1] tracking-[1.4px] text-[#1b3a6b]">
              {config.desktopTitle}
            </h2>
            <p className="m-0 mt-[9px] max-w-[445px] text-[18px] font-medium leading-[1.16] tracking-[1.08px] text-[#486b96]">
              {config.desktopLead}
            </p>
          </div>

          <AuthForm config={config} mode={mode} onModeChange={onModeChange} />

          <div
            className={`ml-[-13px] h-px w-[317px] max-w-[calc(100vw-78px)] bg-[#1b3a6b] lg:ml-[-3px] lg:w-[469px] lg:max-w-none ${
              isRegister ? 'mt-[37px] lg:mt-11' : 'mt-[60px] lg:mt-11'
            }`}
            aria-hidden="true"
          />

          <p className="m-0 mt-5 text-center text-[10px] font-light leading-[1.2] tracking-[0.36px] text-[#1b3a6b] lg:hidden">
            Centralized Ateneo Response and Engagement System
          </p>
        </div>
      </div>
    </section>
  )
}
