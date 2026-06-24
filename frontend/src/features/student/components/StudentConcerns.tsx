import { FileText, Pencil, ShieldCheck, Trash2 } from 'lucide-react'
import { type FormEvent, useMemo, useState } from 'react'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { LoadingLink } from '@/components/feedback/LoadingLink'
import {
  campusLocations,
  concernCategories,
} from '../studentData.config'
import { useStudentData } from '../context/studentDataStore'
import type { ConcernCategory, ConcernInput, ConcernVisibility, StudentConcern } from '../studentData.types'
import { getConcernStatusClass } from '../studentUi'
import { StudentWorkspaceShell } from './StudentWorkspaceShell'

type StatCardProps = {
  label: string
  value: number
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <article className="rounded-[5px] border border-[#295498]/70 bg-white px-4 py-4 shadow-[3px_3px_2.5px_1px_#1b3a6b]">
      <p className="m-0 text-[12px] font-medium text-[#707070]">{label}</p>
      <p className="m-0 mt-3 text-[30px] font-bold leading-none text-[#1b3a6b]">{value}</p>
    </article>
  )
}

function toConcernInput(concern: StudentConcern): ConcernInput {
  return {
    title: concern.title,
    description: concern.description,
    category: concern.category,
    location: concern.location,
    visibility: concern.visibility,
    anonymous: concern.anonymous,
  }
}

