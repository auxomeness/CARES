import type { AuthModeConfig } from '../types'

type MobileHeroProps = {
  config: AuthModeConfig
  isRegister: boolean
}

export function MobileHero({ config, isRegister }: MobileHeroProps) {
  return (
    <div
      className={`box-border bg-[#1b3a6b] px-[22px] pb-0 pl-[23px] pt-[89px] text-white lg:hidden ${
        isRegister ? 'h-[282px]' : 'h-[289px]'
      }`}
    >
      <h1 className="m-0 text-[48px] font-semibold leading-[0.98] tracking-[2.88px]">
        {config.mobileTitle}
      </h1>
      <p className="m-0 mt-1.5 w-[min(355px,100%)] text-[20px] font-light leading-[1.04] tracking-[1.2px]">
        {config.mobileLead}
      </p>
      <p className="m-0 mt-[25px] w-[min(385px,100%)] text-[13px] font-extralight leading-[1.16] tracking-[0.13px] text-[#f7f4ec]/80">
        Submit a concern, complaint, or suggestion and track its progress.
      </p>
    </div>
  )
}
