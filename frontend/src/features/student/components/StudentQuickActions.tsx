import { LoadingLink } from '@/components/feedback/LoadingLink'
import type { StudentHomeAction } from '../home.config'

type StudentQuickActionsProps = {
  actions: StudentHomeAction[]
}

export function StudentQuickActions({ actions }: StudentQuickActionsProps) {
  return (
    <div className="flex flex-wrap gap-3 lg:gap-[14px]">
      {actions.map((action, index) => (
        <LoadingLink
          className={`relative grid h-6 place-items-center overflow-hidden rounded-[5px] border border-[#295498] bg-[#9fbef1] px-4 text-[9px] font-bold leading-none text-[#1b3a6b] no-underline shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-[#abc8f8] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1b3a6b] active:translate-y-0 active:scale-[0.98] lg:text-[11px] ${
            index === 1 ? 'min-w-[119px] lg:min-w-[146px]' : 'min-w-[104px] lg:min-w-[126px]'
          }`}
          href={action.href}
          key={action.label}
        >
          {action.label}
        </LoadingLink>
      ))}
    </div>
  )
}
