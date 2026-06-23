import { progressSteps } from '../auth.config'

export function BrandPanel() {
  return (
    <section
      className="relative hidden min-h-svh flex-col bg-[#1b3a6b] pb-[62px] pl-[clamp(64px,7.7vw,98px)] pr-[8%] pt-[50px] text-[#f7f4ec] lg:flex"
      aria-label="CARES overview"
    >
      <div className="flex items-center gap-2">
        <span
          className="h-[58px] w-[61px] shrink-0 rounded-[20px] bg-[#f7f4ec]"
          aria-hidden="true"
        />
        <div>
          <p className="m-0 text-[27px] font-extrabold leading-none">CARES</p>
          <p className="m-0 mt-[3px] text-[12px] font-light leading-[1.15] text-[#f7f4ec]/75">
            Centralized Ateneo Response and Engagement System
          </p>
        </div>
      </div>

      <div className="mt-[clamp(110px,24svh,207px)] w-[min(436px,100%)]">
        <h1 className="m-0 max-w-[436px] text-[45px] font-normal leading-[1.18] text-[#f7f4ec]">
          Every concern, directed with ease.
        </h1>
        <p className="m-0 mt-5 max-w-[405px] text-[23px] font-extralight leading-[1.08] tracking-[0.23px] text-[#f7f4ec]/85">
          Submit a concern, complaint, or suggestion and track its progress.
        </p>
      </div>

      <ol
        className="relative ml-7 mt-[42px] grid w-max grid-cols-4 gap-x-[clamp(44px,6.3vw,74px)] p-0 before:absolute before:left-[5px] before:top-[5px] before:h-px before:w-[calc(100%-11px)] before:bg-[#f7f4ec]/70"
        aria-label="Concern progress"
      >
        {progressSteps.map((step, index) => (
          <li
            className="relative flex min-w-[58px] list-none flex-col items-center text-[12px] font-light leading-none text-[#f7f4ec]/90"
            key={`${step}-${index}`}
          >
            <span
              className={`z-10 mb-3 h-[11px] w-[11px] rounded-full ${
                index === progressSteps.length - 1 ? 'bg-[#f7f4ec]' : 'bg-[#c9a92d]'
              }`}
              aria-hidden="true"
            />
            <span>{step}</span>
          </li>
        ))}
      </ol>

      <div className="mt-auto ml-[-35px] h-px w-[min(512px,86%)] bg-[#f7f4ec]/75" aria-hidden="true" />
    </section>
  )
}
