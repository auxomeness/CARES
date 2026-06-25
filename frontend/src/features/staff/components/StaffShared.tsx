import type { ReactNode } from 'react'
import type { StaffAppointmentStatus, StaffConcernStatus } from '../staffData'
import { getStaffStatusClass } from '../staffUi'

type StaffStatCardProps = {
  icon: ReactNode
  label: string
  value: number | string
  detail?: string
}

type TimelineProps = {
  items: string[]
}

export function StaffStatusBadge({
  status,
}: {
  status: StaffConcernStatus | StaffAppointmentStatus
}) {
  return (
    <span
      className={`inline-flex min-h-[24px] items-center rounded-[5px] border px-3 text-[10px] font-semibold leading-none ${getStaffStatusClass(
        status,
      )}`}
    >
      {status}
    </span>
  )
}

export function StaffStatCard({ detail, icon, label, value }: StaffStatCardProps) {
  return (
    <article className="rounded-[6px] border border-[#295498]/70 bg-white px-4 py-4 shadow-[3px_3px_2.5px_1px_#1b3a6b] transition duration-200 hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <p className="m-0 text-[12px] font-medium leading-tight text-[#707070]">{label}</p>
        <span className="grid size-8 shrink-0 place-items-center rounded-[5px] bg-[#edf4ff] text-[#1b3a6b]">
          {icon}
        </span>
      </div>
      <p className="m-0 mt-3 text-[28px] font-bold leading-none text-[#1b3a6b]">{value}</p>
      {detail ? (
        <p className="m-0 mt-2 text-[11px] font-semibold leading-tight text-[#434343]">
          {detail}
        </p>
      ) : null}
    </article>
  )
}

export function StaffTimeline({ items }: TimelineProps) {
  return (
    <ol className="m-0 grid list-none gap-3 p-0">
      {items.map((item, index) => (
        <li className="grid grid-cols-[18px_minmax(0,1fr)] gap-3" key={`${item}-${index}`}>
          <span className="mt-0.5 grid size-[18px] place-items-center rounded-full bg-[#1b3a6b] text-[9px] font-bold text-white">
            {index + 1}
          </span>
          <p className="m-0 rounded-[5px] bg-[#edf4ff] px-3 py-2 text-[12px] font-medium leading-snug text-[#1b3a6b]">
            {item}
          </p>
        </li>
      ))}
    </ol>
  )
}
