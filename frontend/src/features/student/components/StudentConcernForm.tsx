import { ImagePlus, Send } from 'lucide-react'
import { type FormEvent, useEffect, useState } from 'react'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { getApiErrorMessage } from '@/lib/api'
import type { DirectoryRecord } from '@/lib/apiTypes'
import { directoryApi } from '@/services/caresApi'
import { useStudentData } from '../context/studentDataStore'
import { StudentWorkspaceShell } from './StudentWorkspaceShell'

export function StudentConcernForm() {
  const { addConcern } = useStudentData()
  const [targetType, setTargetType] = useState<'OFFICE' | 'DEPARTMENT'>('OFFICE')
  const [offices, setOffices] = useState<DirectoryRecord[]>([])
  const [departments, setDepartments] = useState<DirectoryRecord[]>([])
  const [targetId, setTargetId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'private'>('private')
  const [image, setImage] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    void Promise.all([
      directoryApi.offices({ page: 1, limit: 100 }),
      directoryApi.departments({ page: 1, limit: 100 }),
    ])
      .then(([officeResult, departmentResult]) => {
        setOffices(officeResult.data)
        setDepartments(departmentResult.data)
        setTargetId(officeResult.data[0]?.id ?? '')
      })
      .catch((loadError) => setError(getApiErrorMessage(loadError)))
  }, [])

  const changeTargetType = (next: 'OFFICE' | 'DEPARTMENT') => {
    setTargetType(next)
    setTargetId((next === 'OFFICE' ? offices : departments)[0]?.id ?? '')
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')
    try {
      await addConcern({
        title,
        description,
        visibility,
        targetType,
        targetOfficeId: targetType === 'OFFICE' ? targetId : null,
        targetDepartmentId: targetType === 'DEPARTMENT' ? targetId : null,
        image,
      })
      window.location.hash = '#student-concerns'
    } catch (submitError) {
      setError(getApiErrorMessage(submitError))
    } finally {
      setIsSubmitting(false)
    }
  }

  const targets = targetType === 'OFFICE' ? offices : departments

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
              value={targetId}
            >
              {targets.map((target) => (
                <option key={target.id} value={target.id}>
                  {target.name}
                </option>
              ))}
            </select>
          </label>
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
              onChange={(event) => setImage(event.target.files?.[0] ?? null)}
              type="file"
            />
          </label>
        </section>
        {error ? <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        <button
          className="inline-flex h-11 items-center justify-center gap-2 rounded-[5px] bg-[#1b3a6b] px-5 text-sm font-semibold text-white disabled:opacity-60"
          disabled={isSubmitting || !targetId}
          type="submit"
        >
          <Send size={16} />
          {isSubmitting ? 'Submitting...' : 'Submit Concern'}
        </button>
      </form>
    </StudentWorkspaceShell>
  )
}
