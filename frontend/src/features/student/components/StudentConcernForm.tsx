import { Globe2, ImagePlus, Lock, Save, Send } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { LoadingLink } from '@/components/feedback/LoadingLink'
import {
  campusLocations,
  concernCategories,
} from '../studentData.config'
import { useStudentData } from '../context/studentDataStore'
import type { ConcernCategory, ConcernInput, ConcernVisibility } from '../studentData.types'
import { StudentFeedInsights } from './StudentFeedInsights'
import { StudentWorkspaceShell } from './StudentWorkspaceShell'

const initialForm: ConcernInput = {
  title: '',
  description: '',
  category: 'Facilities',
  location: 'College Building',
  visibility: 'public',
  anonymous: false,
}

export function StudentConcernForm() {
  const { addConcern, concerns } = useStudentData()
  const [form, setForm] = useState(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [draftSaved, setDraftSaved] = useState(false)

  const updateForm = (patch: Partial<ConcernInput>) => {
    setDraftSaved(false)
    setForm((currentForm) => ({ ...currentForm, ...patch }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    window.setTimeout(() => {
      addConcern(form)
      setIsSubmitting(false)
      window.location.hash = form.visibility === 'public' ? '#student-feed' : '#student-concerns'
    }, 500)
  }

  return (
    <StudentWorkspaceShell
      activeSection="concerns"
      contentClassName="max-w-[632px]"
      rightRail={
        <StudentFeedInsights concerns={concerns.filter((concern) => concern.visibility === 'public')} />
      }
    >
      <DashboardHeader
        title="Submit a Concern"
        subtitle="Share the issue details and choose whether it belongs on the public feed."
      />

      <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
        <section className="rounded-[5px] border border-[#295498]/70 bg-white px-4 py-5 shadow-[3px_3px_2.5px_1px_#1b3a6b]">
          <h2 className="m-0 text-[18px] font-semibold text-[#1b3a6b]">Concern Details</h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-[12px] font-semibold text-[#1b3a6b]">
              Category
              <select
                className="h-11 rounded-[5px] border border-[#7fa8de] bg-white px-3 text-[13px] text-[#101010] outline-none focus:ring-2 focus:ring-[#9fbef1]"
                onChange={(event) =>
                  updateForm({ category: event.target.value as ConcernCategory })
                }
                value={form.category}
              >
                {concernCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-[12px] font-semibold text-[#1b3a6b]">
              Location
              <select
                className="h-11 rounded-[5px] border border-[#7fa8de] bg-white px-3 text-[13px] text-[#101010] outline-none focus:ring-2 focus:ring-[#9fbef1]"
                onChange={(event) => updateForm({ location: event.target.value })}
                value={form.location}
              >
                {campusLocations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="mt-4 grid gap-2 text-[12px] font-semibold text-[#1b3a6b]">
            Title
            <input
              className="h-11 rounded-[5px] border border-[#7fa8de] bg-white px-3 text-[13px] text-[#101010] outline-none focus:ring-2 focus:ring-[#9fbef1]"
              onChange={(event) => updateForm({ title: event.target.value })}
              placeholder="Briefly describe the concern"
              required
              value={form.title}
            />
          </label>

          <label className="mt-4 grid gap-2 text-[12px] font-semibold text-[#1b3a6b]">
            Description
            <textarea
              className="min-h-[140px] resize-none rounded-[5px] border border-[#7fa8de] bg-white px-3 py-3 text-[13px] text-[#101010] outline-none focus:ring-2 focus:ring-[#9fbef1]"
              onChange={(event) => updateForm({ description: event.target.value })}
              placeholder="Add context, time, people affected, and other helpful details"
              required
              value={form.description}
            />
          </label>
        </section>

        <section className="rounded-[5px] border border-[#295498]/70 bg-white px-4 py-5 shadow-[3px_3px_2.5px_1px_#1b3a6b]">
          <h2 className="m-0 text-[18px] font-semibold text-[#1b3a6b]">Proof and Visibility</h2>

          <label className="mt-5 flex min-h-[94px] cursor-pointer flex-col items-center justify-center rounded-[5px] border border-dashed border-[#7fa8de] bg-[#edf4ff] px-4 text-center text-[12px] font-medium text-[#1b3a6b] transition duration-200 hover:bg-[#e3efff] active:scale-[0.99]">
            <ImagePlus aria-hidden="true" size={22} />
            <span className="mt-2">Attach photo or proof</span>
            <input className="sr-only" type="file" />
          </label>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              {
                value: 'public',
                label: 'Public Feed',
                description: 'Visible to students and can receive up reactions.',
                icon: Globe2,
              },
              {
                value: 'private',
                label: 'Private to Office',
                description: 'Only routed to the assigned office later.',
                icon: Lock,
              },
            ].map((option) => {
              const Icon = option.icon
              const isActive = form.visibility === option.value

              return (
                <button
                  className={`rounded-[5px] border px-4 py-3 text-left transition duration-200 active:scale-[0.98] ${
                    isActive
                      ? 'border-[#1b3a6b] bg-[#c1d9ff] text-[#1b3a6b]'
                      : 'border-[#7fa8de] bg-white text-[#434343] hover:bg-[#edf4ff]'
                  }`}
                  key={option.value}
                  onClick={() =>
                    updateForm({ visibility: option.value as ConcernVisibility })
                  }
                  type="button"
                >
                  <span className="flex items-center gap-2 text-[14px] font-semibold">
                    <Icon aria-hidden="true" size={17} />
                    {option.label}
                  </span>
                  <span className="mt-2 block text-[11px] leading-snug">
                    {option.description}
                  </span>
                </button>
              )
            })}
          </div>

          <label className="mt-5 flex items-center gap-3 text-[13px] font-medium text-[#1b3a6b]">
            <input
              checked={form.anonymous}
              className="size-4 accent-[#1b3a6b]"
              onChange={(event) => updateForm({ anonymous: event.target.checked })}
              type="checkbox"
            />
            Submit anonymously
          </label>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[5px] border border-[#1b3a6b] bg-white px-5 text-[13px] font-semibold text-[#1b3a6b] transition duration-200 hover:bg-[#edf4ff] active:scale-[0.98]"
            onClick={() => setDraftSaved(true)}
            type="button"
          >
            <Save aria-hidden="true" size={16} />
            {draftSaved ? 'Draft Saved' : 'Save Draft'}
          </button>

          <LoadingLink
            className="relative inline-flex h-10 items-center justify-center overflow-hidden rounded-[5px] border border-[#1b3a6b] bg-white px-5 text-[13px] font-semibold text-[#1b3a6b] no-underline transition duration-200 hover:bg-[#edf4ff] active:scale-[0.98]"
            href="#student-concerns"
          >
            Cancel
          </LoadingLink>

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
            Submit Concern
          </button>
        </div>
      </form>
    </StudentWorkspaceShell>
  )
}
