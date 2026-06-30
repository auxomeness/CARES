import { progressSteps } from '../auth.config'
import { AuthTypewriter } from './AuthTypewriter'

export function BrandPanel() {
  return (
    <section
      className="relative hidden min-h-svh flex-col overflow-hidden bg-[#1b3a6b] pb-[62px] pl-[clamp(64px,7.7vw,98px)] pr-[8%] pt-[50px] text-[#f7f4ec] lg:flex"
      aria-label="CARES overview"
    >
      <div className="flex items-center gap-2">
        <span
          className="h-[58px] w-[61px] shrink-0 animate-[softFloat_4s_ease-in-out_infinite] rounded-[18px] bg-[#f7f4ec]"
          aria-hidden="true"
        />
        <div>
          <p className="m-0 text-[25px] font-extrabold leading-none">CARES</p>
          <p className="m-0 mt-[5px] text-[11px] font-light leading-[1.2] text-[#f7f4ec]/75">
            Centralized Ateneo Response and Engagement System
          </p>
        </div>
      </div>

      <div className="mt-[clamp(110px,24svh,207px)] w-[min(436px,100%)]">
        <h1 className="m-0 max-w-[436px] text-[40px] font-semibold leading-[1.16] text-[#f7f4ec]">
          Every concern, directed with ease.
        </h1>

        <AuthTypewriter
          className="m-0 mt-5 min-h-[70px] max-w-[405px] text-[18px] leading-snug text-[#f5d788]"
          cursorClassName="h-[17px] bg-[#f5d788]"
        />
      </div>

      <ol
        className="relative ml-7 mt-[42px] grid w-max grid-cols-4 gap-x-[clamp(44px,6.3vw,74px)] p-0 before:absolute before:left-[5px] before:top-[5px] before:h-px before:w-[calc(100%-11px)] before:bg-[#f7f4ec]/35"
        aria-label="Concern progress"
      >
        <span
          className="absolute left-[5px] top-[5px] h-px animate-[progressGrow_3.8s_ease-in-out_infinite] bg-[#d4a017]"
          aria-hidden="true"
        />
        {progressSteps.map((step, index) => (
          <li
            className="relative flex min-w-[58px] list-none flex-col items-center text-[12px] font-light leading-none text-[#f7f4ec]/90"
            key={`${step}-${index}`}
          >
            <span
              className={`z-10 mb-3 h-[11px] w-[11px] rounded-full ${
                index === progressSteps.length - 1
                  ? 'animate-[statusPulse_1.6s_ease-in-out_infinite] bg-[#f7f4ec]'
                  : 'bg-[#c9a92d]'
              }`}
              aria-hidden="true"
            />
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
