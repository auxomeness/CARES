import { CalendarDays, Clock } from 'lucide-react'
import type { StudentAppointment } from '../studentData.types'
import { getAppointmentStatusClass } from '../studentUi'

type StudentHomeAppointmentCardProps = {
  appointment: StudentAppointment
  onView: (appointment: StudentAppointment) => void
}

export function StudentHomeAppointmentCard({ appointment, onView }: StudentHomeAppointmentCardProps) {
  return (
    <article className="flex min-h-[150px] flex-col rounded-[5px] border border-[#295498]/70 bg-white px-4 py-4 shadow-[3px_3px_2.5px_1px_#1b3a6b] transition duration-200 hover:-translate-y-0.5 hover:shadow-[4px_5px_4px_1px_#1b3a6b] active:scale-[0.995]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="m-0 text-[11px] font-semibold leading-none text-[#1b3a6b]">
            {appointment.id}
          </p>
          <p className="m-0 mt-1 text-[11px] font-medium leading-none text-[#707070]">
            {appointment.mode === 'office' ? appointment.office : appointment.department}
          </p>
        </div>

        <span
          className={`inline-flex min-h-[24px] items-center rounded-[5px] border px-3 text-[10px] font-semibold leading-none ${getAppointmentStatusClass(
            appointment.status,
          )}`}
        >
          {appointment.status}
        </span>
      </div>

      <h2 className="m-0 mt-3 text-[21px] font-semibold leading-tight text-[#101010] sm:text-[23px]">
        {appointment.purpose}
      </h2>
      <p className="m-0 mt-2 max-w-[520px] text-[13px] font-light leading-[1.35] text-[#101010]">
        {appointment.description}
      </p>

      <div className="mt-auto flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3 text-[12px] font-medium text-[#434343]">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays aria-hidden="true" size={14} />
            {appointment.date}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock aria-hidden="true" size={14} />
            {appointment.time}
          </span>
        </div>

        <button
          className="relative inline-flex h-[30px] min-w-[118px] items-center justify-center overflow-hidden rounded-[5px] bg-[#1b3a6b] px-3 text-[12px] font-semibold leading-none !text-white no-underline transition duration-200 hover:bg-[#295498] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9fbef1] active:scale-[0.98] [&_*]:!text-white"
          onClick={() => onView(appointment)}
          type="button"
        >
          View Appointment
        </button>
      </div>
    </article>
  )
}
