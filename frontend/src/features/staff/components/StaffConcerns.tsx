import { ImagePlus, Send, Shuffle } from 'lucide-react'
import { type FormEvent, useMemo, useState } from 'react'
import type { StaffConcern, StaffConcernStatus, StaffRole } from '../staffData'
import {
  assigneeOptions,
  concernStatusOptions,
  staffConcerns,
  staffRoleConfigs,
  transferTargets,
} from '../staffData'
import { StaffStatusBadge, StaffTimeline } from './StaffShared'
import { StaffWorkspaceShell } from './StaffWorkspaceShell'

type StaffConcernsProps = {
  role: Exclude<StaffRole, 'faculty'>
}

export function StaffConcerns({ role }: StaffConcernsProps) {
  const config = staffRoleConfigs[role]
  const scopedConcerns = useMemo(
    () => staffConcerns.filter((concern) => concern.role === role),
    [role],
  )
  const [selectedId, setSelectedId] = useState(scopedConcerns[0]?.id ?? '')
  const selectedConcern =
    scopedConcerns.find((concern) => concern.id === selectedId) ?? scopedConcerns[0] ?? null
  const [status, setStatus] = useState<StaffConcernStatus>(selectedConcern?.status ?? 'New')
  const [assignee, setAssignee] = useState(selectedConcern?.assignedTo ?? assigneeOptions[0])
  const [target, setTarget] = useState(selectedConcern?.target ?? transferTargets[0])
  const [resolution, setResolution] = useState('')
  const [photoLabel, setPhotoLabel] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const selectConcern = (concern: StaffConcern) => {
    setSelectedId(concern.id)
    setStatus(concern.status)
    setAssignee(concern.assignedTo)
    setTarget(concern.target)
    setResolution('')
    setPhotoLabel('')
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    window.setTimeout(() => setIsSaving(false), 900)
  }

  return (
    <StaffWorkspaceShell activeSection="concerns" config={config}>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-start">
        <section>
          <div>
            <p className="m-0 text-[12px] font-bold uppercase tracking-[0.08em] text-[#1b3a6b]">
              {config.unitName}
            </p>
            <h1 className="m-0 mt-1 text-[36px] font-bold leading-tight text-[#1b3a6b]">
              Concern Queue
            </h1>
            <p className="m-0 mt-2 max-w-[720px] text-[16px] font-light leading-snug text-[#434343]">
              Assign personnel, update status, attach resolution evidence, and transfer concerns
              only within the permitted scope.
            </p>
          </div>

          <section className="mt-8 grid gap-4" aria-label="Assigned concerns">
            {scopedConcerns.map((concern) => {
              const isSelected = concern.id === selectedConcern?.id

              return (
                <button
                  className={`rounded-[6px] border px-4 py-4 text-left shadow-[3px_3px_2.5px_1px_#1b3a6b] transition duration-200 hover:-translate-y-0.5 active:scale-[0.995] ${
                    isSelected
                      ? 'border-[#1b3a6b] bg-[#c1d9ff]'
                      : 'border-[#295498]/70 bg-white hover:bg-[#f8fbff]'
                  }`}
                  key={concern.id}
                  onClick={() => selectConcern(concern)}
                  type="button"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="m-0 text-[11px] font-semibold text-[#1b3a6b]">
                        {concern.id} · {concern.category} · {concern.location}
                      </p>
                      <h2 className="m-0 mt-2 text-[21px] font-semibold leading-tight">
                        {concern.title}
                      </h2>
                    </div>
                    <StaffStatusBadge status={concern.status} />
                  </div>
                  <p className="m-0 mt-2 text-[13px] font-light leading-snug text-[#434343]">
                    {concern.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold text-[#1b3a6b]">
                    <span className="rounded-full bg-[#edf4ff] px-3 py-1">
                      {concern.upCount} up
                    </span>
                    <span className="rounded-full bg-[#edf4ff] px-3 py-1">
                      Assigned: {concern.assignedTo}
                    </span>
                    <span className="rounded-full bg-[#edf4ff] px-3 py-1">
                      {concern.urgency}
                    </span>
                  </div>
                </button>
              )
            })}
          </section>
        </section>

        <aside className="rounded-[6px] border border-[#1b3a6b] bg-white px-5 py-5 shadow-[3px_3px_2.5px_1px_#1b3a6b] xl:sticky xl:top-8">
          <h2 className="m-0 text-[22px] font-semibold text-[#1b3a6b]">Update Concern</h2>
          {selectedConcern ? (
            <form className="mt-5" onSubmit={handleSubmit}>
              <p className="m-0 text-[11px] font-semibold text-[#1b3a6b]">
                {selectedConcern.id}
              </p>
              <h3 className="m-0 mt-1 text-[20px] font-semibold leading-tight">
                {selectedConcern.title}
              </h3>

              <label className="mt-5 grid gap-2 text-[12px] font-semibold text-[#1b3a6b]">
                Status
                <select
                  className="h-10 rounded-[5px] border border-[#7fa8de] bg-white px-3 text-[13px] outline-none focus:ring-2 focus:ring-[#9fbef1]"
                  onChange={(event) => setStatus(event.target.value as StaffConcernStatus)}
                  value={status}
                >
                  {concernStatusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="mt-4 grid gap-2 text-[12px] font-semibold text-[#1b3a6b]">
                Assigned Personnel
                <select
                  className="h-10 rounded-[5px] border border-[#7fa8de] bg-white px-3 text-[13px] outline-none focus:ring-2 focus:ring-[#9fbef1]"
                  onChange={(event) => setAssignee(event.target.value)}
                  value={assignee}
                >
                  {assigneeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="mt-4 grid gap-2 text-[12px] font-semibold text-[#1b3a6b]">
                Transfer Target
                <select
                  className="h-10 rounded-[5px] border border-[#7fa8de] bg-white px-3 text-[13px] outline-none focus:ring-2 focus:ring-[#9fbef1]"
                  onChange={(event) => setTarget(event.target.value)}
                  value={target}
                >
                  {transferTargets.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="mt-4 grid gap-2 text-[12px] font-semibold text-[#1b3a6b]">
                Resolution Report
                <textarea
                  className="min-h-[110px] resize-none rounded-[5px] border border-[#7fa8de] bg-white px-3 py-3 text-[13px] outline-none focus:ring-2 focus:ring-[#9fbef1]"
                  onChange={(event) => setResolution(event.target.value)}
                  placeholder="Summarize the action taken or next steps."
                  value={resolution}
                />
              </label>

              <label className="mt-4 grid cursor-pointer gap-2 text-[12px] font-semibold text-[#1b3a6b]">
                Resolution Photo
                <span className="inline-flex h-11 items-center justify-center gap-2 rounded-[5px] border border-dashed border-[#1b3a6b] bg-[#edf4ff] px-3 text-[13px] transition duration-200 hover:bg-[#c1d9ff]">
                  <ImagePlus aria-hidden="true" size={16} />
                  {photoLabel || 'Upload evidence photo'}
                </span>
                <input
                  className="sr-only"
                  onChange={(event) => setPhotoLabel(event.target.files?.[0]?.name ?? '')}
                  type="file"
                  accept="image/*"
                />
              </label>

              <div className="mt-5">
                <h4 className="m-0 text-[14px] font-semibold text-[#1b3a6b]">Timeline</h4>
                <div className="mt-3">
                  <StaffTimeline
                    items={[
                      ...selectedConcern.timeline,
                      `Assigned to ${assignee}`,
                      status === 'Transferred' ? `Transfer queued to ${target}` : `Status: ${status}`,
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
                  Save Update
                </button>
                <button
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-[5px] border border-[#1b3a6b] bg-white text-[13px] font-semibold text-[#1b3a6b] transition duration-200 hover:bg-[#edf4ff] active:scale-[0.98]"
                  type="button"
                >
                  <Shuffle aria-hidden="true" size={15} />
                  Transfer and Notify
                </button>
              </div>
            </form>
          ) : (
            <p className="m-0 mt-3 text-[13px] text-[#434343]">No concerns in this queue.</p>
          )}
        </aside>
      </div>
    </StaffWorkspaceShell>
  )
}
