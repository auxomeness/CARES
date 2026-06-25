import { Bell, ChevronUp, Send } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { StaffConcern, StaffRole } from '../staffData'
import {
  concernStatusOptions,
  staffAppointments,
  staffConcerns,
  staffMetricIcons,
  staffRoleConfigs,
} from '../staffData'
import type { StaffAppointment } from '../staffData'
import { StaffStatCard, StaffStatusBadge, StaffTimeline } from './StaffShared'
import { StaffWorkspaceShell } from './StaffWorkspaceShell'

type StaffDashboardProps = {
  role: StaffRole
}

function getConcernStats(concerns: StaffConcern[]) {
  return {
    active: concerns.filter((concern) => concern.status !== 'Resolved').length,
    new: concerns.filter((concern) => concern.status === 'New').length,
    resolved: concerns.filter((concern) => concern.status === 'Resolved').length,
    urgent: concerns.filter((concern) => concern.urgency !== 'Normal').length,
  }
}

function getAppointmentStats(appointments: StaffAppointment[]) {
  return {
    active: appointments.filter((appointment) => appointment.status !== 'Completed').length,
    approved: appointments.filter((appointment) => appointment.status === 'Approved').length,
    completed: appointments.filter((appointment) => appointment.status === 'Completed').length,
    requested: appointments.filter((appointment) => appointment.status === 'Requested').length,
  }
}

