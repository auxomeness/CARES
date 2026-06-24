import { lazy, Suspense } from 'react'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { SearchField } from '@/components/forms/SearchField'
import {
  studentDashboardIntro,
  studentHomeActions,
} from '../home.config'
import { useStudentData } from '../context/studentDataStore'
import { StudentHomeAppointmentCard } from './StudentHomeAppointmentCard'
import { StudentQuickActions } from './StudentQuickActions'
import { StudentRightPanelSkeleton } from './StudentRightPanelSkeleton'
import { StudentWorkspaceShell } from './StudentWorkspaceShell'

const StudentRightPanel = lazy(() =>
  import('./StudentRightPanel').then((module) => ({ default: module.StudentRightPanel })),
)

export function StudentHome() {
  const { appointments } = useStudentData()
  const visibleAppointments = appointments.slice(0, 3)

  return (
    <StudentWorkspaceShell
      activeSection="home"
      contentClassName="max-w-[632px]"
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

      <SearchField className="mt-[18px] h-8 w-full max-w-[375px] xl:hidden" />

      <section className="mt-[17px] min-h-[125px] max-w-[632px] rounded-[5px] border border-[#295498]/70 bg-[#f5d788] px-[9px] py-3 shadow-[3px_3px_2.5px_1px_#1b3a6b] transition duration-200 hover:-translate-y-0.5 hover:shadow-[4px_5px_4px_1px_#1b3a6b] lg:mt-[45px] lg:min-h-[156px] lg:px-[14px]">
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
        className="mt-[41px] grid max-w-[632px] gap-[25px] lg:mt-14 lg:gap-[15px]"
        aria-label="Upcoming appointments"
      >
        {visibleAppointments.map((appointment) => (
          <StudentHomeAppointmentCard appointment={appointment} key={appointment.id} />
        ))}

        {visibleAppointments.length === 0 ? (
          <div className="rounded-[5px] border border-[#295498]/70 bg-white px-5 py-8 text-center text-[14px] text-[#434343] shadow-[3px_3px_2.5px_1px_#1b3a6b]">
            No appointments yet. Book an appointment to see it here.
          </div>
        ) : null}
      </section>
    </StudentWorkspaceShell>
  )
}
