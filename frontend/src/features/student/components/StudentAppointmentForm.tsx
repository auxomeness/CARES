import { Building2, CalendarDays, Check, Clock, GraduationCap, Send } from 'lucide-react'
import { type FormEvent, useMemo, useState } from 'react'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { LoadingLink } from '@/components/feedback/LoadingLink'
import {
  appointmentPurposes,
  availableAppointmentTimes,
  consultationCategories,
  departmentOptions,
  facultyOptions,
  officeOptions,
} from '../studentData.config'
import { useStudentData } from '../context/studentDataStore'
import type { AppointmentInput, AppointmentMode } from '../studentData.types'
import { StudentWorkspaceShell } from './StudentWorkspaceShell'

function formatAppointmentDate(day: number) {
  return `June ${day}, 2026`
}

function getTimesForDay(day: number) {
  if (day % 3 === 0) {
    return availableAppointmentTimes.slice(1, 5)
  }

  if (day % 2 === 0) {
    return availableAppointmentTimes.slice(0, 4)
  }

  return availableAppointmentTimes.slice(2)
}

function createInitialAppointment(day: number): AppointmentInput {
  return {
    mode: 'office',
    office: officeOptions[0],
    date: formatAppointmentDate(day),
    time: getTimesForDay(day)[0],
    purpose: appointmentPurposes[0],
    consultationCategory: consultationCategories[0],
    description: '',
  }
}

