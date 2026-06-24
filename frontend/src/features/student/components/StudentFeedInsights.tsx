import { Building2, TrendingUp } from 'lucide-react'
import { officeOptions } from '../studentData.config'
import type { StudentConcern } from '../studentData.types'

type StudentFeedInsightsProps = {
  concerns: StudentConcern[]
}

export function StudentFeedInsights({ concerns }: StudentFeedInsightsProps) {
  const categoryCounts = concerns.reduce<Record<string, number>>((counts, concern) => {
    counts[concern.category] = (counts[concern.category] ?? 0) + 1
    return counts
  }, {})

  const commonIssues = Object.entries(categoryCounts)
    .sort(([, left], [, right]) => right - left)
    .slice(0, 4)

  return (
    <aside className="hidden w-[280px] shrink-0 pt-[112px] xl:block">
      <section className="rounded-[15px] border border-[#1b3a6b] bg-[#c1d9ff] px-4 py-4 shadow-[0_4px_4px_0_#1b3a6b] transition duration-200 hover:-translate-y-0.5">
        <div className="flex items-center gap-2">
          <TrendingUp aria-hidden="true" size={18} strokeWidth={2.2} />
          <h2 className="m-0 text-[17px] font-semibold leading-none">Common Issues</h2>
        </div>
        <div className="mt-4 grid gap-3">
          {commonIssues.map(([category, count]) => (
            <div
              className="flex items-center justify-between rounded-md bg-white/55 px-3 py-2 text-[13px] font-medium text-[#1b3a6b]"
              key={category}
            >
              <span>{category}</span>
              <span>{count}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-[15px] border border-[#1b3a6b] bg-[#c1d9ff] px-4 py-4 shadow-[0_4px_4px_0_#1b3a6b] transition duration-200 hover:-translate-y-0.5">
        <div className="flex items-center gap-2">
          <Building2 aria-hidden="true" size={18} strokeWidth={2.2} />
          <h2 className="m-0 text-[17px] font-semibold leading-none">Offices Available</h2>
        </div>
        <div className="mt-4 grid gap-3">
          {officeOptions.slice(0, 4).map((office) => (
            <p
              className="m-0 rounded-md bg-white/55 px-3 py-2 text-[12px] font-medium leading-snug text-[#1b3a6b]"
              key={office}
            >
              {office}
            </p>
          ))}
        </div>
      </section>
    </aside>
  )
}
