import { CalendarDays, Send } from 'lucide-react'
import { type FormEvent, useEffect, useState } from 'react'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { getApiErrorMessage } from '@/lib/api'
import type { DirectoryRecord, FacultyRecord } from '@/lib/apiTypes'
import { directoryApi } from '@/services/caresApi'
import { appointmentApi } from '@/services/caresApi'
import { useStudentData } from '../context/studentDataStore'
import { StudentWorkspaceShell } from './StudentWorkspaceShell'

const toLocalInput = (date: Date) => {
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16)
}

export function StudentAppointmentForm() {
  const { addAppointment } = useStudentData()
  const [initialSchedule] = useState(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(9, 0, 0, 0)
    return tomorrow
  })
  const [targetType, setTargetType] = useState<'OFFICE' | 'DEPARTMENT' | 'PROFESSOR'>('OFFICE')
  const [offices, setOffices] = useState<DirectoryRecord[]>([])
  const [departments, setDepartments] = useState<DirectoryRecord[]>([])
  const [faculty, setFaculty] = useState<FacultyRecord[]>([])
  const [targetId, setTargetId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startTime, setStartTime] = useState(toLocalInput(initialSchedule))
  const [endTime, setEndTime] = useState(
    toLocalInput(new Date(initialSchedule.getTime() + 30 * 60_000)),
  )
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [slots, setSlots] = useState<Array<{ startTime: string; endTime: string }>>([])

  useEffect(() => {
    void Promise.all([
      directoryApi.offices({ page: 1, limit: 100 }),
      directoryApi.departments({ page: 1, limit: 100 }),
      directoryApi.faculty({ page: 1, limit: 100 }),
    ])
      .then(([officeResult, departmentResult, facultyResult]) => {
        setOffices(officeResult.data)
        setDepartments(departmentResult.data)
        setFaculty(facultyResult.data)
        setTargetId(officeResult.data[0]?.id ?? '')
      })
      .catch((loadError) => setError(getApiErrorMessage(loadError)))
  }, [])

  useEffect(() => {
    if (!targetId || !startTime) return

    void appointmentApi
      .slots(targetId, targetType, startTime.slice(0, 10))
      .then((response) => setSlots(response.data?.slots ?? response.slots ?? []))
      .catch(() => setSlots([]))
  }, [startTime, targetId, targetType])

  const options =
    targetType === 'OFFICE' ? offices : targetType === 'DEPARTMENT' ? departments : faculty

  const chooseType = (type: typeof targetType) => {
    setTargetType(type)
    const next = type === 'OFFICE' ? offices : type === 'DEPARTMENT' ? departments : faculty
    setTargetId(next[0]?.id ?? '')
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')
    try {
      await addAppointment({
        mode: targetType === 'OFFICE' ? 'office' : 'department',
        office: '',
        date: startTime,
        time: startTime,
        purpose: title,
        consultationCategory: targetType,
        description,
        targetType,
        officeId: targetType === 'OFFICE' ? targetId : null,
        departmentId: targetType === 'DEPARTMENT' ? targetId : null,
        facultyId: targetType === 'PROFESSOR' ? targetId : null,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
      })
      window.location.hash = '#student-appointments'
    } catch (submitError) {
      setError(getApiErrorMessage(submitError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <StudentWorkspaceShell activeSection="appointments" contentClassName="max-w-[820px]">
      <DashboardHeader
        title="Set an Appointment"
        subtitle="Select an office, department, or professor and request an available schedule."
      />
      <form className="mt-8 grid gap-5" onSubmit={submit}>
        <section className="grid gap-4 rounded-[5px] border border-[#295498]/70 bg-white p-5 shadow-[3px_3px_2.5px_1px_#1b3a6b]">
          <div className="grid gap-3 sm:grid-cols-3">
            {(['OFFICE', 'DEPARTMENT', 'PROFESSOR'] as const).map((type) => (
              <button
                className={`h-11 rounded border text-sm font-semibold ${
                  targetType === type ? 'bg-[#1b3a6b] text-white' : 'text-[#1b3a6b]'
                }`}
                key={type}
                onClick={() => chooseType(type)}
                type="button"
              >
                {type[0] + type.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <label className="grid gap-2 text-xs font-semibold text-[#1b3a6b]">
            Target
            <select
              className="h-11 rounded border border-[#7fa8de] bg-white px-3"
              onChange={(event) => setTargetId(event.target.value)}
              required
              value={targetId}
            >
              {options.map((option) => (
                <option key={option.id} value={option.id}>
                  {'user' in option
                    ? `${option.user?.firstName ?? ''} ${option.user?.lastName ?? ''}`.trim()
                    : option.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-xs font-semibold text-[#1b3a6b]">
            Purpose
            <input className="h-11 rounded border border-[#7fa8de] px-3" onChange={(e) => setTitle(e.target.value)} required value={title} />
          </label>
          <label className="grid gap-2 text-xs font-semibold text-[#1b3a6b]">
            Description
            <textarea className="min-h-28 rounded border border-[#7fa8de] px-3 py-3" onChange={(e) => setDescription(e.target.value)} value={description} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-xs font-semibold text-[#1b3a6b]">
              Start
              <input className="h-11 rounded border border-[#7fa8de] px-3" min={toLocalInput(new Date())} onChange={(e) => setStartTime(e.target.value)} required type="datetime-local" value={startTime} />
            </label>
            <label className="grid gap-2 text-xs font-semibold text-[#1b3a6b]">
              End
              <input className="h-11 rounded border border-[#7fa8de] px-3" min={startTime} onChange={(e) => setEndTime(e.target.value)} required type="datetime-local" value={endTime} />
            </label>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#1b3a6b]">Available slots</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {slots.map((slot) => (
                <button
                  className="rounded border border-[#1b3a6b] px-3 py-2 text-xs font-semibold text-[#1b3a6b]"
                  key={slot.startTime}
                  onClick={() => {
                    setStartTime(toLocalInput(new Date(slot.startTime)))
                    setEndTime(toLocalInput(new Date(slot.endTime)))
                  }}
                  type="button"
                >
                  {new Date(slot.startTime).toLocaleTimeString([], {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </button>
              ))}
              {slots.length === 0 ? (
                <span className="text-xs text-[#707070]">No published slots for this date.</span>
              ) : null}
            </div>
          </div>
        </section>
        {error ? <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        <button className="inline-flex h-11 items-center justify-center gap-2 rounded bg-[#1b3a6b] text-sm font-semibold text-white disabled:opacity-60" disabled={isSubmitting || !targetId} type="submit">
          {isSubmitting ? <CalendarDays className="animate-pulse" size={16} /> : <Send size={16} />}
          {isSubmitting ? 'Booking...' : 'Book Appointment'}
        </button>
      </form>
    </StudentWorkspaceShell>
  )
}
