import { FileText, Pencil, ShieldCheck, Trash2 } from 'lucide-react'
import { type FormEvent, useMemo, useState } from 'react'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { LoadingLink } from '@/components/feedback/LoadingLink'
import { campusLocations, concernCategories } from '../studentData.config'
import { useStudentData } from '../context/studentDataStore'
import type {
  ConcernCategory,
  ConcernInput,
  ConcernVisibility,
  StudentConcern,
} from '../studentData.types'
import { getConcernStatusClass } from '../studentUi'
import { StudentWorkspaceShell } from './StudentWorkspaceShell'

type StatCardProps = {
  label: string
  value: number
}

type ConcernDetailPanelProps = {
  editForm: ConcernInput | null
  isEditing: boolean
  onCancelEdit: () => void
  onChangeEdit: (patch: Partial<ConcernInput>) => void
  onDelete: (id: string) => void
  onStartEdit: (concern: StudentConcern) => void
  onSubmitEdit: (event: FormEvent<HTMLFormElement>) => void
  selectedConcern: StudentConcern | null
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <article className="rounded-[5px] border border-[#295498]/70 bg-white px-3 py-3 shadow-[3px_3px_2.5px_1px_#1b3a6b] sm:px-4 sm:py-4">
      <p className="m-0 text-[10px] font-medium leading-tight text-[#707070] sm:text-[12px]">
        {label}
      </p>
      <p className="m-0 mt-2 text-[22px] font-bold leading-none text-[#1b3a6b] sm:mt-3 sm:text-[30px]">
        {value}
      </p>
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

function ConcernDetailPanel({
  editForm,
  isEditing,
  onCancelEdit,
  onChangeEdit,
  onDelete,
  onStartEdit,
  onSubmitEdit,
  selectedConcern,
}: ConcernDetailPanelProps) {
  if (!selectedConcern) {
    return (
      <aside className="rounded-[5px] border border-[#295498]/70 bg-white px-5 py-6 shadow-[3px_3px_2.5px_1px_#1b3a6b] xl:sticky xl:top-8">
        <h2 className="m-0 text-[20px] font-semibold text-[#1b3a6b]">Concern Details</h2>
        <p className="m-0 mt-3 text-[13px] leading-snug text-[#434343]">
          Select a concern to view its full information.
        </p>
      </aside>
    )
  }

  if (isEditing && editForm) {
    return (
      <aside className="rounded-[5px] border border-[#1b3a6b] bg-[#edf4ff] px-4 py-5 shadow-[3px_3px_2.5px_1px_#1b3a6b] xl:sticky xl:top-8">
        <form onSubmit={onSubmitEdit}>
          <div className="flex items-center gap-2">
            <ShieldCheck aria-hidden="true" size={18} />
            <h2 className="m-0 text-[18px] font-semibold text-[#1b3a6b]">
              Update {selectedConcern.id}
            </h2>
          </div>

          <label className="mt-5 grid gap-2 text-[12px] font-semibold text-[#1b3a6b]">
            Category
            <select
              className="h-11 rounded-[5px] border border-[#7fa8de] bg-white px-3 text-[13px] outline-none"
              onChange={(event) =>
                onChangeEdit({ category: event.target.value as ConcernCategory })
              }
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
              onChange={(event) => onChangeEdit({ location: event.target.value })}
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
              onChange={(event) => onChangeEdit({ title: event.target.value })}
              value={editForm.title}
            />
          </label>

          <label className="mt-4 grid gap-2 text-[12px] font-semibold text-[#1b3a6b]">
            Description
            <textarea
              className="min-h-[130px] resize-none rounded-[5px] border border-[#7fa8de] bg-white px-3 py-3 text-[13px] outline-none"
              onChange={(event) => onChangeEdit({ description: event.target.value })}
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
                onClick={() => onChangeEdit({ visibility })}
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
              onChange={(event) => onChangeEdit({ anonymous: event.target.checked })}
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
              onClick={onCancelEdit}
              type="button"
            >
              Cancel
            </button>
          </div>
        </form>
      </aside>
    )
  }

  return (
    <aside className="rounded-[5px] border border-[#1b3a6b] bg-white px-5 py-5 shadow-[3px_3px_2.5px_1px_#1b3a6b] xl:sticky xl:top-8">
      <p className="m-0 text-[11px] font-semibold text-[#1b3a6b]">{selectedConcern.id}</p>
      <h2 className="m-0 mt-2 text-[22px] font-semibold leading-tight">
        {selectedConcern.title}
      </h2>
      <span
        className={`mt-4 inline-flex min-h-[24px] items-center rounded-[5px] border px-3 text-[10px] font-semibold ${getConcernStatusClass(
          selectedConcern.status,
        )}`}
      >
        {selectedConcern.status}
      </span>

      <dl className="mt-5 grid gap-3 text-[13px]">
        {[
          ['Category', selectedConcern.category],
          ['Location', selectedConcern.location],
          ['Visibility', selectedConcern.visibility === 'public' ? 'Public' : 'Private'],
          ['Author', selectedConcern.author],
          ['Created', selectedConcern.createdAt],
          ['Up Reactions', selectedConcern.reactions],
          ['Description', selectedConcern.description],
        ].map(([label, value]) => (
          <div className="grid gap-1" key={label}>
            <dt className="font-semibold text-[#1b3a6b]">{label}</dt>
            <dd className="m-0 leading-snug text-[#434343]">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5">
        <div className="flex items-center justify-between text-[11px] font-semibold text-[#1b3a6b]">
          <span>Progress</span>
          <span>{selectedConcern.progress}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#d9d9d9]">
          <span
            className="block h-full rounded-full bg-[#1b3a6b]"
            style={{ width: `${selectedConcern.progress}%` }}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-[5px] border border-[#1b3a6b] bg-[#1b3a6b] text-[13px] font-semibold !text-white transition duration-200 hover:bg-[#295498] active:scale-[0.98]"
          onClick={() => onStartEdit(selectedConcern)}
          type="button"
        >
          <Pencil aria-hidden="true" size={15} />
          Edit
        </button>
        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-[5px] border border-[#8a1f1f] bg-white text-[13px] font-semibold text-[#8a1f1f] transition duration-200 hover:bg-[#f0d7d7] active:scale-[0.98]"
          onClick={() => onDelete(selectedConcern.id)}
          type="button"
        >
          <Trash2 aria-hidden="true" size={15} />
          Delete
        </button>
      </div>
    </aside>
  )
}

export function StudentConcerns() {
  const { concerns, deleteConcern, updateConcern } = useStudentData()
  const [selectedId, setSelectedId] = useState(concerns[0]?.id ?? '')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<ConcernInput | null>(null)

  const selectedConcern =
    concerns.find((concern) => concern.id === selectedId) ?? concerns[0] ?? null
  const isEditing = Boolean(selectedConcern && editingId === selectedConcern.id && editForm)

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
    setSelectedId(concern.id)
    setEditingId(concern.id)
    setEditForm(toConcernInput(concern))
  }

  const handleCardSelect = (concern: StudentConcern) => {
    setSelectedId(concern.id)
    setEditingId(null)
    setEditForm(null)
  }

  const handleDelete = (id: string) => {
    const remainingConcerns = concerns.filter((concern) => concern.id !== id)

    deleteConcern(id)
    setSelectedId(remainingConcerns[0]?.id ?? '')
    setEditingId(null)
    setEditForm(null)
  }

  const handleEditSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedConcern || !editForm) {
      return
    }

    updateConcern(selectedConcern.id, editForm)
    setEditingId(null)
    setEditForm(null)
  }

  const updateEditForm = (patch: Partial<ConcernInput>) => {
    setEditForm((currentForm) => (currentForm ? { ...currentForm, ...patch } : currentForm))
  }

  return (
    <StudentWorkspaceShell activeSection="concerns" contentClassName="max-w-none">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <DashboardHeader
          title="My Concerns"
          subtitle="Select a concern to review its full details, then edit or remove it."
        />
        <LoadingLink
          className="relative inline-flex h-10 items-center justify-center overflow-hidden rounded-[5px] border border-[#1b3a6b] bg-[#1b3a6b] px-5 text-[13px] font-semibold !text-white no-underline transition duration-200 hover:bg-[#295498] active:scale-[0.98] [&_*]:!text-white"
          href="#student-concern-new"
        >
          <FileText aria-hidden="true" size={16} />
          Add Concern
        </LoadingLink>
      </div>

      <section
        className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4 xl:grid-cols-4"
        aria-label="Concern statistics"
      >
        <StatCard label="Total Concerns Submitted" value={stats.total} />
        <StatCard label="Active Concerns" value={stats.active} />
        <StatCard label="For Verification" value={stats.verification} />
        <StatCard label="Resolved" value={stats.resolved} />
      </section>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px] xl:items-start">
        <section className="grid content-start gap-4" aria-label="Concern list">
          {concerns.map((concern) => {
            const isSelected = concern.id === selectedConcern?.id

            return (
              <article
                className={`rounded-[5px] border px-4 py-4 shadow-[3px_3px_2.5px_1px_#1b3a6b] transition duration-200 hover:-translate-y-0.5 active:scale-[0.995] ${
                  isSelected
                    ? 'scale-[1.01] border-[#1b3a6b] bg-[#c1d9ff]'
                    : 'border-[#295498]/70 bg-white hover:bg-[#f8fbff]'
                }`}
                key={concern.id}
              >
                <button
                  className="block w-full text-left"
                  onClick={() => handleCardSelect(concern)}
                  type="button"
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

                  <p className="m-0 mt-2 max-w-[720px] text-[13px] font-light leading-[1.35]">
                    {concern.description}
                  </p>

                  <div className="mt-4 flex items-center gap-3">
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
                </button>

                {isSelected ? (
                  <div className="mt-4 grid gap-2 border-t border-[#1b3a6b]/25 pt-4 xl:hidden">
                    <button
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-[5px] border border-[#1b3a6b] bg-[#1b3a6b] text-[12px] font-semibold !text-white transition duration-200 hover:bg-[#295498] active:scale-[0.98]"
                      onClick={() => startEditing(concern)}
                      type="button"
                    >
                      <Pencil aria-hidden="true" size={14} />
                      Edit Concern
                    </button>
                    <button
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-[5px] border border-[#8a1f1f] bg-white text-[12px] font-semibold text-[#8a1f1f] transition duration-200 hover:bg-[#f0d7d7] active:scale-[0.98]"
                      onClick={() => handleDelete(concern.id)}
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
        </section>

        <div className="hidden xl:block">
          <ConcernDetailPanel
            editForm={editForm}
            isEditing={isEditing}
            onCancelEdit={() => {
              setEditingId(null)
              setEditForm(null)
            }}
            onChangeEdit={updateEditForm}
            onDelete={handleDelete}
            onStartEdit={startEditing}
            onSubmitEdit={handleEditSubmit}
            selectedConcern={selectedConcern}
          />
        </div>
      </div>

      {isEditing ? (
        <div className="fixed inset-0 z-50 grid place-items-end bg-[#101010]/35 px-3 pb-3 pt-8 backdrop-blur-[2px] xl:hidden">
          <div className="max-h-[86svh] w-full overflow-y-auto animate-[modalIn_220ms_ease-out]">
            <ConcernDetailPanel
              editForm={editForm}
              isEditing={isEditing}
              onCancelEdit={() => {
                setEditingId(null)
                setEditForm(null)
              }}
              onChangeEdit={updateEditForm}
              onDelete={handleDelete}
              onStartEdit={startEditing}
              onSubmitEdit={handleEditSubmit}
              selectedConcern={selectedConcern}
            />
          </div>
        </div>
      ) : null}
    </StudentWorkspaceShell>
  )
}