type ConcernEditPanelProps = {
  editingConcern: StudentConcern | null
  editForm: ConcernInput | null
  onCancel: () => void
  onChange: (patch: Partial<ConcernInput>) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

function ConcernEditPanel({
  editingConcern,
  editForm,
  onCancel,
  onChange,
  onSubmit,
}: ConcernEditPanelProps) {
  if (!editingConcern || !editForm) {
    return (
      <aside className="rounded-[5px] border border-[#295498]/70 bg-white px-5 py-6 shadow-[3px_3px_2.5px_1px_#1b3a6b] xl:sticky xl:top-8">
        <h2 className="m-0 text-[20px] font-semibold text-[#1b3a6b]">Update Concern</h2>
        <p className="m-0 mt-3 text-[13px] leading-snug text-[#434343]">
          Select a concern from the list to edit its title, location, visibility, or description.
        </p>
      </aside>
    )
  }

  return (
    <aside className="rounded-[5px] border border-[#1b3a6b] bg-[#edf4ff] px-4 py-5 shadow-[3px_3px_2.5px_1px_#1b3a6b] xl:sticky xl:top-8">
      <form onSubmit={onSubmit}>
        <div className="flex items-center gap-2">
          <ShieldCheck aria-hidden="true" size={18} />
          <h2 className="m-0 text-[18px] font-semibold text-[#1b3a6b]">
            Update {editingConcern.id}
          </h2>
        </div>

        <label className="mt-5 grid gap-2 text-[12px] font-semibold text-[#1b3a6b]">
          Category
          <select
            className="h-11 rounded-[5px] border border-[#7fa8de] bg-white px-3 text-[13px] outline-none"
            onChange={(event) => onChange({ category: event.target.value as ConcernCategory })}
            value={editForm.category}
          >
            {concernCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-4 grid gap-2 text-[12px] font-semibold text-[#1b3a6b]">
          Location
          <select
            className="h-11 rounded-[5px] border border-[#7fa8de] bg-white px-3 text-[13px] outline-none"
            onChange={(event) => onChange({ location: event.target.value })}
            value={editForm.location}
          >
            {campusLocations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-4 grid gap-2 text-[12px] font-semibold text-[#1b3a6b]">
          Title
          <input
            className="h-11 rounded-[5px] border border-[#7fa8de] bg-white px-3 text-[13px] outline-none"
            onChange={(event) => onChange({ title: event.target.value })}
            value={editForm.title}
          />
        </label>

        <label className="mt-4 grid gap-2 text-[12px] font-semibold text-[#1b3a6b]">
          Description
          <textarea
            className="min-h-[130px] resize-none rounded-[5px] border border-[#7fa8de] bg-white px-3 py-3 text-[13px] outline-none"
            onChange={(event) => onChange({ description: event.target.value })}
            value={editForm.description}
          />
        </label>

        <div className="mt-4 grid gap-3">
          {(['public', 'private'] as ConcernVisibility[]).map((visibility) => (
            <button
              className={`h-10 rounded-[5px] border text-[13px] font-semibold capitalize transition duration-200 active:scale-[0.98] ${
                editForm.visibility === visibility
                  ? 'border-[#1b3a6b] bg-[#1b3a6b] !text-white'
                  : 'border-[#1b3a6b] bg-white text-[#1b3a6b] hover:bg-[#edf4ff]'
              }`}
              key={visibility}
              onClick={() => onChange({ visibility })}
              type="button"
            >
              {visibility}
            </button>
          ))}
        </div>

        <label className="mt-4 flex items-center gap-3 text-[13px] font-medium text-[#1b3a6b]">
          <input
            checked={editForm.anonymous}
            className="size-4 accent-[#1b3a6b]"
            onChange={(event) => onChange({ anonymous: event.target.checked })}
            type="checkbox"
          />
          Keep anonymous
        </label>

        <div className="mt-5 grid gap-3">
          <button
            className="h-10 rounded-[5px] border border-[#1b3a6b] bg-[#1b3a6b] px-5 text-[13px] font-semibold !text-white transition duration-200 hover:bg-[#295498] active:scale-[0.98]"
            type="submit"
          >
            Save Changes
          </button>
          <button
            className="h-10 rounded-[5px] border border-[#1b3a6b] bg-white px-5 text-[13px] font-semibold text-[#1b3a6b] transition duration-200 hover:bg-[#edf4ff] active:scale-[0.98]"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
        </div>
      </form>
    </aside>
  )
}

export function StudentConcerns() {
  const { concerns, deleteConcern, updateConcern } = useStudentData()
  const [editingConcern, setEditingConcern] = useState<StudentConcern | null>(null)
  const [editForm, setEditForm] = useState<ConcernInput | null>(null)

  const stats = useMemo(
    () => ({
      total: concerns.length,
      active: concerns.filter((concern) => concern.status !== 'Completed').length,
      verification: concerns.filter((concern) => concern.status === 'For Approval').length,
      resolved: concerns.filter((concern) => concern.status === 'Completed').length,
    }),
    [concerns],
  )

  const startEditing = (concern: StudentConcern) => {
    setEditingConcern(concern)
    setEditForm(toConcernInput(concern))
  }

  const handleEditSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!editingConcern || !editForm) {
      return
    }

    updateConcern(editingConcern.id, editForm)
    setEditingConcern(null)
    setEditForm(null)
  }

  const updateEditForm = (patch: Partial<ConcernInput>) => {
    setEditForm((currentForm) => (currentForm ? { ...currentForm, ...patch } : currentForm))
  }

  return (
    <StudentWorkspaceShell activeSection="concerns" contentClassName="max-w-[930px]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <DashboardHeader
          title="My Concerns"
          subtitle="Track submitted concerns and manage items you still need to update."
        />
        <LoadingLink
          className="relative inline-flex h-10 items-center justify-center overflow-hidden rounded-[5px] border border-[#1b3a6b] bg-[#1b3a6b] px-5 text-[13px] font-semibold !text-white no-underline transition duration-200 hover:bg-[#295498] active:scale-[0.98] [&_*]:!text-white"
          href="#student-concern-new"
        >
          <FileText aria-hidden="true" size={16} />
          Add Concern
        </LoadingLink>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Concern statistics">
        <StatCard label="Total Concerns Submitted" value={stats.total} />
        <StatCard label="Active Concerns" value={stats.active} />
        <StatCard label="For Verification" value={stats.verification} />
        <StatCard label="Resolved" value={stats.resolved} />
      </section>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
        <section className="grid gap-4" aria-label="Concern list">
          {concerns.map((concern) => (
            <article
              className="rounded-[5px] border border-[#295498]/70 bg-white px-4 py-4 shadow-[3px_3px_2.5px_1px_#1b3a6b] transition duration-200 hover:-translate-y-0.5 active:scale-[0.995]"
              key={concern.id}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-[#707070]">
                    <span className="text-[#1b3a6b]">{concern.id}</span>
                    <span>{concern.location}</span>
                    <span>{concern.visibility === 'public' ? 'Public' : 'Private'}</span>
                  </div>
                  <h2 className="m-0 mt-2 text-[21px] font-semibold leading-tight text-[#101010]">
                    {concern.title}
                  </h2>
                </div>
                <span
                  className={`inline-flex min-h-[24px] items-center rounded-[5px] border px-3 text-[10px] font-semibold ${getConcernStatusClass(
                    concern.status,
                  )}`}
                >
                  {concern.status}
                </span>
              </div>

              <p className="m-0 mt-2 max-w-[670px] text-[13px] font-light leading-[1.35]">
                {concern.description}
              </p>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#d9d9d9]">
                    <span
                      className="block h-full rounded-full bg-[#1b3a6b] transition-all duration-500"
                      style={{ width: `${concern.progress}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-[#1b3a6b]">
                    {concern.progress}%
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-[5px] border border-[#1b3a6b] bg-white px-3 text-[12px] font-semibold text-[#1b3a6b] transition duration-200 hover:bg-[#edf4ff] active:scale-[0.98]"
                    onClick={() => startEditing(concern)}
                    type="button"
                  >
                    <Pencil aria-hidden="true" size={14} />
                    Edit
                  </button>
                  <button
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-[5px] border border-[#8a1f1f] bg-white px-3 text-[12px] font-semibold text-[#8a1f1f] transition duration-200 hover:bg-[#f0d7d7] active:scale-[0.98]"
                    onClick={() => deleteConcern(concern.id)}
                    type="button"
                  >
                    <Trash2 aria-hidden="true" size={14} />
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>

        <ConcernEditPanel
          editingConcern={editingConcern}
          editForm={editForm}
          onCancel={() => {
            setEditingConcern(null)
            setEditForm(null)
          }}
          onChange={updateEditForm}
          onSubmit={handleEditSubmit}
        />
      </div>
    </StudentWorkspaceShell>
  )
}
