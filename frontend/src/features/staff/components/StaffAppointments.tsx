import { Check, CheckCircle2, Loader2, X } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { getApiErrorMessage } from '@/lib/api'
import { appointmentApi } from '@/services/caresApi'
import type { StaffRole } from '../staffData'
import { staffRoleConfigs } from '../staffData'
import { StaffWorkspaceShell } from './StaffWorkspaceShell'

export function StaffAppointments({ role }: { role: StaffRole }) {
  const config = staffRoleConfigs[role]
  const queryClient = useQueryClient()
  const appointments = useQuery({
    queryKey: ['appointments', 'staff'],
    queryFn: () => appointmentApi.list({ page: 1, limit: 100 }),
  })
  const [selectedId, setSelectedId] = useState('')
  const [reason, setReason] = useState('')
  const [dayOfWeek, setDayOfWeek] = useState('1')
  const [availabilityStart, setAvailabilityStart] = useState('09:00')
  const [availabilityEnd, setAvailabilityEnd] = useState('12:00')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [pendingAction, setPendingAction] = useState('')
  const selected =
    appointments.data?.data.find((item) => item.id === selectedId) ??
    appointments.data?.data[0] ??
    null

  const mutate = async (action: () => Promise<unknown>, successMessage: string) => {
    setError('')
    setNotice('')
    setPendingAction(successMessage)
    try {
      await action()
      await queryClient.invalidateQueries({ queryKey: ['appointments'] })
      setNotice(successMessage)
    } catch (failure) {
      setError(getApiErrorMessage(failure))
    } finally {
      setPendingAction('')
    }
  }

  return (
    <StaffWorkspaceShell activeSection="appointments" config={config}>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
        <section>
          <h1 className="text-4xl font-bold text-[#1b3a6b]">Appointment Requests</h1>
          <p className="mt-2 text-[#434343]">Approve, reject, or complete bookings assigned to you.</p>
          {appointments.isLoading ? <p className="mt-8 text-sm">Loading appointments...</p> : null}
          <div className="mt-8 grid gap-4">
            {appointments.data?.data.map((appointment) => (
              <button className={`rounded border p-4 text-left shadow-[3px_3px_2.5px_1px_#1b3a6b] transition duration-200 hover:-translate-y-0.5 hover:shadow-[4px_5px_4px_1px_#1b3a6b] ${selected?.id === appointment.id ? 'bg-[#c1d9ff]' : 'bg-white'}`} key={appointment.id} onClick={() => setSelectedId(appointment.id)} type="button">
                <div className="flex justify-between gap-3"><h2 className="text-xl font-semibold">{appointment.title}</h2><span className="rounded bg-[#edf4ff] px-3 py-1 text-xs font-semibold">{appointment.status}</span></div>
                <p className="mt-3 text-sm">{new Date(appointment.startTime).toLocaleString()}</p>
                <p className="mt-1 text-xs text-[#707070]">{appointment.student ? `${appointment.student.user.firstName} ${appointment.student.user.lastName}` : ''}</p>
              </button>
            ))}
            {!appointments.isLoading && !appointments.data?.data.length ? <p className="rounded border bg-white p-6 text-center text-sm">No appointment requests.</p> : null}
          </div>
        </section>
        <aside className="h-fit rounded border border-[#1b3a6b] bg-white p-5 shadow-[3px_3px_2.5px_1px_#1b3a6b]">
          <h2 className="text-xl font-semibold text-[#1b3a6b]">Request Action</h2>
          {selected ? (
            <div className="mt-5 grid gap-3">
              <h3 className="text-lg font-semibold">{selected.title}</h3>
              <p className="text-sm">{selected.description || 'No description'}</p>
              {selected.status === 'PENDING' ? (
                <button className="inline-flex h-10 items-center justify-center gap-2 rounded bg-green-700 text-sm font-semibold !text-white disabled:opacity-70" disabled={Boolean(pendingAction)} onClick={() => void mutate(() => appointmentApi.approve(selected.id), 'Appointment approved.')} type="button">
                  {pendingAction === 'Appointment approved.' ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />} Approve
                </button>
              ) : null}
              <textarea className="min-h-20 rounded border px-3 py-2 text-sm" onChange={(e) => setReason(e.target.value)} placeholder="Reason required for rejection" value={reason} />
              {selected.status === 'PENDING' ? (
                <button className="inline-flex h-10 items-center justify-center gap-2 rounded border border-red-700 text-sm font-semibold text-red-700 disabled:opacity-60" disabled={!reason.trim() || Boolean(pendingAction)} onClick={() => void mutate(() => appointmentApi.reject(selected.id, reason), 'Appointment rejected.')} type="button">
                  {pendingAction === 'Appointment rejected.' ? <Loader2 className="animate-spin" size={16} /> : <X size={16} />} Reject
                </button>
              ) : null}
              {selected.status === 'APPROVED' ? (
                <button className="inline-flex h-10 items-center justify-center gap-2 rounded bg-[#1b3a6b] text-sm font-semibold !text-white disabled:opacity-70" disabled={Boolean(pendingAction)} onClick={() => void mutate(() => appointmentApi.complete(selected.id), 'Appointment marked completed.')} type="button">
                  {pendingAction === 'Appointment marked completed.' ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />} Complete
                </button>
              ) : null}
              {notice ? <p className="rounded bg-green-50 px-3 py-2 text-xs font-semibold text-green-700">{notice}</p> : null}
              {error ? <p className="rounded bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{error}</p> : null}
            </div>
          ) : <p className="mt-3 text-sm">No appointment selected.</p>}
          <div className="mt-6 border-t pt-5">
            <h3 className="text-base font-semibold text-[#1b3a6b]">Add Availability</h3>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <select className="h-9 rounded border px-2 text-xs" onChange={(e) => setDayOfWeek(e.target.value)} value={dayOfWeek}>
                <option value="1">Mon</option><option value="2">Tue</option><option value="3">Wed</option><option value="4">Thu</option><option value="5">Fri</option><option value="6">Sat</option><option value="7">Sun</option>
              </select>
              <input className="h-9 rounded border px-2 text-xs" onChange={(e) => setAvailabilityStart(e.target.value)} type="time" value={availabilityStart} />
              <input className="h-9 rounded border px-2 text-xs" onChange={(e) => setAvailabilityEnd(e.target.value)} type="time" value={availabilityEnd} />
            </div>
            <button className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded border border-[#1b3a6b] text-xs font-semibold text-[#1b3a6b] disabled:opacity-60" disabled={Boolean(pendingAction)} onClick={() => void mutate(() => appointmentApi.createAvailability({ dayOfWeek: Number(dayOfWeek), startTime: availabilityStart, endTime: availabilityEnd, slotDuration: 30, isActive: true }), 'Availability slots created.')} type="button">
              {pendingAction === 'Availability slots created.' ? <Loader2 className="animate-spin" size={14} /> : null}
              Create 30-minute slots
            </button>
          </div>
        </aside>
      </div>
    </StaffWorkspaceShell>
  )
}
