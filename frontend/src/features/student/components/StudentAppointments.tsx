import { CalendarDays, Clock, Pencil, Plus, Trash2 } from 'lucide-react'
import { type FormEvent, useState } from 'react'
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

export function StudentAppointments() {
  const { appointments, deleteAppointment, updateAppointment } = useStudentData()
  const [selectedId, setSelectedId] = useState(appointments[0]?.id ?? '')
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<AppointmentInput | null>(null)

  const selectedAppointment =
    appointments.find((appointment) => appointment.id === selectedId) ?? appointments[0] ?? null

  const startEditing = () => {
    if (!selectedAppointment) {
      return
    }

    setIsEditing(true)
    setEditForm(toAppointmentInput(selectedAppointment))
  }

  const updateEditForm = (patch: Partial<AppointmentInput>) => {
    setEditForm((currentForm) => (currentForm ? { ...currentForm, ...patch } : currentForm))
  }

  const handleEditSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedAppointment || !editForm) {
      return
    }

    updateAppointment(selectedAppointment.id, editForm)
    setIsEditing(false)
    setEditForm(null)
  }

  const handleDelete = () => {
    if (!selectedAppointment) {
      return
    }

    deleteAppointment(selectedAppointment.id)
    setIsEditing(false)
    setEditForm(null)
  }

  return (
    <StudentWorkspaceShell activeSection="appointments" contentClassName="max-w-[960px]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <DashboardHeader
          title="My Appointments"
          subtitle="Select an appointment to review its full details, then edit or remove it."
        />
        <LoadingLink
          className="relative inline-flex h-10 items-center justify-center overflow-hidden rounded-[5px] border border-[#1b3a6b] bg-[#1b3a6b] px-5 text-[13px] font-semibold !text-white no-underline transition duration-200 hover:bg-[#295498] active:scale-[0.98] [&_*]:!text-white"
          href="#student-appointment-new"
        >
          <Plus aria-hidden="true" size={16} />
          Create Appointment
        </LoadingLink>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,590px)_320px] xl:items-start">
        <section className="grid content-start gap-4" aria-label="Appointment list">
          {appointments.map((appointment) => {
            const isSelected = appointment.id === selectedAppointment?.id

            return (
              <button
                className={`rounded-[5px] border px-4 py-4 text-left shadow-[3px_3px_2.5px_1px_#1b3a6b] transition duration-200 hover:-translate-y-0.5 active:scale-[0.995] ${
                  isSelected
                    ? 'border-[#1b3a6b] bg-[#c1d9ff]'
                    : 'border-[#295498]/70 bg-white hover:bg-[#f8fbff]'
                }`}
                key={appointment.id}
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
              </button>
            )
          })}

          {appointments.length === 0 ? (
            <div className="rounded-[5px] border border-[#295498]/60 bg-white px-5 py-8 text-center text-[14px] text-[#434343] shadow-sm">
              No appointments yet.
            </div>
          ) : null}
        </section>

        <aside className="rounded-[5px] border border-[#1b3a6b] bg-white px-4 py-5 shadow-[3px_3px_2.5px_1px_#1b3a6b]">
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

                <label className="mt-4 grid gap-2 text-[12px] font-semibold text-[#1b3a6b]">
                  Description
                  <textarea
                    className="min-h-[100px] resize-none rounded-[5px] border border-[#7fa8de] bg-white px-3 py-3 text-[13px] outline-none"
                    onChange={(event) => updateEditForm({ description: event.target.value })}
                    value={editForm.description}
                  />
                </label>

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