export function StaffDashboard({ role }: StaffDashboardProps) {
  const config = staffRoleConfigs[role]
  const isFaculty = role === 'faculty'
  const scopedConcerns = useMemo(
    () =>
      staffConcerns
        .filter((concern) => concern.role === role)
        .sort((left, right) => right.upCount - left.upCount),
    [role],
  )
  const scopedAppointments = useMemo(
    () => staffAppointments.filter((appointment) => appointment.role === role),
    [role],
  )
  const [selectedId, setSelectedId] = useState(
    scopedConcerns[0]?.id ?? scopedAppointments[0]?.id ?? '',
  )
  const [status, setStatus] = useState(scopedConcerns[0]?.status ?? 'New')
  const [isNotifying, setIsNotifying] = useState(false)
  const selectedConcern =
    scopedConcerns.find((concern) => concern.id === selectedId) ?? scopedConcerns[0] ?? null
  const selectedAppointment =
    scopedAppointments.find((appointment) => appointment.id === selectedId) ??
    scopedAppointments[0] ??
    null
  const stats = getConcernStats(scopedConcerns)
  const appointmentStats = getAppointmentStats(scopedAppointments)

  const commonConcerns = scopedConcerns.slice(0, 4)

  const handleSelect = (concern: StaffConcern) => {
    setSelectedId(concern.id)
    setStatus(concern.status)
    setIsNotifying(false)
  }

  const notifyStudent = () => {
    setIsNotifying(true)
    window.setTimeout(() => setIsNotifying(false), 850)
  }

  return (
    <StaffWorkspaceShell activeSection="dashboard" config={config}>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
        <section>
          <div>
            <p className="m-0 text-[12px] font-bold uppercase tracking-[0.08em] text-[#1b3a6b]">
              {config.unitName}
            </p>
            <h1 className="m-0 mt-1 text-[36px] font-bold leading-tight text-[#1b3a6b] sm:text-[44px]">
              {config.title}
            </h1>
            <p className="m-0 mt-2 max-w-[720px] text-[16px] font-light leading-snug text-[#434343]">
              {config.subtitle}
            </p>
          </div>

          <section
            className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 2xl:grid-cols-4"
            aria-label="Dashboard statistics"
          >
            {isFaculty ? (
              <>
                <StaffStatCard
                  icon={<staffMetricIcons.appointments aria-hidden="true" size={18} />}
                  label="Active Appointments"
                  value={appointmentStats.active}
                />
                <StaffStatCard
                  icon={<staffMetricIcons.notify aria-hidden="true" size={18} />}
                  label="Requests"
                  value={appointmentStats.requested}
                />
                <StaffStatCard
                  icon={<staffMetricIcons.resolved aria-hidden="true" size={18} />}
                  label="Approved"
                  value={appointmentStats.approved}
                />
                <StaffStatCard
                  icon={<staffMetricIcons.reports aria-hidden="true" size={18} />}
                  label="Completed"
                  value={appointmentStats.completed}
                />
              </>
            ) : (
              <>
                <StaffStatCard
                  icon={<staffMetricIcons.concerns aria-hidden="true" size={18} />}
                  label="Active Concerns"
                  value={stats.active}
                />
                <StaffStatCard
                  icon={<staffMetricIcons.urgent aria-hidden="true" size={18} />}
                  label="Needs Attention"
                  value={stats.urgent}
                />
                <StaffStatCard
                  icon={<staffMetricIcons.resolved aria-hidden="true" size={18} />}
                  label="Resolved"
                  value={stats.resolved}
                />
                <StaffStatCard
                  icon={<staffMetricIcons.notify aria-hidden="true" size={18} />}
                  label="New Today"
                  value={stats.new}
                />
              </>
            )}
          </section>

          <section className="mt-8 grid gap-4" aria-label="Recently submitted concerns">
            <h2 className="m-0 text-[22px] font-semibold text-[#1b3a6b]">
              {isFaculty ? 'Recent Appointment Requests' : 'Recently Submitted Concerns'}
            </h2>

            {isFaculty
              ? scopedAppointments.map((appointment) => {
                  const isSelected = appointment.id === selectedAppointment?.id

                  return (
                    <button
                      className={`rounded-[6px] border px-4 py-4 text-left shadow-[3px_3px_2.5px_1px_#1b3a6b] transition duration-200 hover:-translate-y-0.5 active:scale-[0.995] ${
                        isSelected
                          ? 'border-[#1b3a6b] bg-[#c1d9ff]'
                          : 'border-[#295498]/70 bg-white hover:bg-[#f8fbff]'
                      }`}
                      key={appointment.id}
                      onClick={() => setSelectedId(appointment.id)}
                      type="button"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="m-0 text-[11px] font-semibold text-[#1b3a6b]">
                            {appointment.id} · {appointment.requester}
                          </p>
                          <h3 className="m-0 mt-2 text-[21px] font-semibold leading-tight">
                            {appointment.purpose}
                          </h3>
                        </div>
                        <StaffStatusBadge status={appointment.status} />
                      </div>
                      <p className="m-0 mt-2 text-[13px] font-light leading-snug text-[#434343]">
                        {appointment.date} at {appointment.time}. {appointment.notes}
                      </p>
                    </button>
                  )
                })
              : scopedConcerns.map((concern) => {
              const isSelected = concern.id === selectedConcern?.id

              return (
                <button
                  className={`rounded-[6px] border px-4 py-4 text-left shadow-[3px_3px_2.5px_1px_#1b3a6b] transition duration-200 hover:-translate-y-0.5 active:scale-[0.995] ${
                    isSelected
                      ? 'border-[#1b3a6b] bg-[#c1d9ff]'
                      : 'border-[#295498]/70 bg-white hover:bg-[#f8fbff]'
                  }`}
                  key={concern.id}
                  onClick={() => handleSelect(concern)}
                  type="button"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="m-0 text-[11px] font-semibold text-[#1b3a6b]">
                        {concern.id} · {concern.location}
                      </p>
                      <h3 className="m-0 mt-2 text-[21px] font-semibold leading-tight">
                        {concern.title}
                      </h3>
                    </div>
                    <StaffStatusBadge status={concern.status} />
                  </div>
                  <p className="m-0 mt-2 text-[13px] font-light leading-snug text-[#434343]">
                    {concern.description}
                  </p>
                </button>
              )
            })}
          </section>
        </section>

        <aside className="grid gap-6 xl:sticky xl:top-8">
          <section className="rounded-[12px] border border-[#1b3a6b] bg-[#c1d9ff] px-5 py-5 shadow-[0_4px_4px_0_#1b3a6b]">
            <h2 className="m-0 inline-flex items-center gap-2 text-[20px] font-semibold">
              <ChevronUp aria-hidden="true" size={18} />
              {isFaculty ? 'Upcoming Appointments' : 'Common Concerns'}
            </h2>
            <div className="mt-4 grid gap-3">
              {isFaculty
                ? scopedAppointments.map((appointment) => (
                    <div
                      className="rounded-[6px] bg-white/55 px-3 py-3 text-[13px] font-semibold text-[#1b3a6b]"
                      key={appointment.id}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span>{appointment.id}</span>
                        <span>{appointment.time}</span>
                      </div>
                      <p className="m-0 mt-1 text-[11px] font-medium text-[#434343]">
                        {appointment.date}
                      </p>
                    </div>
                  ))
                : commonConcerns.map((concern) => (
                    <div
                      className="flex items-center justify-between rounded-[6px] bg-white/55 px-3 py-3 text-[13px] font-semibold text-[#1b3a6b]"
                      key={concern.id}
                    >
                      <span>{concern.category}</span>
                      <span>{concern.upCount} up</span>
                    </div>
                  ))}
            </div>
          </section>

          <section className="rounded-[6px] border border-[#1b3a6b] bg-white px-5 py-5 shadow-[3px_3px_2.5px_1px_#1b3a6b]">
            <h2 className="m-0 text-[20px] font-semibold text-[#1b3a6b]">
              {isFaculty ? 'Appointment Detail' : 'Concern Detail'}
            </h2>
            {isFaculty && selectedAppointment ? (
              <>
                <p className="m-0 mt-3 text-[11px] font-semibold text-[#1b3a6b]">
                  {selectedAppointment.id}
                </p>
                <h3 className="m-0 mt-1 text-[22px] font-semibold leading-tight">
                  {selectedAppointment.purpose}
                </h3>
                <p className="m-0 mt-3 text-[13px] leading-snug text-[#434343]">
                  {selectedAppointment.notes}
                </p>
                <div className="mt-4">
                  <StaffStatusBadge status={selectedAppointment.status} />
                </div>
                <div className="mt-5">
                  <h4 className="m-0 text-[14px] font-semibold text-[#1b3a6b]">
                    Appointment Timeline
                  </h4>
                  <div className="mt-3">
                    <StaffTimeline
                      items={[...selectedAppointment.timeline, 'Awaiting faculty action']}
                    />
                  </div>
                </div>
                <a
                  className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-[5px] border border-[#1b3a6b] bg-[#1b3a6b] text-[13px] font-semibold !text-white no-underline transition duration-200 hover:bg-[#295498] active:scale-[0.98]"
                  href="#faculty-appointments"
                >
                  Manage Request
                </a>
              </>
            ) : selectedConcern ? (
              <>
                <p className="m-0 mt-3 text-[11px] font-semibold text-[#1b3a6b]">
                  {selectedConcern.id}
                </p>
                <h3 className="m-0 mt-1 text-[22px] font-semibold leading-tight">
                  {selectedConcern.title}
                </h3>
                <p className="m-0 mt-3 text-[13px] leading-snug text-[#434343]">
                  {selectedConcern.description}
                </p>

                <label className="mt-5 grid gap-2 text-[12px] font-semibold text-[#1b3a6b]">
                  Update Status
                  <select
                    className="h-10 rounded-[5px] border border-[#7fa8de] bg-white px-3 text-[13px] outline-none focus:ring-2 focus:ring-[#9fbef1]"
                    onChange={(event) => setStatus(event.target.value as typeof status)}
                    value={status}
                  >
                    {concernStatusOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="mt-5">
                  <h4 className="m-0 text-[14px] font-semibold text-[#1b3a6b]">
                    Concern Timeline
                  </h4>
                  <div className="mt-3">
                    <StaffTimeline
                      items={[
                        ...selectedConcern.timeline,
                        status !== selectedConcern.status
                          ? `Status prepared: ${status}`
                          : 'Awaiting next office action',
                      ]}
                    />
                  </div>
                </div>

                <button
                  className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-[5px] border border-[#1b3a6b] bg-[#1b3a6b] text-[13px] font-semibold !text-white transition duration-200 hover:bg-[#295498] active:scale-[0.98]"
                  onClick={notifyStudent}
                  type="button"
                >
                  {isNotifying ? (
                    <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Bell aria-hidden="true" size={15} />
                  )}
                  {isNotifying ? 'Notifying Student' : 'Notify Student'}
                </button>

                <button
                  className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-[5px] border border-[#1b3a6b] bg-white text-[13px] font-semibold text-[#1b3a6b] transition duration-200 hover:bg-[#edf4ff] active:scale-[0.98]"
                  type="button"
                >
                  <Send aria-hidden="true" size={15} />
                  Save Transparency Update
                </button>
              </>
            ) : (
              <p className="m-0 mt-3 text-[13px] text-[#434343]">No assigned concerns yet.</p>
            )}
          </section>
        </aside>
      </div>
    </StaffWorkspaceShell>
  )
}
