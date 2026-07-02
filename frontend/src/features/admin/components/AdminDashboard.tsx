import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { appointmentApi, concernApi, directoryApi } from '@/services/caresApi'
import { AdminShell } from './AdminShell'

export function AdminDashboard() {
  const concerns = useQuery({ queryKey: queryKeys.concerns.staff, queryFn: () => concernApi.list({ page: 1, limit: 100 }) })
  const appointments = useQuery({ queryKey: queryKeys.appointments.staff, queryFn: () => appointmentApi.list({ page: 1, limit: 100 }) })
  const offices = useQuery({ queryKey: queryKeys.directory.list('office'), queryFn: () => directoryApi.offices({ page: 1, limit: 100 }) })
  const departments = useQuery({ queryKey: queryKeys.directory.list('department'), queryFn: () => directoryApi.departments({ page: 1, limit: 100 }) })
  const metrics = [
    ['Concerns', concerns.data?.meta.total ?? 0],
    ['Appointments', appointments.data?.meta.total ?? 0],
    ['Offices', offices.data?.meta.total ?? 0],
    ['Departments', departments.data?.meta.total ?? 0],
  ]
  return (
    <AdminShell activeSection="dashboard">
      <h1 className="text-4xl font-bold text-[#1b3a6b]">Admin Dashboard</h1>
      <p className="mt-2 text-[#434343]">Live CARES system totals and operational state.</p>
      <section className="mt-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {metrics.map(([label, value]) => <article className="rounded border bg-white p-4 shadow-[3px_3px_2.5px_1px_#1b3a6b] transition duration-200 hover:-translate-y-0.5 hover:shadow-[4px_5px_4px_1px_#1b3a6b]" key={label}><p className="text-xs text-[#707070]">{label}</p><p className="mt-3 text-3xl font-bold text-[#1b3a6b]">{value}</p></article>)}
      </section>
      <section className="mt-8 rounded border bg-white p-5 shadow-[3px_3px_2.5px_1px_#1b3a6b]">
        <h2 className="text-xl font-semibold text-[#1b3a6b]">Concern Status</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {['SUBMITTED', 'IN_PROGRESS', 'RESOLVED'].map((status) => <article className="rounded bg-[#edf4ff] p-4 transition duration-200 hover:bg-[#dbe9ff]" key={status}><p className="text-xs">{status.replaceAll('_', ' ')}</p><p className="mt-2 text-2xl font-bold">{concerns.data?.data.filter((item) => item.status === status).length ?? 0}</p></article>)}
        </div>
      </section>
    </AdminShell>
  )
}
