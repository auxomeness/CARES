import { ArrowLeft, CheckCircle2, Clock, FileText, Gauge, Mail, MapPin } from 'lucide-react'
import { LoadingLink } from '@/components/feedback/LoadingLink'
import { getDirectoryEntryFromHash } from '../studentDirectory.utils'
import { StudentWorkspaceShell } from './StudentWorkspaceShell'

function getActiveHash() {
  return window.location.hash
}

export function StudentDirectoryDetail() {
  const entry = getDirectoryEntryFromHash(getActiveHash())

  if (!entry) {
    return (
      <StudentWorkspaceShell activeSection="offices" contentClassName="max-w-[760px]">
        <div className="rounded-[5px] border border-[#295498]/70 bg-white px-5 py-8 text-center shadow-[3px_3px_2.5px_1px_#1b3a6b]">
          <h1 className="m-0 text-[26px] font-bold text-[#1b3a6b]">Directory Not Found</h1>
          <p className="m-0 mt-3 text-[14px] text-[#434343]">
            The selected directory record could not be found.
          </p>
          <LoadingLink
            className="relative mt-5 inline-flex h-10 items-center justify-center overflow-hidden rounded-[5px] border border-[#1b3a6b] bg-[#1b3a6b] px-5 text-[13px] font-semibold !text-white no-underline [&_*]:!text-white"
            href="#student-directories"
          >
            Back to Directories
          </LoadingLink>
        </div>
      </StudentWorkspaceShell>
    )
  }

  const Icon = entry.icon

  return (
    <StudentWorkspaceShell activeSection="offices" contentClassName="max-w-[930px]">
      <LoadingLink
        className="relative inline-flex h-9 items-center justify-center gap-2 overflow-hidden rounded-[5px] border border-[#1b3a6b] bg-white px-4 text-[12px] font-semibold text-[#1b3a6b] no-underline transition duration-200 hover:bg-[#edf4ff] active:scale-[0.98]"
        href="#student-directories"
      >
        <ArrowLeft aria-hidden="true" size={15} />
        Back to Directories
      </LoadingLink>

      <section className="mt-6 rounded-[5px] border border-[#295498]/70 bg-white px-5 py-5 shadow-[3px_3px_2.5px_1px_#1b3a6b]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <span className="grid size-16 shrink-0 place-items-center rounded-[5px] bg-[#f5d788] text-[#1b3a6b]">
            <Icon aria-hidden="true" size={32} strokeWidth={2.2} />
          </span>
          <div>
            <p className="m-0 text-[11px] font-bold uppercase tracking-[0.08em] text-[#707070]">
              {entry.kind}
            </p>
            <h1 className="m-0 mt-1 text-[32px] font-bold leading-tight text-[#1b3a6b]">
              {entry.name}
            </h1>
            <p className="m-0 mt-3 max-w-[660px] text-[15px] font-light leading-snug text-[#434343]">
              {entry.description}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            {
              label: 'Total Concerns',
              value: entry.concernsHandled,
              icon: FileText,
            },
            {
              label: 'Concerns Resolved',
              value: entry.concernsResolved,
              icon: CheckCircle2,
            },
            {
              label: 'Responsiveness',
              value: `${entry.responsiveness}%`,
              icon: Gauge,
            },
          ].map((stat) => {
            const StatIcon = stat.icon

            return (
              <div className="rounded-[5px] bg-[#edf4ff] px-4 py-4" key={stat.label}>
                <StatIcon aria-hidden="true" className="text-[#1b3a6b]" size={18} />
                <p className="m-0 mt-2 text-[26px] font-bold leading-none text-[#1b3a6b]">
                  {stat.value}
                </p>
                <p className="m-0 mt-2 text-[11px] font-medium text-[#707070]">
                  {stat.label}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section className="rounded-[5px] border border-[#295498]/70 bg-white px-5 py-5 shadow-[3px_3px_2.5px_1px_#1b3a6b]">
          <h2 className="m-0 text-[20px] font-semibold text-[#1b3a6b]">Main Concerns</h2>
          <div className="mt-4 grid gap-3">
            {entry.mainConcerns.map((concern) => (
              <div
                className="rounded-[5px] border border-[#7fa8de] bg-[#edf4ff] px-4 py-3 text-[13px] font-semibold text-[#1b3a6b]"
                key={concern}
              >
                {concern}
              </div>
            ))}
          </div>
        </section>

        <aside className="rounded-[5px] border border-[#295498]/70 bg-white px-5 py-5 shadow-[3px_3px_2.5px_1px_#1b3a6b]">
          <h2 className="m-0 text-[20px] font-semibold text-[#1b3a6b]">Contact Info</h2>
          <dl className="mt-5 grid gap-4 text-[13px]">
            <div className="grid gap-1">
              <dt className="inline-flex items-center gap-2 font-semibold text-[#1b3a6b]">
                <Mail aria-hidden="true" size={15} />
                Email
              </dt>
              <dd className="m-0 text-[#434343]">{entry.contact}</dd>
            </div>
            <div className="grid gap-1">
              <dt className="inline-flex items-center gap-2 font-semibold text-[#1b3a6b]">
                <MapPin aria-hidden="true" size={15} />
                Location
              </dt>
              <dd className="m-0 text-[#434343]">{entry.location}</dd>
            </div>
            <div className="grid gap-1">
              <dt className="inline-flex items-center gap-2 font-semibold text-[#1b3a6b]">
                <Clock aria-hidden="true" size={15} />
                Hours
              </dt>
              <dd className="m-0 text-[#434343]">{entry.hours}</dd>
            </div>
            {entry.relatedOffice ? (
              <div className="grid gap-1">
                <dt className="font-semibold text-[#1b3a6b]">Related Office</dt>
                <dd className="m-0 text-[#434343]">{entry.relatedOffice}</dd>
              </div>
            ) : null}
            {entry.facultyLead ? (
              <div className="grid gap-1">
                <dt className="font-semibold text-[#1b3a6b]">Faculty Lead</dt>
                <dd className="m-0 text-[#434343]">{entry.facultyLead}</dd>
              </div>
            ) : null}
          </dl>

          <LoadingLink
            className="relative mt-6 inline-flex h-10 w-full items-center justify-center overflow-hidden rounded-[5px] border border-[#1b3a6b] bg-[#1b3a6b] px-5 text-[13px] font-semibold !text-white no-underline transition duration-200 hover:bg-[#295498] active:scale-[0.98] [&_*]:!text-white"
            href="#student-concern-new"
          >
            Add Concern
          </LoadingLink>
        </aside>
      </div>
    </StudentWorkspaceShell>
  )
}
