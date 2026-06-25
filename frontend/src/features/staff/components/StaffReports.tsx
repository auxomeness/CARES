import { useQuery } from '@tanstack/react-query'
import { concernApi } from '@/services/caresApi'
import type { StaffRole } from '../staffData'
import { staffRoleConfigs } from '../staffData'
import { StaffWorkspaceShell } from './StaffWorkspaceShell'

export function StaffReports({ role }: { role: StaffRole }) {
  const config = staffRoleConfigs[role]
  const concerns = useQuery({ queryKey: ['concerns', 'reports'], queryFn: () => concernApi.list({ page: 1, limit: 100 }), enabled: role !== 'faculty' })
  const data = concerns.data?.data ?? []
  return (
    <StaffWorkspaceShell activeSection="reports" config={config}>
      <h1 className="text-4xl font-bold text-[#1b3a6b]">Resolution History</h1>
      <p className="mt-2 text-[#434343]">Live concern outcomes for your assigned scope. CARES does not yet persist separate aggregate report documents.</p>
      <section className="mt-8 grid gap-4">
        {data.map((concern) => (
          <article className="rounded border bg-white p-4 shadow-[3px_3px_2.5px_1px_#1b3a6b]" key={concern.id}>
            <div className="flex justify-between gap-3"><h2 className="font-semibold">{concern.title}</h2><span className="text-xs font-semibold">{concern.status}</span></div>
            <p className="mt-2 text-xs text-[#707070]">{concern.referenceNumber} · {new Date(concern.createdAt).toLocaleString()}</p>
            {concern.resolutionReport ? <p className="mt-3 text-sm">{concern.resolutionReport.summary}</p> : null}
          </article>
        ))}
        {!concerns.isLoading && data.length === 0 ? <p className="rounded border bg-white p-6 text-center text-sm">No concern history.</p> : null}
      </section>
    </StaffWorkspaceShell>
  )
}
