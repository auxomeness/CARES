import { CalendarDays, Clock, Pencil, Plus, Trash2 } from 'lucide-react'
import { type FormEvent, useMemo, useState } from 'react'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { LoadingLink } from '@/components/feedback/LoadingLink'
import {
  appointmentPurposes,
  consultationCategories,
  departmentOptions,
  facultyOptions,
  officeOptions,
} from '../studentData.config'
import { useStudentData } from '../context/studentDataStore'
import type {
  AppointmentInput,
  AppointmentMode,
  StudentAppointment,
} from '../studentData.types'
import { getAppointmentStatusClass } from '../studentUi'
import { StudentWorkspaceShell } from './StudentWorkspaceShell'

type AppointmentStatCardProps = {
  detail?: string
  label: string
  value: number | string
}

const appointmentDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

const weekdayFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
})

function toAppointmentInput(appointment: StudentAppointment): AppointmentInput {
  return {
    mode: appointment.mode,
    office: appointment.office,
    department: appointment.department,
    faculty: appointment.faculty,
    date: appointment.date,
    time: appointment.time,
    purpose: appointment.purpose,
    consultationCategory: appointment.consultationCategory,
    description: appointment.description,
  }
}

function getTodayStart() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return today
}

function parseAppointmentDate(dateLabel: string) {
  const parsedDate = new Date(dateLabel)

  if (Number.isNaN(parsedDate.getTime())) {
    return null
  }

  parsedDate.setHours(0, 0, 0, 0)
  return parsedDate
}

function isFutureAppointmentDate(dateLabel: string) {
  const parsedDate = parseAppointmentDate(dateLabel)

  return Boolean(parsedDate && parsedDate.getTime() > getTodayStart().getTime())
}

function formatAppointmentDate(date: Date) {
  return appointmentDateFormatter.format(date)
}

function getEditableCalendarDates() {
  const today = getTodayStart()

  return Array.from({ length: 21 }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() + index + 1)
    return date
  })
}

function getTimesForDate(date: Date) {
  const day = date.getDate()

  if (day % 3 === 0) {
    return ['9:30 AM', '10:30 AM', '1:00 PM', '2:30 PM']
  }

  if (day % 2 === 0) {
    return ['8:00 AM', '9:30 AM', '10:30 AM', '1:00 PM']
  }

  return ['10:30 AM', '1:00 PM', '2:30 PM', '4:00 PM']
}

function getNextEditableAppointmentInput(appointment: StudentAppointment): AppointmentInput {
  const input = toAppointmentInput(appointment)

  if (isFutureAppointmentDate(input.date)) {
    return input
  }

  const nextDate = getEditableCalendarDates()[0]
  return {
    ...input,
    date: formatAppointmentDate(nextDate),
    time: getTimesForDate(nextDate)[0],
  }
}

function getAppointmentTime(appointment: StudentAppointment) {
  return new Date(`${appointment.date} ${appointment.time}`).getTime()
}

function AppointmentStatCard({ detail, label, value }: AppointmentStatCardProps) {
  const isTextValue = typeof value === 'string'

  return (
    <article className="rounded-[5px] border border-[#295498]/70 bg-white px-3 py-3 shadow-[3px_3px_2.5px_1px_#1b3a6b] sm:px-4 sm:py-4">
      <p className="m-0 text-[10px] font-medium leading-tight text-[#707070] sm:text-[12px]">
        {label}
      </p>
      <p
        className={`m-0 mt-2 font-bold leading-tight text-[#1b3a6b] sm:mt-3 ${
          isTextValue ? 'text-[14px] sm:text-[18px]' : 'text-[22px] sm:text-[30px]'
        }`}
      >
        {value}
      </p>
      {detail ? (
        <p className="m-0 mt-1 text-[10px] font-semibold leading-tight text-[#434343] sm:mt-2 sm:text-[12px]">
          {detail}
        </p>
      ) : null}
    </article>
  )
}

