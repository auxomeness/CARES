export function StudentRightPanelSkeleton() {
  return (
    <aside className="hidden w-[350px] shrink-0 pt-[15px] xl:block" aria-label="Loading dashboard panels">
      <div className="h-9 w-full animate-pulse rounded-[29px] border border-[#1b3a6b]/40 bg-white" />

      <section className="mt-[68px] min-h-[197px] animate-pulse rounded-[15px] border border-[#1b3a6b]/60 bg-[#c1d9ff] px-[17px] py-4 shadow-[0_4px_4px_0_#1b3a6b]">
        <div className="h-5 w-40 rounded bg-white/60" />
        <div className="mt-5 grid gap-3">
          <div className="h-8 rounded-md bg-white/55" />
          <div className="h-8 rounded-md bg-white/55" />
          <div className="h-8 rounded-md bg-white/55" />
        </div>
      </section>

      <section className="mt-[33px] min-h-[235px] animate-pulse rounded-[15px] border border-[#1b3a6b]/60 bg-[#c1d9ff] px-[13px] py-4 shadow-[0_4px_4px_0_#1b3a6b]">
        <div className="h-5 w-36 rounded bg-white/60" />
        <div className="mt-[13px] h-px bg-[#1b3a6b]/60" />
        <div className="mt-4 grid gap-5">
          <div className="h-4 rounded bg-white/55" />
          <div className="h-4 rounded bg-white/55" />
          <div className="h-4 rounded bg-white/55" />
          <div className="h-4 rounded bg-white/55" />
        </div>
      </section>
    </aside>
  )
}
