import { Ban, CalendarDays, Clock3, Plus } from 'lucide-react'
import { useState } from 'react'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { LoadingLink } from '@/components/feedback/LoadingLink'
import { getApiErrorMessage } from '@/lib/api'
import { useStudentData } from '../context/studentDataStore'
import { getAppointmentStatusClass } from '../studentUi'
import { StudentWorkspaceShell } from './StudentWorkspaceShell'

export function StudentAppointments() {
  const { appointments, deleteAppointment, updateAppointment, isLoading, error, refresh } = useStudentData()
  const [selectedId, setSelectedId] = useState('')
  const [actionError, setActionError] = useState('')
  const [newStartTime, setNewStartTime] = useState('')
  const [newEndTime, setNewEndTime] = useState('')
  const [currentTime] = useState(() => Date.now())
  const selected = appointments.find((item) => item.id === selectedId) ?? appointments[0] ?? null
  const nextAppointment = [...appointments]
    .filter((appointment) => new Date(appointment.createdAt).getTime() >= currentTime)
    .sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime())[0]
  const stats = [
    { label: 'Total Appointments', value: String(appointments.length) },
    {
      label: 'Pending Approval',
      value: String(appointments.filter((appointment) => appointment.status === 'Pending').length),
    },
    {
      label: 'Active Appointments',
      value: String(
        appointments.filter((appointment) => ['Pending', 'Approved'].includes(appointment.status)).length,
      ),
    },
    {
      label: 'Next Appointment',
      value: nextAppointment ? `${nextAppointment.date} - ${nextAppointment.id}` : 'None',
    },
  ]

  const cancel = async () => {
    if (!selected) return
    setActionError('')
    try {
      await deleteAppointment(selected.id)
      await refresh()
    } catch (failure) {
      setActionError(getApiErrorMessage(failure))
    }
  }

  const reschedule = async () => {
    if (!selected || !newStartTime || !newEndTime) return
    setActionError('')
    try {
      await updateAppointment(selected.id, {
        mode: selected.mode,
        office: selected.office,
        department: selected.department,
        faculty: selected.faculty,
        date: selected.date,
        time: selected.time,
        purpose: selected.purpose,
        consultationCategory: selected.consultationCategory,
        description: selected.description,
        startTime: new Date(newStartTime).toISOString(),
        endTime: new Date(newEndTime).toISOString(),
      })
      setNewStartTime('')
      setNewEndTime('')
      await refresh()
    } catch (failure) {
      setActionError(getApiErrorMessage(failure))
    }
  }

  return (
    <StudentWorkspaceShell activeSection="appointments" contentClassName="max-w-none">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <DashboardHeader title="My Appointments" subtitle="Review appointment requests and their current status." />
        <LoadingLink className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded bg-[#1b3a6b] px-4 text-sm font-semibold !text-white no-underline sm:w-auto" href="#student-appointment-new">
          <Plus size={16} /> New Appointment
        </LoadingLink>
      </div>
      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Appointment statistics">
        {stats.map((stat) => (
          <article
            className="min-h-[86px] rounded-[5px] border border-[#295498]/70 bg-white px-4 py-3 shadow-[3px_3px_2.5px_1px_#1b3a6b]"
            key={stat.label}
          >
            <p className="m-0 text-[10px] font-semibold text-[#707070]">{stat.label}</p>
            <p
              className={`m-0 mt-2 font-bold leading-tight text-[#1b3a6b] ${
                stat.label === 'Next Appointment' ? 'text-[15px]' : 'text-[24px]'
              }`}
            >
              {stat.value}
            </p>
          </article>
        ))}
      </section>
      {isLoading ? <p className="mt-8 text-sm">Loading appointments...</p> : null}
      {error || actionError ? <p className="mt-6 rounded bg-red-50 p-3 text-sm text-red-700">{error || actionError}</p> : null}
      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <section className="grid content-start gap-4">
          {appointments.map((appointment) => (
            <button
              className={`rounded-[5px] border p-4 text-left shadow-[3px_3px_2.5px_1px_#1b3a6b] ${selected?.id === appointment.id ? 'bg-[#c1d9ff]' : 'bg-white'}`}
              key={appointment.id}
              onClick={() => setSelectedId(appointment.id)}
              type="button"
            >
              <div className="flex justify-between gap-3">
                <h2 className="text-xl font-semibold">{appointment.purpose}</h2>
                <span className={`h-fit rounded border px-3 py-1 text-xs ${getAppointmentStatusClass(appointment.status)}`}>
                  {appointment.backendStatus}
                </span>
              </div>
              <p className="mt-3 inline-flex items-center gap-2 text-sm"><CalendarDays size={15} /> {appointment.date} at {appointment.time}</p>
            </button>
          ))}
          {!isLoading && appointments.length === 0 ? <p className="rounded border bg-white p-6 text-center text-sm">No appointments yet.</p> : null}
        </section>
        <aside className="h-fit rounded-[5px] border border-[#1b3a6b] bg-white p-5 shadow-[3px_3px_2.5px_1px_#1b3a6b]">
          {selected ? (
            <>
              <h2 className="text-xl font-semibold">{selected.purpose}</h2>
              <dl className="mt-5 grid gap-3 text-sm">
                <div><dt className="font-semibold">Target</dt><dd>{selected.office}</dd></div>
                <div><dt className="font-semibold">Schedule</dt><dd>{selected.date} at {selected.time}</dd></div>
                <div><dt className="font-semibold">Status</dt><dd>{selected.backendStatus}</dd></div>
                <div><dt className="font-semibold">Description</dt><dd>{selected.description || 'No description'}</dd></div>
              </dl>
              {['PENDING', 'APPROVED', 'RESCHEDULED'].includes(selected.backendStatus ?? '') ? (
                <div className="mt-6 grid gap-3">
                  <h3 className="text-sm font-semibold">Request a new schedule</h3>
                  <label className="grid gap-1 text-xs font-medium">
                    Start
                    <input className="h-10 rounded border px-3 text-sm" min={new Date().toISOString().slice(0, 16)} onChange={(event) => setNewStartTime(event.target.value)} type="datetime-local" value={newStartTime} />
                  </label>
                  <label className="grid gap-1 text-xs font-medium">
                    End
                    <input className="h-10 rounded border px-3 text-sm" min={newStartTime} onChange={(event) => setNewEndTime(event.target.value)} type="datetime-local" value={newEndTime} />
                  </label>
                  <button className="inline-flex h-10 w-full items-center justify-center gap-2 rounded bg-[#1b3a6b] text-sm font-semibold text-white disabled:opacity-50" disabled={!newStartTime || !newEndTime} onClick={() => void reschedule()} type="button">
                    <Clock3 size={16} /> Reschedule
                  </button>
                  <button className="inline-flex h-10 w-full items-center justify-center gap-2 rounded border border-red-700 text-sm font-semibold text-red-700" onClick={() => void cancel()} type="button">
                    <Ban size={16} /> Cancel Appointment
                  </button>
                </div>
              ) : null}
            </>
          ) : <p className="text-sm">Select an appointment.</p>}
        </aside>
      </div>
    </StudentWorkspaceShell>
  )
}
