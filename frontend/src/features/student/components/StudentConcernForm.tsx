import { ImagePlus, Lock, Save, Send, XCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { type FormEvent, useState } from 'react'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { getApiErrorMessage } from '@/lib/api'
import { directoryApi } from '@/services/caresApi'
import { useStudentData } from '../context/studentDataStore'
import { StudentWorkspaceShell } from './StudentWorkspaceShell'

export function StudentConcernForm() {
  const { addConcern } = useStudentData()
  const [targetType, setTargetType] = useState<'OFFICE' | 'DEPARTMENT'>('OFFICE')
  const [targetId, setTargetId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'private'>('private')
  const [image, setImage] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const officesQuery = useQuery({
    queryKey: ['directory', 'office', 'form'],
    queryFn: () => directoryApi.offices({ page: 1, limit: 100 }),
    staleTime: 10 * 60_000,
  })
  const departmentsQuery = useQuery({
    queryKey: ['directory', 'department', 'form'],
    queryFn: () => directoryApi.departments({ page: 1, limit: 100 }),
    staleTime: 10 * 60_000,
  })
  const offices = officesQuery.data?.data ?? []
  const departments = departmentsQuery.data?.data ?? []
  const targets = targetType === 'OFFICE' ? offices : departments
  const selectedTargetId = targets.some((target) => target.id === targetId)
    ? targetId
    : targets[0]?.id ?? ''

  const changeTargetType = (next: 'OFFICE' | 'DEPARTMENT') => {
    setTargetType(next)
    setTargetId('')
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')
    setUploadProgress(0)
    try {
      await addConcern({
        title,
        description,
        visibility,
        targetType,
        targetOfficeId: targetType === 'OFFICE' ? selectedTargetId : null,
        targetDepartmentId: targetType === 'DEPARTMENT' ? selectedTargetId : null,
        image,
        onUploadProgress: setUploadProgress,
      })
      window.location.hash = '#student-concerns'
    } catch (submitError) {
      setError(getApiErrorMessage(submitError))
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLoadingTargets = officesQuery.isLoading || departmentsQuery.isLoading

  return (
    <StudentWorkspaceShell activeSection="concerns" contentClassName="max-w-none">
      <DashboardHeader
        title="Submit a Concern"
        subtitle="Share the issue details and choose whether it belongs on the public feed."
      />
      <form className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px] xl:items-start" onSubmit={submit}>
        <div className="grid gap-5">
          <section className="grid gap-4 rounded-[5px] border border-[#295498]/70 bg-white px-5 py-5 shadow-[3px_3px_2.5px_1px_#1b3a6b]">
            <h2 className="m-0 text-[16px] font-semibold text-[#1b3a6b]">Concern Details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-xs font-semibold text-[#1b3a6b]">
                Target Type
                <select
                  className="h-11 rounded-[5px] border border-[#7fa8de] bg-white px-3"
                  onChange={(event) => changeTargetType(event.target.value as 'OFFICE' | 'DEPARTMENT')}
                  value={targetType}
                >
                  <option value="OFFICE">Office</option>
                  <option value="DEPARTMENT">Department</option>
                </select>
              </label>
              <label className="grid gap-2 text-xs font-semibold text-[#1b3a6b]">
                Target
                <select
                  className="h-11 rounded-[5px] border border-[#7fa8de] bg-white px-3"
                  disabled={isLoadingTargets}
                  onChange={(event) => setTargetId(event.target.value)}
                  required
                  value={selectedTargetId}
                >
                  {isLoadingTargets ? <option value="">Loading targets...</option> : null}
                  {targets.map((target) => (
                    <option key={target.id} value={target.id}>
                      {target.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="grid gap-2 text-xs font-semibold text-[#1b3a6b]">
              Title
              <input
                className="h-11 rounded-[5px] border border-[#7fa8de] px-3"
                maxLength={200}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Briefly describe the concern"
                required
                value={title}
              />
            </label>
            <label className="grid gap-2 text-xs font-semibold text-[#1b3a6b]">
              Description
              <textarea
                className="min-h-36 rounded-[5px] border border-[#7fa8de] px-3 py-3"
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Add context, time, people affected, and other helpful details"
                required
                value={description}
              />
            </label>
          </section>

          <section className="grid gap-4 rounded-[5px] border border-[#295498]/70 bg-white px-5 py-5 shadow-[3px_3px_2.5px_1px_#1b3a6b]">
            <h2 className="m-0 text-[16px] font-semibold text-[#1b3a6b]">Proof and Visibility</h2>
            <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-[5px] border border-dashed border-[#7fa8de] bg-[#edf4ff] text-sm text-[#1b3a6b]">
              <ImagePlus size={20} />
              <span className="mt-2">{image?.name ?? 'Attach photo or proof'}</span>
              <input
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                onChange={(event) => setImage(event.target.files?.[0] ?? null)}
                type="file"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              {(['public', 'private'] as const).map((option) => (
                <button
                  className={`min-h-[62px] rounded-[5px] border px-4 text-left transition duration-200 ${
                    visibility === option
                      ? 'border-[#1b3a6b] bg-[#c1d9ff] text-[#1b3a6b]'
                      : 'border-[#7fa8de] bg-white text-[#434343]'
                  }`}
                  key={option}
                  onClick={() => setVisibility(option)}
                  type="button"
                >
                  <span className="inline-flex items-center gap-2 text-[13px] font-semibold capitalize">
                    {option === 'private' ? <Lock aria-hidden="true" size={15} /> : null}
                    {option === 'public' ? 'Public Feed' : 'Private to Office'}
                  </span>
                  <span className="mt-1 block text-[11px] leading-snug">
                    {option === 'public'
                      ? 'Visible to students and can receive up reactions.'
                      : 'Only routed to the assigned office or department.'}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {error ? <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[5px] border border-[#1b3a6b] bg-white px-5 text-sm font-semibold text-[#1b3a6b]"
              type="button"
            >
              <Save size={16} />
              Save Draft
            </button>
            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[5px] border border-[#1b3a6b] bg-white px-5 text-sm font-semibold text-[#1b3a6b]"
              onClick={() => {
                window.location.hash = '#student-concerns'
              }}
              type="button"
            >
              <XCircle size={16} />
              Cancel
            </button>
            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[5px] bg-[#1b3a6b] px-5 text-sm font-semibold !text-white disabled:opacity-60"
              disabled={isSubmitting || !selectedTargetId}
              type="submit"
            >
              <Send size={16} />
              {isSubmitting ? 'Submitting...' : 'Submit Concern'}
            </button>
          </div>
          {isSubmitting && image ? (
            <div className="h-2 overflow-hidden rounded-full bg-[#d9d9d9]" aria-label="Upload progress">
              <span
                className="block h-full rounded-full bg-[#1b3a6b] transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          ) : null}
        </div>

        <aside className="rounded-[5px] border border-[#1b3a6b] bg-[#f5d788] p-5 shadow-[3px_3px_2.5px_1px_#1b3a6b] xl:sticky xl:top-8">
          <h2 className="m-0 text-[17px] font-semibold text-[#1b3a6b]">Concern Summary</h2>
          <dl className="mt-4 grid gap-3 text-[12px]">
            <div className="rounded-[5px] bg-white/65 px-3 py-2">
              <dt className="font-semibold text-[#1b3a6b]">Type</dt>
              <dd className="m-0">{targetType === 'OFFICE' ? 'Office' : 'Department'}</dd>
            </div>
            <div className="rounded-[5px] bg-white/65 px-3 py-2">
              <dt className="font-semibold text-[#1b3a6b]">Target</dt>
              <dd className="m-0">
                {targets.find((target) => target.id === selectedTargetId)?.name ?? 'Not selected'}
              </dd>
            </div>
            <div className="rounded-[5px] bg-white/65 px-3 py-2">
              <dt className="font-semibold text-[#1b3a6b]">Title</dt>
              <dd className="m-0">{title || 'Untitled concern'}</dd>
            </div>
            <div className="rounded-[5px] bg-white/65 px-3 py-2">
              <dt className="font-semibold text-[#1b3a6b]">Visibility</dt>
              <dd className="m-0 capitalize">{visibility}</dd>
            </div>
            <div className="rounded-[5px] bg-white/65 px-3 py-2">
              <dt className="font-semibold text-[#1b3a6b]">Attachment</dt>
              <dd className="m-0">{image?.name ?? 'No file attached'}</dd>
            </div>
          </dl>
        </aside>
      </form>
    </StudentWorkspaceShell>
  )
}
