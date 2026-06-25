import { Check, Clock, Send, Shuffle, X } from 'lucide-react'
import { type FormEvent, useMemo, useState } from 'react'
import type { StaffAppointment, StaffAppointmentStatus, StaffRole } from '../staffData'
import {
  appointmentStatusOptions,
  staffAppointments,
  staffRoleConfigs,
  transferTargets,
} from '../staffData'
import { StaffStatusBadge, StaffTimeline } from './StaffShared'
import { StaffWorkspaceShell } from './StaffWorkspaceShell'

type StaffAppointmentsProps = {
  role: StaffRole
}

export function StaffAppointments({ role }: StaffAppointmentsProps) {
  const config = staffRoleConfigs[role]
  const scopedAppointments = useMemo(
    () => staffAppointments.filter((appointment) => appointment.role === role),
    [role],
  )
  const [selectedId, setSelectedId] = useState(scopedAppointments[0]?.id ?? '')
  const selectedAppointment =
    scopedAppointments.find((appointment) => appointment.id === selectedId) ??
    scopedAppointments[0] ??
    null
  const [status, setStatus] = useState<StaffAppointmentStatus>(
    selectedAppointment?.status ?? 'Requested',
  )
  const [transferTarget, setTransferTarget] = useState(transferTargets[0])
  const [message, setMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const selectAppointment = (appointment: StaffAppointment) => {
    setSelectedId(appointment.id)
    setStatus(appointment.status)
    setTransferTarget(appointment.target)
    setMessage('')
  }

  const updateStatus = (nextStatus: StaffAppointmentStatus) => {
    setStatus(nextStatus)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    window.setTimeout(() => setIsSaving(false), 900)
  }

  return (
    <StaffWorkspaceShell activeSection="appointments" config={config}>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px] xl:items-start">
        <section>
          <div>
            <p className="m-0 text-[12px] font-bold uppercase tracking-[0.08em] text-[#1b3a6b]">
              {config.unitName}
            </p>
            <h1 className="m-0 mt-1 text-[36px] font-bold leading-tight text-[#1b3a6b]">
              Appointment Requests
            </h1>
            <p className="m-0 mt-2 max-w-[720px] text-[16px] font-light leading-snug text-[#434343]">
              Approve, decline, complete, or transfer student appointment requests while keeping
              the status timeline visible.
            </p>
          </div>

          <section className="mt-8 grid gap-4" aria-label="Appointment requests">
            {scopedAppointments.map((appointment) => {
              const isSelected = appointment.id === selectedAppointment?.id

              return (
                <button
                  className={`rounded-[6px] border px-4 py-4 text-left shadow-[3px_3px_2.5px_1px_#1b3a6b] transition duration-200 hover:-translate-y-0.5 active:scale-[0.995] ${
                    isSelected
                      ? 'border-[#1b3a6b] bg-[#c1d9ff]'
                      : 'border-[#295498]/70 bg-white hover:bg-[#f8fbff]'
                  }`}
                  key={appointment.id}
                  onClick={() => selectAppointment(appointment)}
                  type="button"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="m-0 text-[11px] font-semibold text-[#1b3a6b]">
                        {appointment.id} · {appointment.requester}
                      </p>
                      <h2 className="m-0 mt-2 text-[21px] font-semibold leading-tight">
                        {appointment.purpose}
                      </h2>
                    </div>
                    <StaffStatusBadge status={appointment.status} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3 text-[12px] font-medium text-[#434343]">
                    <span>{appointment.date}</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock aria-hidden="true" size={14} />
                      {appointment.time}
                    </span>
                    <span>{appointment.target}</span>
                  </div>
                </button>
              )
            })}
          </section>
        </section>

        <aside className="rounded-[6px] border border-[#1b3a6b] bg-white px-5 py-5 shadow-[3px_3px_2.5px_1px_#1b3a6b] xl:sticky xl:top-8">
          <h2 className="m-0 text-[22px] font-semibold text-[#1b3a6b]">Request Action</h2>
          {selectedAppointment ? (
            <form className="mt-5" onSubmit={handleSubmit}>
              <p className="m-0 text-[11px] font-semibold text-[#1b3a6b]">
                {selectedAppointment.id}
              </p>
              <h3 className="m-0 mt-1 text-[20px] font-semibold leading-tight">
                {selectedAppointment.purpose}
              </h3>
              <p className="m-0 mt-3 text-[13px] leading-snug text-[#434343]">
                {selectedAppointment.notes}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <button
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-[5px] border border-[#1b3a6b] bg-[#1b3a6b] text-[12px] font-semibold !text-white transition duration-200 hover:bg-[#295498] active:scale-[0.98]"
                  onClick={() => updateStatus('Approved')}
                  type="button"
                >
                  <Check aria-hidden="true" size={14} />
                  Approve
                </button>
                <button
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-[5px] border border-[#8a1f1f] bg-white text-[12px] font-semibold text-[#8a1f1f] transition duration-200 hover:bg-[#f0d7d7] active:scale-[0.98]"
                  onClick={() => updateStatus('Declined')}
                  type="button"
                >
                  <X aria-hidden="true" size={14} />
                  Decline
                </button>
              </div>

              <label className="mt-4 grid gap-2 text-[12px] font-semibold text-[#1b3a6b]">
                Status
                <select
                  className="h-10 rounded-[5px] border border-[#7fa8de] bg-white px-3 text-[13px] outline-none focus:ring-2 focus:ring-[#9fbef1]"
                  onChange={(event) => setStatus(event.target.value as StaffAppointmentStatus)}
                  value={status}
                >
                  {appointmentStatusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="mt-4 grid gap-2 text-[12px] font-semibold text-[#1b3a6b]">
                Transfer To
                <select
                  className="h-10 rounded-[5px] border border-[#7fa8de] bg-white px-3 text-[13px] outline-none focus:ring-2 focus:ring-[#9fbef1]"
                  onChange={(event) => setTransferTarget(event.target.value)}
                  value={transferTarget}
                >
                  {transferTargets.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="mt-4 grid gap-2 text-[12px] font-semibold text-[#1b3a6b]">
                Notification Message
                <textarea
                  className="min-h-[96px] resize-none rounded-[5px] border border-[#7fa8de] bg-white px-3 py-3 text-[13px] outline-none focus:ring-2 focus:ring-[#9fbef1]"
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Message sent to the student and receiving office."
                  value={message}
                />
              </label>

              <div className="mt-5">
                <h4 className="m-0 text-[14px] font-semibold text-[#1b3a6b]">
                  Status Timeline
                </h4>
                <div className="mt-3">
                  <StaffTimeline
                    items={[
                      ...selectedAppointment.timeline,
                      status === 'Transferred'
                        ? `Transfer queued to ${transferTarget}`
                        : `Marked as ${status}`,
                    ]}
                  />
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                <button
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-[5px] border border-[#1b3a6b] bg-[#1b3a6b] text-[13px] font-semibold !text-white transition duration-200 hover:bg-[#295498] active:scale-[0.98]"
                  type="submit"
                >
                  {isSaving ? (
                    <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Send aria-hidden="true" size={15} />
                  )}
                  Save and Notify
                </button>
                <button
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-[5px] border border-[#1b3a6b] bg-white text-[13px] font-semibold text-[#1b3a6b] transition duration-200 hover:bg-[#edf4ff] active:scale-[0.98]"
                  onClick={() => updateStatus('Transferred')}
                  type="button"
                >
                  <Shuffle aria-hidden="true" size={15} />
                  Transfer Request
                </button>
              </div>
            </form>
          ) : (
            <p className="m-0 mt-3 text-[13px] text-[#434343]">No appointment requests yet.</p>
          )}
        </aside>
      </div>
    </StaffWorkspaceShell>
  )
}
