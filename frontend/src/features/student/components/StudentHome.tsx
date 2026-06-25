import { lazy, Suspense, useState } from 'react'
import { Building2, CalendarDays, Clock, FileText, X } from 'lucide-react'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { SearchField } from '@/components/forms/SearchField'
import {
  studentDashboardIntro,
  studentHomeActions,
} from '../home.config'
import { useStudentData } from '../context/studentDataStore'
import type { StudentAppointment } from '../studentData.types'
import { getAppointmentStatusClass } from '../studentUi'
import { StudentHomeAppointmentCard } from './StudentHomeAppointmentCard'
import { StudentQuickActions } from './StudentQuickActions'
import { StudentRightPanelSkeleton } from './StudentRightPanelSkeleton'
import { StudentWorkspaceShell } from './StudentWorkspaceShell'

const StudentRightPanel = lazy(() =>
  import('./StudentRightPanel').then((module) => ({ default: module.StudentRightPanel })),
)

export function StudentHome() {
  const { appointments } = useStudentData()
  const [selectedAppointment, setSelectedAppointment] = useState<StudentAppointment | null>(null)
  const visibleAppointments = appointments.slice(0, 3)

  return (
    <StudentWorkspaceShell
      activeSection="home"
      contentClassName="max-w-none"
      rightRail={
        <Suspense fallback={<StudentRightPanelSkeleton />}>
          <StudentRightPanel />
        </Suspense>
      }
    >
      <DashboardHeader
        title={studentDashboardIntro.title}
        subtitle={studentDashboardIntro.subtitle}
      />

      <SearchField className="mx-auto mt-5 h-9 w-full xl:hidden" />

      <section className="mt-[17px] min-h-[125px] rounded-[5px] border border-[#295498]/70 bg-[#f5d788] px-[9px] py-3 shadow-[3px_3px_2.5px_1px_#1b3a6b] transition duration-200 hover:-translate-y-0.5 hover:shadow-[4px_5px_4px_1px_#1b3a6b] lg:mt-[45px] lg:min-h-[156px] lg:px-[14px]">
        <h2 className="m-0 text-[25px] font-semibold leading-none text-[#1b3a6b] lg:text-[27px]">
          {studentDashboardIntro.greeting}
        </h2>
        <p className="m-0 mt-[14px] max-w-[637px] text-[10px] font-light leading-[1.4] text-[#101010] lg:text-[14px]">
          {studentDashboardIntro.description}
        </p>

        <div className="mt-[17px] lg:mt-10">
          <StudentQuickActions actions={studentHomeActions} />
        </div>
      </section>

      <section
        className="mt-[41px] grid gap-[25px] lg:mt-14 lg:gap-[15px] 2xl:grid-cols-2"
        aria-label="Upcoming appointments"
      >
        {visibleAppointments.map((appointment) => (
          <StudentHomeAppointmentCard
            appointment={appointment}
            key={appointment.id}
            onView={setSelectedAppointment}
          />
        ))}

        {visibleAppointments.length === 0 ? (
          <div className="rounded-[5px] border border-[#295498]/70 bg-white px-5 py-8 text-center text-[14px] text-[#434343] shadow-[3px_3px_2.5px_1px_#1b3a6b]">
            No appointments yet. Book an appointment to see it here.
          </div>
        ) : null}
      </section>

      {selectedAppointment ? (
        <div className="fixed inset-0 z-50 grid place-items-end bg-[#101010]/35 px-3 pb-3 pt-8 backdrop-blur-[2px] sm:place-items-center sm:p-6">
          <article className="w-full max-w-[560px] animate-[modalIn_220ms_ease-out] rounded-[8px] border border-[#1b3a6b] bg-white px-5 py-5 shadow-[0_18px_45px_rgba(27,58,107,0.28)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="m-0 text-[11px] font-semibold text-[#1b3a6b]">
                  {selectedAppointment.id}
                </p>
                <h2 className="m-0 mt-2 text-[24px] font-semibold leading-tight text-[#101010]">
                  {selectedAppointment.purpose}
                </h2>
              </div>
              <button
                aria-label="Close appointment details"
                className="grid size-9 shrink-0 place-items-center rounded-full border border-[#1b3a6b] text-[#1b3a6b] transition duration-200 hover:bg-[#edf4ff] active:scale-95"
                onClick={() => setSelectedAppointment(null)}
                type="button"
              >
                <X aria-hidden="true" size={18} />
              </button>
            </div>

            <span
              className={`mt-4 inline-flex min-h-[24px] items-center rounded-[5px] border px-3 text-[10px] font-semibold ${getAppointmentStatusClass(
                selectedAppointment.status,
              )}`}
            >
              {selectedAppointment.status}
            </span>

            <dl className="mt-5 grid gap-3 text-[13px] sm:grid-cols-2">
              <div className="rounded-[5px] bg-[#edf4ff] px-3 py-3">
                <dt className="inline-flex items-center gap-2 font-semibold text-[#1b3a6b]">
                  <Building2 aria-hidden="true" size={15} />
                  Target
                </dt>
                <dd className="m-0 mt-1 leading-snug text-[#434343]">
                  {selectedAppointment.mode === 'office'
                    ? selectedAppointment.office
                    : selectedAppointment.department}
                </dd>
              </div>
              <div className="rounded-[5px] bg-[#edf4ff] px-3 py-3">
                <dt className="inline-flex items-center gap-2 font-semibold text-[#1b3a6b]">
                  <CalendarDays aria-hidden="true" size={15} />
                  Date
                </dt>
                <dd className="m-0 mt-1 leading-snug text-[#434343]">
                  {selectedAppointment.date}
                </dd>
              </div>
              <div className="rounded-[5px] bg-[#edf4ff] px-3 py-3">
                <dt className="inline-flex items-center gap-2 font-semibold text-[#1b3a6b]">
                  <Clock aria-hidden="true" size={15} />
                  Time
                </dt>
                <dd className="m-0 mt-1 leading-snug text-[#434343]">
                  {selectedAppointment.time}
                </dd>
              </div>
              <div className="rounded-[5px] bg-[#edf4ff] px-3 py-3">
                <dt className="inline-flex items-center gap-2 font-semibold text-[#1b3a6b]">
                  <FileText aria-hidden="true" size={15} />
                  Category
                </dt>
                <dd className="m-0 mt-1 leading-snug text-[#434343]">
                  {selectedAppointment.consultationCategory}
                </dd>
              </div>
            </dl>

            <p className="m-0 mt-4 rounded-[5px] border border-[#7fa8de] bg-white px-3 py-3 text-[13px] leading-snug text-[#434343]">
              {selectedAppointment.description}
            </p>
          </article>
        </div>
      ) : null}
    </StudentWorkspaceShell>
  )
}
