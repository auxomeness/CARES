import { ImagePlus, Send } from 'lucide-react'
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
    <StudentWorkspaceShell activeSection="concerns" contentClassName="max-w-[760px]">
      <DashboardHeader
        title="Submit a Concern"
        subtitle="Choose the exact office or department that should receive your concern."
      />
      <form className="mt-8 grid gap-5" onSubmit={submit}>
        <section className="grid gap-4 rounded-[5px] border border-[#295498]/70 bg-white px-5 py-5 shadow-[3px_3px_2.5px_1px_#1b3a6b]">
          <div className="grid grid-cols-2 gap-3">
            {(['OFFICE', 'DEPARTMENT'] as const).map((type) => (
              <button
                className={`h-11 rounded-[5px] border text-sm font-semibold ${
                  targetType === type
                    ? 'border-[#1b3a6b] bg-[#1b3a6b] text-white'
                    : 'border-[#7fa8de] bg-white text-[#1b3a6b]'
                }`}
                key={type}
                onClick={() => changeTargetType(type)}
                type="button"
              >
                {type === 'OFFICE' ? 'Office' : 'Department'}
              </button>
            ))}
          </div>
          <label className="grid gap-2 text-xs font-semibold text-[#1b3a6b]">
            Target
            <select
              className="h-11 rounded-[5px] border border-[#7fa8de] bg-white px-3"
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
          {officesQuery.isError || departmentsQuery.isError ? (
            <p className="text-xs text-red-700">Unable to load concern targets.</p>
          ) : null}
          <label className="grid gap-2 text-xs font-semibold text-[#1b3a6b]">
            Title
            <input
              className="h-11 rounded-[5px] border border-[#7fa8de] px-3"
              maxLength={200}
              onChange={(event) => setTitle(event.target.value)}
              required
              value={title}
            />
          </label>
          <label className="grid gap-2 text-xs font-semibold text-[#1b3a6b]">
            Description
            <textarea
              className="min-h-36 rounded-[5px] border border-[#7fa8de] px-3 py-3"
              onChange={(event) => setDescription(event.target.value)}
              required
              value={description}
            />
          </label>
          <label className="grid gap-2 text-xs font-semibold text-[#1b3a6b]">
            Visibility
            <select
              className="h-11 rounded-[5px] border border-[#7fa8de] bg-white px-3"
              onChange={(event) => setVisibility(event.target.value as 'public' | 'private')}
              value={visibility}
            >
              <option value="private">Private</option>
              <option value="public">Public feed</option>
            </select>
          </label>
          <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-[5px] border border-dashed border-[#7fa8de] bg-[#edf4ff] text-sm text-[#1b3a6b]">
            <ImagePlus size={20} />
            <span className="mt-2">{image?.name ?? 'Optional image attachment'}</span>
            <input
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={(event) => {
                setImage(event.target.files?.[0] ?? null)
                setUploadProgress(0)
              }}
              type="file"
            />
          </label>
          {isSubmitting && image && uploadProgress > 0 ? (
            <div className="h-2 overflow-hidden rounded-full bg-[#dbe8fb]">
              <div
                className="h-full bg-[#1b3a6b] transition-[width]"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          ) : null}
        </section>
        {error ? <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        <button
          className="inline-flex h-11 items-center justify-center gap-2 rounded-[5px] bg-[#1b3a6b] px-5 text-sm font-semibold text-white disabled:opacity-60"
          disabled={isSubmitting || !selectedTargetId}
          type="submit"
        >
          <Send size={16} />
          {isSubmitting ? 'Submitting...' : 'Submit Concern'}
        </button>
      </form>
    </StudentWorkspaceShell>
  )
}