export function StudentAppointments() {
  const { appointments, deleteAppointment, updateAppointment } = useStudentData()
  const [selectedId, setSelectedId] = useState(appointments[0]?.id ?? '')
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<AppointmentInput | null>(null)
  const [editError, setEditError] = useState('')

  const selectedAppointment =
    appointments.find((appointment) => appointment.id === selectedId) ?? appointments[0] ?? null

  const appointmentStats = useMemo(() => {
    const activeAppointments = appointments.filter(
      (appointment) => appointment.status !== 'Completed' && appointment.status !== 'Cancelled',
    )
    const nextAppointment =
      [...activeAppointments].sort(
        (leftAppointment, rightAppointment) =>
          getAppointmentTime(leftAppointment) - getAppointmentTime(rightAppointment),
      )[0] ?? null

    return {
      active: activeAppointments.length,
      next: nextAppointment,
      pending: appointments.filter((appointment) => appointment.status === 'Pending').length,
      total: appointments.length,
    }
  }, [appointments])

  const startEditing = () => {
    if (!selectedAppointment) {
      return
    }

    setIsEditing(true)
    setEditError('')
    setEditForm(getNextEditableAppointmentInput(selectedAppointment))
  }

  const updateEditForm = (patch: Partial<AppointmentInput>) => {
    setEditError('')
    setEditForm((currentForm) => (currentForm ? { ...currentForm, ...patch } : currentForm))
  }

  const chooseEditDate = (date: Date) => {
    if (!editForm) {
      return
    }

    const dateTimes = getTimesForDate(date)

    updateEditForm({
      date: formatAppointmentDate(date),
      time: dateTimes.includes(editForm.time) ? editForm.time : dateTimes[0],
    })
  }

  const handleEditSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedAppointment || !editForm) {
      return
    }

    if (!isFutureAppointmentDate(editForm.date)) {
      setEditError(`Choose a date after ${formatAppointmentDate(getTodayStart())}.`)
      return
    }

    if (!editForm.time) {
      setEditError('Choose an available time before saving.')
      return
    }

    updateAppointment(selectedAppointment.id, editForm)
    setIsEditing(false)
    setEditForm(null)
    setEditError('')
  }

  const handleDelete = () => {
    if (!selectedAppointment) {
      return
    }

    deleteAppointment(selectedAppointment.id)
    setIsEditing(false)
    setEditForm(null)
    setEditError('')
  }

  return (
    <StudentWorkspaceShell activeSection="appointments" contentClassName="max-w-none">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_390px] xl:items-start">
        <DashboardHeader
          title="My Appointments"
          subtitle="Select an appointment to review its full details, then edit or remove it."
        />
        <LoadingLink
          className="relative inline-flex h-10 items-center justify-center overflow-hidden rounded-[5px] border border-[#1b3a6b] bg-[#1b3a6b] px-5 text-[13px] font-semibold !text-white no-underline transition duration-200 hover:bg-[#295498] active:scale-[0.98] xl:w-full [&_*]:!text-white"
          href="#student-appointment-new"
        >
          <Plus aria-hidden="true" size={16} />
          Create Appointment
        </LoadingLink>
      </div>

      <section
        className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4 xl:grid-cols-4"
        aria-label="Appointment statistics"
      >
        <AppointmentStatCard label="Total Appointments" value={appointmentStats.total} />
        <AppointmentStatCard label="Pending Approval" value={appointmentStats.pending} />
        <AppointmentStatCard label="Active Appointments" value={appointmentStats.active} />
        <AppointmentStatCard
          detail={appointmentStats.next?.id ?? 'No upcoming'}
          label="Next Appointment"
          value={appointmentStats.next?.date ?? '-'}
        />
      </section>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px] xl:items-start">
        <section className="grid content-start gap-4" aria-label="Appointment list">
          {appointments.map((appointment) => {
            const isSelected = appointment.id === selectedAppointment?.id

            return (
              <article
                className={`rounded-[5px] border px-4 py-4 shadow-[3px_3px_2.5px_1px_#1b3a6b] transition duration-200 hover:-translate-y-0.5 active:scale-[0.995] ${
                  isSelected
                    ? 'scale-[1.01] border-[#1b3a6b] bg-[#c1d9ff]'
                    : 'border-[#295498]/70 bg-white hover:bg-[#f8fbff]'
                }`}
                key={appointment.id}
              >
                <button
                  className="block w-full text-left"
                  onClick={() => {
                    setSelectedId(appointment.id)
                    setIsEditing(false)
                    setEditForm(null)
                  }}
                  type="button"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="m-0 text-[11px] font-semibold text-[#1b3a6b]">
                        {appointment.id}
                      </p>
                      <h2 className="m-0 mt-2 text-[20px] font-semibold leading-tight">
                        {appointment.purpose}
                      </h2>
                    </div>
                    <span
                      className={`inline-flex min-h-[24px] items-center rounded-[5px] border px-3 text-[10px] font-semibold ${getAppointmentStatusClass(
                        appointment.status,
                      )}`}
                    >
                      {appointment.status}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-2 text-[12px] text-[#434343] sm:grid-cols-2">
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays aria-hidden="true" size={14} />
                      {appointment.date}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Clock aria-hidden="true" size={14} />
                      {appointment.time}
                    </span>
                  </div>

                  {isSelected ? (
                    <p className="m-0 mt-3 text-[12px] leading-snug text-[#434343] xl:hidden">
                      {appointment.description}
                    </p>
                  ) : null}
                </button>

                {isSelected ? (
                  <div className="mt-4 grid gap-2 border-t border-[#1b3a6b]/25 pt-4 xl:hidden">
                    <button
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-[5px] border border-[#1b3a6b] bg-[#1b3a6b] text-[12px] font-semibold !text-white transition duration-200 hover:bg-[#295498] active:scale-[0.98]"
                      onClick={startEditing}
                      type="button"
                    >
                      <Pencil aria-hidden="true" size={14} />
                      Edit Appointment
                    </button>
                    <button
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-[5px] border border-[#8a1f1f] bg-white text-[12px] font-semibold text-[#8a1f1f] transition duration-200 hover:bg-[#f0d7d7] active:scale-[0.98]"
                      onClick={handleDelete}
                      type="button"
                    >
                      <Trash2 aria-hidden="true" size={14} />
                      Delete
                    </button>
                  </div>
                ) : null}
              </article>
            )
          })}

          {appointments.length === 0 ? (
            <div className="rounded-[5px] border border-[#295498]/60 bg-white px-5 py-8 text-center text-[14px] text-[#434343] shadow-sm">
              No appointments yet.
            </div>
          ) : null}
        </section>

        {isEditing ? (
          <button
            aria-label="Close appointment editor"
            className="fixed inset-0 z-40 bg-[#101010]/35 backdrop-blur-[2px] xl:hidden"
            onClick={() => {
              setIsEditing(false)
              setEditForm(null)
              setEditError('')
            }}
            type="button"
          />
        ) : null}

        <aside
          className={`rounded-[5px] border border-[#1b3a6b] bg-white px-4 py-5 shadow-[3px_3px_2.5px_1px_#1b3a6b] xl:sticky xl:top-8 xl:block ${
            isEditing
              ? 'fixed bottom-3 left-3 right-3 top-8 z-50 overflow-y-auto animate-[modalIn_220ms_ease-out] xl:bottom-auto xl:left-auto xl:right-auto xl:z-auto xl:overflow-visible'
              : 'hidden'
          }`}
        >
          {selectedAppointment ? (
            isEditing && editForm ? (
              <form onSubmit={handleEditSubmit}>
                <h2 className="m-0 text-[18px] font-semibold text-[#1b3a6b]">
                  Update Appointment
                </h2>

                <label className="mt-4 grid gap-2 text-[12px] font-semibold text-[#1b3a6b]">
                  Appointment Type
                  <select
                    className="h-10 rounded-[5px] border border-[#7fa8de] bg-white px-3 text-[13px] outline-none"
                    onChange={(event) =>
                      updateEditForm({ mode: event.target.value as AppointmentMode })
                    }
                    value={editForm.mode}
                  >
                    <option value="office">Office</option>
                    <option value="department">Department</option>
                  </select>
                </label>

                <label className="mt-4 grid gap-2 text-[12px] font-semibold text-[#1b3a6b]">
                  {editForm.mode === 'office' ? 'Office' : 'Department'}
                  <select
                    className="h-10 rounded-[5px] border border-[#7fa8de] bg-white px-3 text-[13px] outline-none"
                    onChange={(event) =>
                      updateEditForm(
                        editForm.mode === 'office'
                          ? { office: event.target.value, department: undefined, faculty: undefined }
                          : { office: event.target.value, department: event.target.value },
                      )
                    }
                    value={editForm.mode === 'office' ? editForm.office : editForm.department}
                  >
                    {(editForm.mode === 'office' ? officeOptions : departmentOptions).map(
                      (option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ),
                    )}
                  </select>
                </label>

                {editForm.mode === 'department' ? (
                  <label className="mt-4 grid gap-2 text-[12px] font-semibold text-[#1b3a6b]">
                    Faculty Member
                    <select
                      className="h-10 rounded-[5px] border border-[#7fa8de] bg-white px-3 text-[13px] outline-none"
                      onChange={(event) => updateEditForm({ faculty: event.target.value })}
                      value={editForm.faculty}
                    >
                      {facultyOptions.map((faculty) => (
                        <option key={faculty} value={faculty}>
                          {faculty}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}

                <label className="mt-4 grid gap-2 text-[12px] font-semibold text-[#1b3a6b]">
                  Purpose
                  <select
                    className="h-10 rounded-[5px] border border-[#7fa8de] bg-white px-3 text-[13px] outline-none"
                    onChange={(event) => updateEditForm({ purpose: event.target.value })}
                    value={editForm.purpose}
                  >
                    {appointmentPurposes.map((purpose) => (
                      <option key={purpose} value={purpose}>
                        {purpose}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="mt-4 grid gap-2 text-[12px] font-semibold text-[#1b3a6b]">
                  Category
                  <select
                    className="h-10 rounded-[5px] border border-[#7fa8de] bg-white px-3 text-[13px] outline-none"
                    onChange={(event) =>
                      updateEditForm({ consultationCategory: event.target.value })
                    }
                    value={editForm.consultationCategory}
                  >
                    {consultationCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                <section className="mt-4 rounded-[5px] border border-[#7fa8de] bg-[#edf4ff] px-3 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="m-0 inline-flex items-center gap-2 text-[14px] font-semibold text-[#1b3a6b]">
                      <CalendarDays aria-hidden="true" size={16} />
                      Select Date
                    </h3>
                    <span className="text-right text-[11px] font-semibold leading-tight text-[#707070]">
                      After {formatAppointmentDate(getTodayStart())}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {getEditableCalendarDates().map((date) => {
                      const dateLabel = formatAppointmentDate(date)
                      const isSelected = editForm.date === dateLabel

                      return (
                        <button
                          className={`rounded-[5px] border px-2 py-2 text-center transition duration-200 active:scale-[0.98] ${
                            isSelected
                              ? 'border-[#1b3a6b] bg-[#1b3a6b] !text-white'
                              : 'border-[#7fa8de] bg-white text-[#1b3a6b] hover:bg-[#c1d9ff]'
                          }`}
                          key={dateLabel}
                          onClick={() => chooseEditDate(date)}
                          type="button"
                        >
                          <span className="block text-[10px] font-semibold">
                            {weekdayFormatter.format(date)}
                          </span>
                          <span className="block text-[16px] font-bold leading-tight">
                            {date.getDate()}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  <h3 className="m-0 mt-4 inline-flex items-center gap-2 text-[14px] font-semibold text-[#1b3a6b]">
                    <Clock aria-hidden="true" size={16} />
                    Available Time
                  </h3>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {getTimesForDate(parseAppointmentDate(editForm.date) ?? getEditableCalendarDates()[0]).map(
                      (time) => (
                        <button
                          className={`h-9 rounded-[5px] border text-[12px] font-semibold transition duration-200 active:scale-[0.98] ${
                            editForm.time === time
                              ? 'border-[#1b3a6b] bg-[#1b3a6b] !text-white'
                              : 'border-[#7fa8de] bg-white text-[#1b3a6b] hover:bg-[#c1d9ff]'
                          }`}
                          key={time}
                          onClick={() => updateEditForm({ time })}
                          type="button"
                        >
                          {time}
                        </button>
                      ),
                    )}
                  </div>
                </section>

                <label className="mt-4 grid gap-2 text-[12px] font-semibold text-[#1b3a6b]">
                  Description
                  <textarea
                    className="min-h-[100px] resize-none rounded-[5px] border border-[#7fa8de] bg-white px-3 py-3 text-[13px] outline-none"
                    onChange={(event) => updateEditForm({ description: event.target.value })}
                    value={editForm.description}
                  />
                </label>

                {editError ? (
                  <p className="m-0 mt-4 rounded-[5px] border border-[#8a1f1f] bg-[#f0d7d7] px-3 py-2 text-[12px] font-semibold leading-snug text-[#8a1f1f]">
                    {editError}
                  </p>
                ) : null}

                <div className="mt-5 grid gap-3">
                  <button
                    className="h-10 rounded-[5px] border border-[#1b3a6b] bg-[#1b3a6b] text-[13px] font-semibold !text-white transition duration-200 hover:bg-[#295498] active:scale-[0.98]"
                    type="submit"
                  >
                    Save Changes
                  </button>
                  <button
                    className="h-10 rounded-[5px] border border-[#1b3a6b] bg-white text-[13px] font-semibold text-[#1b3a6b] transition duration-200 hover:bg-[#edf4ff] active:scale-[0.98]"
                    onClick={() => {
                      setIsEditing(false)
                      setEditForm(null)
                      setEditError('')
                    }}
                    type="button"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <p className="m-0 text-[11px] font-semibold text-[#1b3a6b]">
                  {selectedAppointment.id}
                </p>
                <h2 className="m-0 mt-2 text-[22px] font-semibold leading-tight">
                  {selectedAppointment.purpose}
                </h2>
                <span
                  className={`mt-4 inline-flex min-h-[24px] items-center rounded-[5px] border px-3 text-[10px] font-semibold ${getAppointmentStatusClass(
                    selectedAppointment.status,
                  )}`}
                >
                  {selectedAppointment.status}
                </span>

                <dl className="mt-5 grid gap-3 text-[13px]">
                  {[
                    ['Type', selectedAppointment.mode === 'office' ? 'Office' : 'Department'],
                    ['Office', selectedAppointment.office],
                    ['Faculty', selectedAppointment.faculty ?? 'Not required'],
                    ['Date', selectedAppointment.date],
                    ['Time', selectedAppointment.time],
                    ['Category', selectedAppointment.consultationCategory],
                    ['Description', selectedAppointment.description],
                  ].map(([label, value]) => (
                    <div className="grid gap-1" key={label}>
                      <dt className="font-semibold text-[#1b3a6b]">{label}</dt>
                      <dd className="m-0 leading-snug text-[#434343]">{value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-6 grid gap-3">
                  <button
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-[5px] border border-[#1b3a6b] bg-[#1b3a6b] text-[13px] font-semibold !text-white transition duration-200 hover:bg-[#295498] active:scale-[0.98]"
                    onClick={startEditing}
                    type="button"
                  >
                    <Pencil aria-hidden="true" size={15} />
                    Edit
                  </button>
                  <button
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-[5px] border border-[#8a1f1f] bg-white text-[13px] font-semibold text-[#8a1f1f] transition duration-200 hover:bg-[#f0d7d7] active:scale-[0.98]"
                    onClick={handleDelete}
                    type="button"
                  >
                    <Trash2 aria-hidden="true" size={15} />
                    Delete
                  </button>
                </div>
              </>
            )
          ) : (
            <p className="m-0 text-[14px] text-[#434343]">Select an appointment to view details.</p>
          )}
        </aside>
      </div>
    </StudentWorkspaceShell>
  )
}
