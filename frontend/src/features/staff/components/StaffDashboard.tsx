import { useQuery } from '@tanstack/react-query'
import { appointmentApi, concernApi } from '@/services/caresApi'
import type { StaffRole } from '../staffData'
import { staffRoleConfigs } from '../staffData'
import { StaffWorkspaceShell } from './StaffWorkspaceShell'

export function StaffDashboard({ role }: { role: StaffRole }) {
  const config = staffRoleConfigs[role]
  const concerns = useQuery({ queryKey: ['concerns', 'dashboard'], queryFn: () => concernApi.list({ page: 1, limit: 100 }), enabled: role !== 'faculty' })
  const appointments = useQuery({ queryKey: ['appointments', 'dashboard'], queryFn: () => appointmentApi.list({ page: 1, limit: 100 }) })
  const concernData = concerns.data?.data ?? []
  const appointmentData = appointments.data?.data ?? []
  const metrics = role === 'faculty'
    ? [
        ['Requests', appointmentData.filter((item) => item.status === 'PENDING').length],
        ['Approved', appointmentData.filter((item) => item.status === 'APPROVED').length],
        ['Completed', appointmentData.filter((item) => item.status === 'COMPLETED').length],
        ['Total', appointmentData.length],
      ]
    : [
        ['Submitted', concernData.filter((item) => item.status === 'SUBMITTED').length],
        ['In Progress', concernData.filter((item) => item.status === 'IN_PROGRESS').length],
        ['Awaiting Confirmation', concernData.filter((item) => item.status === 'AWAITING_CONFIRMATION').length],
        ['Resolved', concernData.filter((item) => item.status === 'RESOLVED').length],
      ]

  return (
    <StaffWorkspaceShell activeSection="dashboard" config={config}>
      <h1 className="text-4xl font-bold text-[#1b3a6b]">{config.title}</h1>
      <p className="mt-2 text-[#434343]">{config.subtitle}</p>
      <section className="mt-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {metrics.map(([label, value]) => (
          <article className="rounded border bg-white p-4 shadow-[3px_3px_2.5px_1px_#1b3a6b] transition duration-200 hover:-translate-y-0.5 hover:shadow-[4px_5px_4px_1px_#1b3a6b]" key={label}>
            <p className="text-xs text-[#707070]">{label}</p><p className="mt-3 text-3xl font-bold text-[#1b3a6b]">{value}</p>
          </article>
        ))}
      </section>
      <section className="mt-8 rounded border bg-white p-5 shadow-[3px_3px_2.5px_1px_#1b3a6b]">
        <h2 className="text-xl font-semibold text-[#1b3a6b]">Recent Activity</h2>
        <div className="mt-4 grid gap-3">
          {(role === 'faculty' ? appointmentData : concernData).slice(0, 8).map((item) => (
            <article className="rounded bg-[#edf4ff] p-3 transition duration-200 hover:bg-[#dbe9ff]" key={item.id}>
              <strong className="text-sm">{'title' in item ? item.title : ''}</strong>
              <p className="mt-1 text-xs text-[#434343]">{item.status.replaceAll('_', ' ')}</p>
            </article>
          ))}
        </div>
      </section>
    </StaffWorkspaceShell>
  )
}
