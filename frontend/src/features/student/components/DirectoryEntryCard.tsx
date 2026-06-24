import { ArrowRight, CheckCircle2, FileText, Gauge } from 'lucide-react'
import { LoadingLink } from '@/components/feedback/LoadingLink'
import type { DirectoryEntry } from '../studentDirectory.types'
import { getDirectoryHash } from '../studentDirectory.utils'

type DirectoryEntryCardProps = {
  entry: DirectoryEntry
}

export function DirectoryEntryCard({ entry }: DirectoryEntryCardProps) {
  const Icon = entry.icon

  return (
    <article className="rounded-[5px] border border-[#295498]/70 bg-white px-4 py-4 shadow-[3px_3px_2.5px_1px_#1b3a6b] transition duration-200 hover:-translate-y-0.5 hover:shadow-[4px_5px_4px_1px_#1b3a6b] active:scale-[0.995]">
      <div className="flex items-start gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-[5px] bg-[#f5d788] text-[#1b3a6b]">
          <Icon aria-hidden="true" size={24} strokeWidth={2.2} />
        </span>

        <div className="min-w-0">
          <p className="m-0 text-[10px] font-bold uppercase tracking-[0.08em] text-[#707070]">
            {entry.kind}
          </p>
          <h2 className="m-0 mt-1 text-[20px] font-semibold leading-tight text-[#101010]">
            {entry.name}
          </h2>
          <p className="m-0 mt-2 text-[12px] font-light leading-snug text-[#434343]">
            {entry.description}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <div className="rounded-[5px] bg-[#edf4ff] px-2 py-2">
          <FileText aria-hidden="true" className="text-[#1b3a6b]" size={14} />
          <p className="m-0 mt-1 text-[18px] font-bold leading-none text-[#1b3a6b]">
            {entry.concernsHandled}
          </p>
          <p className="m-0 mt-1 text-[9px] font-medium leading-tight text-[#707070]">
            Total Concerns
          </p>
        </div>
        <div className="rounded-[5px] bg-[#edf4ff] px-2 py-2">
          <CheckCircle2 aria-hidden="true" className="text-[#1b3a6b]" size={14} />
          <p className="m-0 mt-1 text-[18px] font-bold leading-none text-[#1b3a6b]">
            {entry.concernsResolved}
          </p>
          <p className="m-0 mt-1 text-[9px] font-medium leading-tight text-[#707070]">
            Resolved
          </p>
        </div>
        <div className="rounded-[5px] bg-[#edf4ff] px-2 py-2">
          <Gauge aria-hidden="true" className="text-[#1b3a6b]" size={14} />
          <p className="m-0 mt-1 text-[18px] font-bold leading-none text-[#1b3a6b]">
            {entry.responsiveness}%
          </p>
          <p className="m-0 mt-1 text-[9px] font-medium leading-tight text-[#707070]">
            Responsive
          </p>
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <LoadingLink
          className="relative inline-flex h-9 items-center justify-center overflow-hidden rounded-[5px] border border-[#1b3a6b] bg-[#1b3a6b] px-4 text-[12px] font-semibold !text-white no-underline transition duration-200 hover:bg-[#295498] active:scale-[0.98] [&_*]:!text-white"
          href={getDirectoryHash(entry)}
        >
          View Details
          <ArrowRight aria-hidden="true" size={14} />
        </LoadingLink>
      </div>
    </article>
  )
}