export function StudentAppointmentForm() {
  const { addAppointment } = useStudentData()
  const [selectedDay, setSelectedDay] = useState(25)
  const [form, setForm] = useState<AppointmentInput>(() => createInitialAppointment(25))
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedTimes = useMemo(() => getTimesForDay(selectedDay), [selectedDay])
  const calendarDays = useMemo(() => Array.from({ length: 30 }, (_, index) => index + 1), [])

  const updateForm = (patch: Partial<AppointmentInput>) => {
    setForm((currentForm) => ({ ...currentForm, ...patch }))
  }

  const setMode = (mode: AppointmentMode) => {
    if (mode === 'office') {
      updateForm({
        mode,
        office: officeOptions[0],
        department: undefined,
        faculty: undefined,
      })
      return
    }

    updateForm({
      mode,
      office: departmentOptions[0],
      department: departmentOptions[0],
      faculty: facultyOptions[0],
    })
  }

  const chooseDay = (day: number) => {
    const times = getTimesForDay(day)
    setSelectedDay(day)
    updateForm({
      date: formatAppointmentDate(day),
      time: times.includes(form.time) ? form.time : times[0],
    })
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    window.setTimeout(() => {
      addAppointment(form)
      setIsSubmitting(false)
      window.location.hash = '#student-appointments'
    }, 500)
  }

  return (
    <StudentWorkspaceShell activeSection="appointments" contentClassName="max-w-[930px]">
      <DashboardHeader
        title="Set an Appointment"
        subtitle="Choose the office or department, pick a schedule, and review the summary."
      />

      <form className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]" onSubmit={handleSubmit}>
        <section className="grid gap-5">
          <div className="grid gap-3 rounded-[5px] border border-[#295498]/70 bg-white px-4 py-5 shadow-[3px_3px_2.5px_1px_#1b3a6b] sm:grid-cols-2">
            {[
              {
                mode: 'office' as AppointmentMode,
                label: 'Office',
                icon: Building2,
              },
              {
                mode: 'department' as AppointmentMode,
                label: 'Department',
                icon: GraduationCap,
              },
            ].map((option) => {
              const Icon = option.icon
              const isActive = form.mode === option.mode

              return (
                <button
                  className={`inline-flex h-11 items-center justify-center gap-2 rounded-[5px] border text-[14px] font-semibold transition duration-200 active:scale-[0.98] ${
                    isActive
                      ? 'border-[#1b3a6b] bg-[#1b3a6b] !text-white'
                      : 'border-[#1b3a6b] bg-white text-[#1b3a6b] hover:bg-[#edf4ff]'
                  }`}
                  key={option.mode}
                  onClick={() => setMode(option.mode)}
                  type="button"
                >
                  <Icon aria-hidden="true" size={17} />
                  {option.label}
                </button>
              )
            })}
          </div>

          <section className="rounded-[5px] border border-[#295498]/70 bg-white px-4 py-5 shadow-[3px_3px_2.5px_1px_#1b3a6b]">
            <h2 className="m-0 text-[18px] font-semibold text-[#1b3a6b]">Appointment Details</h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-[12px] font-semibold text-[#1b3a6b]">
                {form.mode === 'office' ? 'Office' : 'Department'}
                <select
                  className="h-11 rounded-[5px] border border-[#7fa8de] bg-white px-3 text-[13px] outline-none focus:ring-2 focus:ring-[#9fbef1]"
                  onChange={(event) =>
                    updateForm(
                      form.mode === 'office'
                        ? { office: event.target.value }
                        : { office: event.target.value, department: event.target.value },
                    )
                  }
                  value={form.mode === 'office' ? form.office : form.department}
                >
                  {(form.mode === 'office' ? officeOptions : departmentOptions).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              {form.mode === 'department' ? (
                <label className="grid gap-2 text-[12px] font-semibold text-[#1b3a6b]">
                  Faculty Member
                  <select
                    className="h-11 rounded-[5px] border border-[#7fa8de] bg-white px-3 text-[13px] outline-none focus:ring-2 focus:ring-[#9fbef1]"
                    onChange={(event) => updateForm({ faculty: event.target.value })}
                    value={form.faculty}
                  >
                    {facultyOptions.map((faculty) => (
                      <option key={faculty} value={faculty}>
                        {faculty}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <label className="grid gap-2 text-[12px] font-semibold text-[#1b3a6b]">
                  Purpose
                  <select
                    className="h-11 rounded-[5px] border border-[#7fa8de] bg-white px-3 text-[13px] outline-none focus:ring-2 focus:ring-[#9fbef1]"
                    onChange={(event) => updateForm({ purpose: event.target.value })}
                    value={form.purpose}
                  >
                    {appointmentPurposes.map((purpose) => (
                      <option key={purpose} value={purpose}>
                        {purpose}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>

            {form.mode === 'department' ? (
              <label className="mt-4 grid gap-2 text-[12px] font-semibold text-[#1b3a6b]">
                Purpose
                <select
                  className="h-11 rounded-[5px] border border-[#7fa8de] bg-white px-3 text-[13px] outline-none focus:ring-2 focus:ring-[#9fbef1]"
                  onChange={(event) => updateForm({ purpose: event.target.value })}
                  value={form.purpose}
                >
                  {appointmentPurposes.map((purpose) => (
                    <option key={purpose} value={purpose}>
                      {purpose}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <label className="mt-4 grid gap-2 text-[12px] font-semibold text-[#1b3a6b]">
              Consultation Category
              <select
                className="h-11 rounded-[5px] border border-[#7fa8de] bg-white px-3 text-[13px] outline-none focus:ring-2 focus:ring-[#9fbef1]"
                onChange={(event) => updateForm({ consultationCategory: event.target.value })}
                value={form.consultationCategory}
              >
                {consultationCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-4 grid gap-2 text-[12px] font-semibold text-[#1b3a6b]">
              Description
              <textarea
                className="min-h-[120px] resize-none rounded-[5px] border border-[#7fa8de] bg-white px-3 py-3 text-[13px] outline-none focus:ring-2 focus:ring-[#9fbef1]"
                onChange={(event) => updateForm({ description: event.target.value })}
                placeholder="Tell the office or faculty what you want to discuss."
                required
                value={form.description}
              />
            </label>
          </section>

          <section className="grid gap-5 rounded-[5px] border border-[#295498]/70 bg-white px-4 py-5 shadow-[3px_3px_2.5px_1px_#1b3a6b] xl:grid-cols-[minmax(0,1fr)_210px]">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="m-0 inline-flex items-center gap-2 text-[18px] font-semibold text-[#1b3a6b]">
                  <CalendarDays aria-hidden="true" size={18} />
                  June 2026
                </h2>
                <span className="text-[12px] font-semibold text-[#707070]">
                  {formatAppointmentDate(selectedDay)}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-7 gap-2 text-center">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((dayLabel, index) => (
                  <span className="text-[11px] font-bold text-[#707070]" key={`${dayLabel}-${index}`}>
                    {dayLabel}
                  </span>
                ))}
                {calendarDays.map((day) => (
                  <button
                    className={`aspect-square rounded-[5px] text-[12px] font-semibold transition duration-200 active:scale-95 ${
                      selectedDay === day
                        ? 'bg-[#1b3a6b] !text-white'
                        : 'bg-[#edf4ff] text-[#1b3a6b] hover:bg-[#c1d9ff]'
                    }`}
                    key={day}
                    onClick={() => chooseDay(day)}
                    type="button"
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[5px] border border-[#7fa8de] bg-[#edf4ff] px-3 py-4">
              <h3 className="m-0 inline-flex items-center gap-2 text-[15px] font-semibold text-[#1b3a6b]">
                <Clock aria-hidden="true" size={16} />
                Available Time
              </h3>
              <div className="mt-4 grid gap-2">
                {selectedTimes.map((time) => (
                  <button
                    className={`h-9 rounded-[5px] border text-[12px] font-semibold transition duration-200 active:scale-[0.98] ${
                      form.time === time
                        ? 'border-[#1b3a6b] bg-[#1b3a6b] !text-white'
                        : 'border-[#7fa8de] bg-white text-[#1b3a6b] hover:bg-[#c1d9ff]'
                    }`}
                    key={time}
                    onClick={() => updateForm({ time })}
                    type="button"
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </section>

        <aside className="h-fit rounded-[5px] border border-[#1b3a6b] bg-[#f5d788] px-4 py-5 shadow-[3px_3px_2.5px_1px_#1b3a6b] xl:sticky xl:top-8">
          <h2 className="m-0 text-[20px] font-semibold text-[#1b3a6b]">Appointment Summary</h2>
          <dl className="mt-5 grid gap-4 text-[13px]">
            {[
              ['Type', form.mode === 'office' ? 'Office' : 'Department'],
              ['Target', form.mode === 'office' ? form.office : form.department],
              ['Faculty', form.mode === 'department' ? form.faculty : 'Not required'],
              ['Date', form.date],
              ['Time', form.time],
              ['Purpose', form.purpose],
              ['Category', form.consultationCategory],
            ].map(([label, value]) => (
              <div className="rounded-[5px] bg-white/55 px-3 py-2" key={label}>
                <dt className="font-semibold text-[#1b3a6b]">{label}</dt>
                <dd className="m-0 mt-1 leading-snug text-[#101010]">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-5 grid gap-3">
            <button
              className="inline-flex h-10 items-center justify-center gap-2 rounded-[5px] border border-[#1b3a6b] bg-[#1b3a6b] px-5 text-[13px] font-semibold !text-white transition duration-200 hover:bg-[#295498] active:scale-[0.98]"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? (
                <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Send aria-hidden="true" size={16} />
              )}
              Book Appointment
            </button>
            <LoadingLink
              className="relative inline-flex h-10 items-center justify-center gap-2 overflow-hidden rounded-[5px] border border-[#1b3a6b] bg-white px-5 text-[13px] font-semibold text-[#1b3a6b] no-underline transition duration-200 hover:bg-[#edf4ff] active:scale-[0.98]"
              href="#student-appointments"
            >
              <Check aria-hidden="true" size={16} />
              Cancel
            </LoadingLink>
          </div>
        </aside>
      </form>
    </StudentWorkspaceShell>
  )
}
