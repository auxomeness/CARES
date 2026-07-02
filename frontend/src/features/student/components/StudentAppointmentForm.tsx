import { CalendarDays, ChevronLeft, ChevronRight, Clock, Send } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { type FormEvent, useEffect, useState } from 'react'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { getApiErrorMessage } from '@/lib/api'
import { queryKeys } from '@/lib/queryKeys'
import { directoryApi } from '@/services/caresApi'
import { appointmentApi } from '@/services/caresApi'
import { useStudentData } from '../context/studentDataStore'
import { StudentWorkspaceShell } from './StudentWorkspaceShell'

const toLocalInput = (date: Date) => {
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16)
}

const toDateKey = (date: Date) => toLocalInput(date).slice(0, 10)
const getTimeValue = (value: string, fallback: string) => value.slice(11, 16) || fallback

function getCalendarDays(month: Date) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1)
  const start = new Date(firstDay)
  start.setDate(firstDay.getDate() - firstDay.getDay())

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    return date
  })
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
  const [targetId, setTargetId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startTime, setStartTime] = useState(toLocalInput(initialSchedule))
  const [endTime, setEndTime] = useState(
    toLocalInput(new Date(initialSchedule.getTime() + 30 * 60_000)),
  )
  const [calendarMonth, setCalendarMonth] = useState(
    () => new Date(initialSchedule.getFullYear(), initialSchedule.getMonth(), 1),
  )
  const [todayKey] = useState(() => toDateKey(new Date()))
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [slots, setSlots] = useState<Array<{ startTime: string; endTime: string }>>([])

  const officesQuery = useQuery({
    queryKey: queryKeys.directory.form('office'),
    queryFn: () => directoryApi.offices({ page: 1, limit: 100 }),
    staleTime: 10 * 60_000,
  })
  const departmentsQuery = useQuery({
    queryKey: queryKeys.directory.form('department'),
    queryFn: () => directoryApi.departments({ page: 1, limit: 100 }),
    staleTime: 10 * 60_000,
  })
  const facultyQuery = useQuery({
    queryKey: queryKeys.directory.form('faculty'),
    queryFn: () => directoryApi.faculty({ page: 1, limit: 100 }),
    staleTime: 10 * 60_000,
  })
  const offices = officesQuery.data?.data ?? []
  const departments = departmentsQuery.data?.data ?? []
  const faculty = facultyQuery.data?.data ?? []
  const options =
    targetType === 'OFFICE' ? offices : targetType === 'DEPARTMENT' ? departments : faculty
  const selectedTargetId = options.some((option) => option.id === targetId)
    ? targetId
    : options[0]?.id ?? ''

  useEffect(() => {
    if (!selectedTargetId || !startTime) return

    void appointmentApi
      .slots(selectedTargetId, targetType, startTime.slice(0, 10))
      .then((response) => setSlots(response.data?.slots ?? response.slots ?? []))
      .catch(() => setSlots([]))
  }, [startTime, selectedTargetId, targetType])

  const chooseType = (type: typeof targetType) => {
    setTargetType(type)
    setTargetId('')
  }

  const selectedOption = options.find((option) => option.id === selectedTargetId)
  const selectedTargetLabel = selectedOption
    ? 'user' in selectedOption
      ? `${selectedOption.user?.firstName ?? ''} ${selectedOption.user?.lastName ?? ''}`.trim()
      : selectedOption.name
    : 'Not selected'
  const selectedDateKey = startTime.slice(0, 10)
  const calendarDays = getCalendarDays(calendarMonth)

  const chooseDate = (date: Date) => {
    const dateKey = toDateKey(date)
    if (dateKey < todayKey) {
      setError('Choose today or a future date.')
      return
    }

    const startValue = getTimeValue(startTime, '09:00')
    const endValue = getTimeValue(endTime, '09:30')
    setError('')
    setStartTime(`${dateKey}T${startValue}`)
    setEndTime(`${dateKey}T${endValue}`)
  }

  const chooseStartTime = (time: string) => {
    const nextStart = `${selectedDateKey}T${time}`
    const nextEnd = new Date(nextStart)
    nextEnd.setMinutes(nextEnd.getMinutes() + 30)
    setStartTime(nextStart)
    setEndTime(toLocalInput(nextEnd))
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
        officeId: targetType === 'OFFICE' ? selectedTargetId : null,
        departmentId: targetType === 'DEPARTMENT' ? selectedTargetId : null,
        facultyId: targetType === 'PROFESSOR' ? selectedTargetId : null,
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
    <StudentWorkspaceShell activeSection="appointments" contentClassName="max-w-none">
      <DashboardHeader
        title="Set an Appointment"
        subtitle="Select an office, department, or professor and request an available schedule."
      />
      <form className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px] xl:items-start" onSubmit={submit}>
        <section className="grid gap-4 rounded-[5px] border border-[#295498]/70 bg-white p-5 shadow-[3px_3px_2.5px_1px_#1b3a6b]">
          <div className="grid gap-3 sm:grid-cols-3">
            {(['OFFICE', 'DEPARTMENT', 'PROFESSOR'] as const).map((type) => (
              <button
                className={`h-11 rounded border text-sm font-semibold ${
                  targetType === type ? 'bg-[#1b3a6b] !text-white' : 'text-[#1b3a6b]'
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
              value={selectedTargetId}
            >
              {officesQuery.isLoading || departmentsQuery.isLoading || facultyQuery.isLoading ? (
                <option value="">Loading targets...</option>
              ) : null}
              {options.map((option) => (
                <option key={option.id} value={option.id}>
                  {'user' in option
                    ? `${option.user?.firstName ?? ''} ${option.user?.lastName ?? ''}`.trim()
                    : option.name}
                </option>
              ))}
            </select>
          </label>
          {officesQuery.isError || departmentsQuery.isError || facultyQuery.isError ? (
            <p className="text-xs text-red-700">Unable to load appointment targets.</p>
          ) : null}
          <label className="grid gap-2 text-xs font-semibold text-[#1b3a6b]">
            Purpose
            <input className="h-11 rounded border border-[#7fa8de] px-3" onChange={(e) => setTitle(e.target.value)} required value={title} />
          </label>
          <label className="grid gap-2 text-xs font-semibold text-[#1b3a6b]">
            Description
            <textarea className="min-h-28 rounded border border-[#7fa8de] px-3 py-3" onChange={(e) => setDescription(e.target.value)} value={description} />
          </label>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
            <section className="rounded-[5px] border border-[#7fa8de] bg-[#edf4ff] p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="m-0 inline-flex items-center gap-2 text-sm font-semibold text-[#1b3a6b]">
                  <CalendarDays aria-hidden="true" size={16} />
                  {calendarMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                </h3>
                <div className="flex gap-2">
                  <button
                    aria-label="Previous month"
                    className="grid size-8 place-items-center rounded border border-[#1b3a6b] bg-white text-[#1b3a6b]"
                    onClick={() =>
                      setCalendarMonth(
                        (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1),
                      )
                    }
                    type="button"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    aria-label="Next month"
                    className="grid size-8 place-items-center rounded border border-[#1b3a6b] bg-white text-[#1b3a6b]"
                    onClick={() =>
                      setCalendarMonth(
                        (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1),
                      )
                    }
                    type="button"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-[#1b3a6b]">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-7 gap-1">
                {calendarDays.map((day) => {
                  const dayKey = toDateKey(day)
                  const isPast = dayKey < todayKey
                  const isSelected = dayKey === selectedDateKey
                  const isOutsideMonth = day.getMonth() !== calendarMonth.getMonth()
                  return (
                    <button
                      className={`grid aspect-square place-items-center rounded text-[12px] font-semibold transition duration-200 ${
                        isSelected
                          ? 'bg-[#1b3a6b] !text-white shadow-md'
                          : isPast
                            ? 'cursor-not-allowed bg-white/45 text-[#9aa4b2]'
                            : 'bg-white text-[#1b3a6b] hover:-translate-y-0.5 hover:bg-[#dbe9ff]'
                      } ${isOutsideMonth ? 'opacity-45' : ''}`}
                      disabled={isPast}
                      key={dayKey}
                      onClick={() => chooseDate(day)}
                      type="button"
                    >
                      {day.getDate()}
                    </button>
                  )
                })}
              </div>
            </section>
            <section className="rounded-[5px] border border-[#7fa8de] bg-white p-4">
              <label className="grid gap-2 text-xs font-semibold text-[#1b3a6b]">
                <span className="inline-flex items-center gap-2">
                  <Clock aria-hidden="true" size={15} />
                  Start Time
                </span>
                <input
                  className="h-10 rounded border border-[#7fa8de] px-3"
                  onChange={(event) => chooseStartTime(event.target.value)}
                  required
                  type="time"
                  value={getTimeValue(startTime, '09:00')}
                />
              </label>
              <label className="mt-3 grid gap-2 text-xs font-semibold text-[#1b3a6b]">
                End Time
                <input
                  className="h-10 rounded border border-[#7fa8de] px-3"
                  min={getTimeValue(startTime, '09:00')}
                  onChange={(event) => setEndTime(`${selectedDateKey}T${event.target.value}`)}
                  required
                  type="time"
                  value={getTimeValue(endTime, '09:30')}
                />
              </label>
            </section>
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
        <aside className="rounded-[5px] border border-[#1b3a6b] bg-[#f5d788] p-5 shadow-[3px_3px_2.5px_1px_#1b3a6b] xl:sticky xl:top-8">
          <h2 className="m-0 text-[17px] font-semibold text-[#1b3a6b]">Appointment Summary</h2>
          <dl className="mt-4 grid gap-3 text-[12px]">
            <div className="rounded-[5px] bg-white/65 px-3 py-2">
              <dt className="font-semibold text-[#1b3a6b]">Type</dt>
              <dd className="m-0">{targetType[0] + targetType.slice(1).toLowerCase()}</dd>
            </div>
            <div className="rounded-[5px] bg-white/65 px-3 py-2">
              <dt className="font-semibold text-[#1b3a6b]">Target</dt>
              <dd className="m-0">
                {selectedTargetLabel}
              </dd>
            </div>
            <div className="rounded-[5px] bg-white/65 px-3 py-2">
              <dt className="font-semibold text-[#1b3a6b]">Date</dt>
              <dd className="m-0">{startTime ? new Date(startTime).toLocaleDateString() : 'Not selected'}</dd>
            </div>
            <div className="rounded-[5px] bg-white/65 px-3 py-2">
              <dt className="font-semibold text-[#1b3a6b]">Time</dt>
              <dd className="m-0">{startTime ? new Date(startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'Not selected'}</dd>
            </div>
            <div className="rounded-[5px] bg-white/65 px-3 py-2">
              <dt className="font-semibold text-[#1b3a6b]">Purpose</dt>
              <dd className="m-0">{title || 'Not provided'}</dd>
            </div>
          </dl>
          <button className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded bg-[#1b3a6b] text-sm font-semibold !text-white disabled:opacity-60" disabled={isSubmitting || !selectedTargetId} type="submit">
            {isSubmitting ? <CalendarDays className="animate-pulse" size={16} /> : <Send size={16} />}
            {isSubmitting ? 'Booking...' : 'Book Appointment'}
          </button>
          <button
            className="mt-3 inline-flex h-11 w-full items-center justify-center rounded border border-[#1b3a6b] bg-white text-sm font-semibold text-[#1b3a6b]"
            onClick={() => {
              window.location.hash = '#student-appointments'
            }}
            type="button"
          >
            Cancel
          </button>
        </aside>
      </form>
    </StudentWorkspaceShell>
  )
}
