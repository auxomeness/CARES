import type { AuthMode } from '../types'

type AuthOptionsProps = {
  mode: AuthMode
}

export function AuthOptions({ mode }: AuthOptionsProps) {
  const compactText =
    mode === 'login'
      ? 'text-[9px] tracking-normal'
      : 'text-[11px] tracking-[0.44px]'
  const compactCheckbox =
    mode === 'login' ? 'h-3 w-[13px]' : 'h-[14px] w-[15px]'

  return (
    <div className="mt-[7px] flex items-center justify-between lg:mt-2">
      <label
        className={`inline-flex items-center gap-[5px] font-light leading-none text-black lg:gap-2 lg:text-[13px] lg:tracking-[0.52px] ${compactText}`}
      >
        <input
          className={`m-0 rounded-[3px] accent-[#1b3a6b] lg:h-[19px] lg:w-5 ${compactCheckbox}`}
          type="checkbox"
        />
        <span>Keep me signed in</span>
      </label>
      <a
        className={`font-extrabold leading-none text-[#1b3a6b] no-underline lg:text-[13px] lg:tracking-[0.52px] ${compactText}`}
        href="#forgot-password"
      >
        Forgot Password?
      </a>
    </div>
  )
}
