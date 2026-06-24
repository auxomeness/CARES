type DashboardHeaderProps = {
  title: string
  subtitle: string
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  return (
    <header>
      <h1 className="m-0 text-[25px] font-bold leading-[1.1] text-[#1b3a6b] lg:text-[38px]">
        {title}
      </h1>
      <p className="m-0 mt-1 max-w-[513px] text-[10px] font-light leading-[1.25] text-[#434343] lg:text-[19px]">
        {subtitle}
      </p>
    </header>
  )
}
