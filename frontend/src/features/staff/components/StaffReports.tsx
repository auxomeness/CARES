import { ClipboardCheck, FileText, Send } from 'lucide-react'
import { type FormEvent, useMemo, useState } from 'react'
import type { StaffRole } from '../staffData'
import { staffConcerns, staffReports, staffRoleConfigs } from '../staffData'
import { StaffStatCard } from './StaffShared'
import { StaffWorkspaceShell } from './StaffWorkspaceShell'

type StaffReportsProps = {
  role: StaffRole
}

export function StaffReports({ role }: StaffReportsProps) {
  const config = staffRoleConfigs[role]
  const scopedConcerns = useMemo(
    () => staffConcerns.filter((concern) => concern.role === role),
    [role],
  )
  const scopedReports = staffReports.filter((report) => report.scope === config.unitName)
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    window.setTimeout(() => {
      setIsSubmitting(false)
      setTitle('')
      setSummary('')
    }, 900)
  }

  return (
    <StaffWorkspaceShell activeSection="reports" config={config}>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px] xl:items-start">
        <section>
          <div>
            <p className="m-0 text-[12px] font-bold uppercase tracking-[0.08em] text-[#1b3a6b]">
              {config.unitName}
            </p>
            <h1 className="m-0 mt-1 text-[36px] font-bold leading-tight text-[#1b3a6b]">
              Resolution Reports
            </h1>
            <p className="m-0 mt-2 max-w-[720px] text-[16px] font-light leading-snug text-[#434343]">
              Review history logs and prepare transparency reports for admin review. Download
              export actions are intentionally left for later backend integration.
            </p>
          </div>

          <section className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
            <StaffStatCard
              icon={<FileText aria-hidden="true" size={18} />}
              label="Total Concerns"
              value={scopedConcerns.length}
            />
            <StaffStatCard
              icon={<ClipboardCheck aria-hidden="true" size={18} />}
              label="Resolved"
              value={scopedConcerns.filter((concern) => concern.status === 'Resolved').length}
            />
            <StaffStatCard
              icon={<Send aria-hidden="true" size={18} />}
              label="Reports"
              value={scopedReports.length}
            />
          </section>

          <section className="mt-8 rounded-[6px] border border-[#295498]/70 bg-white px-5 py-5 shadow-[3px_3px_2.5px_1px_#1b3a6b]">
            <h2 className="m-0 text-[22px] font-semibold text-[#1b3a6b]">History Log</h2>
            <div className="mt-5 grid gap-3">
              {scopedConcerns.map((concern) => (
                <article
                  className="rounded-[5px] border border-[#7fa8de] bg-[#edf4ff] px-4 py-3"
                  key={concern.id}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="m-0 text-[11px] font-semibold text-[#1b3a6b]">
                        {concern.id} · {concern.submittedAt}
                      </p>
                      <h3 className="m-0 mt-1 text-[16px] font-semibold leading-tight">
                        {concern.title}
                      </h3>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[#1b3a6b]">
                      {concern.status}
                    </span>
                  </div>
                  <p className="m-0 mt-2 text-[12px] leading-snug text-[#434343]">
                    Assigned to {concern.assignedTo}. {concern.timeline.at(-1)}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </section>

        <aside className="rounded-[6px] border border-[#1b3a6b] bg-white px-5 py-5 shadow-[3px_3px_2.5px_1px_#1b3a6b] xl:sticky xl:top-8">
          <h2 className="m-0 text-[22px] font-semibold text-[#1b3a6b]">Submit Report</h2>
          <form className="mt-5" onSubmit={handleSubmit}>
            <label className="grid gap-2 text-[12px] font-semibold text-[#1b3a6b]">
              Report Title
              <input
                className="h-10 rounded-[5px] border border-[#7fa8de] bg-white px-3 text-[13px] outline-none focus:ring-2 focus:ring-[#9fbef1]"
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Weekly resolution summary"
                required
                value={title}
              />
            </label>

            <label className="mt-4 grid gap-2 text-[12px] font-semibold text-[#1b3a6b]">
              Summary
              <textarea
                className="min-h-[160px] resize-none rounded-[5px] border border-[#7fa8de] bg-white px-3 py-3 text-[13px] outline-none focus:ring-2 focus:ring-[#9fbef1]"
                onChange={(event) => setSummary(event.target.value)}
                placeholder="Summarize completed actions, pending items, and concerns needing admin attention."
                required
                value={summary}
              />
            </label>

            <button
              className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-[5px] border border-[#1b3a6b] bg-[#1b3a6b] text-[13px] font-semibold !text-white transition duration-200 hover:bg-[#295498] active:scale-[0.98]"
              type="submit"
            >
              {isSubmitting ? (
                <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Send aria-hidden="true" size={15} />
              )}
              Submit to Admin
            </button>
          </form>

          <section className="mt-6">
            <h3 className="m-0 text-[16px] font-semibold text-[#1b3a6b]">Past Reports</h3>
            <div className="mt-3 grid gap-3">
              {(scopedReports.length ? scopedReports : staffReports.slice(0, 2)).map((report) => (
                <article className="rounded-[5px] bg-[#edf4ff] px-3 py-3" key={report.id}>
                  <p className="m-0 text-[11px] font-semibold text-[#1b3a6b]">{report.id}</p>
                  <p className="m-0 mt-1 text-[13px] font-semibold leading-snug">
                    {report.title}
                  </p>
                  <p className="m-0 mt-2 text-[11px] text-[#707070]">
                    {report.submittedAt} · {report.status}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </StaffWorkspaceShell>
  )
}
