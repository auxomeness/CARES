import { LoadingLink } from '@/components/feedback/LoadingLink'
import type { StudentConcernSummary } from '../home.config'

type StudentConcernCardProps = {
  concern: StudentConcernSummary
}

export function StudentConcernCard({ concern }: StudentConcernCardProps) {
  return (
    <article className="relative min-h-[125px] rounded-[5px] border border-[#295498]/70 bg-white px-[9px] pb-8 pt-3 shadow-[3px_3px_2.5px_1px_#1b3a6b] transition duration-200 hover:-translate-y-0.5 hover:shadow-[4px_5px_4px_1px_#1b3a6b] lg:px-[9px] lg:pb-5 lg:pt-2.5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <p className="m-0 text-[10px] font-light leading-none text-[#1b3a6b] lg:text-[11px]">
            {concern.id}
          </p>
          <p className="m-0 text-[10px] font-medium leading-none text-[#aeaeae] lg:text-[11px]">
            {concern.location}
          </p>
        </div>

        <span className="grid h-3 min-w-10 place-items-center rounded-[5px] bg-[#d4a017] px-2 text-[6px] font-medium leading-none text-[#101010] lg:h-[18px] lg:min-w-[67px] lg:text-[10px]">
          {concern.status}
        </span>
      </div>

      <h2 className="m-0 mt-[3px] text-[27px] font-semibold leading-none text-[#101010] lg:mt-2 lg:text-[22px]">
        {concern.title}
      </h2>
      <p className="m-0 mt-[13px] max-w-[520px] text-[11px] font-light leading-[1.25] text-[#101010] lg:mt-2 lg:text-[13px]">
        {concern.description}
      </p>

      <LoadingLink
        className="absolute bottom-[9px] right-2 grid h-[19px] min-w-[115px] place-items-center overflow-hidden rounded-[5px] bg-[#1b3a6b] px-2 text-[11px] font-semibold leading-none !text-white no-underline transition duration-200 hover:bg-[#295498] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9fbef1] lg:h-[25px] lg:min-w-32 lg:text-[12px] [&_*]:!text-white"
        href="#student-appointments"
      >
        View Appointment
      </LoadingLink>
    </article>
  )
}
