import { Activity, AlertCircle, CheckCircle2 } from 'lucide-react'
import { adminAnalytics } from '../adminData'
import { AdminShell } from './AdminShell'

export function AdminDashboard() {
  return (
    <AdminShell activeSection="dashboard">
      <div>
        <p className="m-0 text-[12px] font-bold uppercase tracking-[0.08em] text-[#1b3a6b]">
          System Overview
        </p>
        <h1 className="m-0 mt-1 text-[38px] font-bold leading-tight text-[#1b3a6b] sm:text-[46px]">
          Admin Dashboard
        </h1>
        <p className="m-0 mt-2 max-w-[760px] text-[16px] font-light leading-snug text-[#434343]">
          Monitor concern trends, appointment volume, routing coverage, and directory readiness
          across CARES.
        </p>
      </div>

      <section className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {adminAnalytics.map((metric) => {
          const Icon = metric.icon
          return (
            <article
              className="rounded-[6px] border border-[#295498]/70 bg-white px-4 py-4 shadow-[3px_3px_2.5px_1px_#1b3a6b] transition duration-200 hover:-translate-y-0.5"
              key={metric.label}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="m-0 text-[12px] font-medium leading-tight text-[#707070]">
                  {metric.label}
                </p>
                <span className="grid size-8 place-items-center rounded-[5px] bg-[#edf4ff] text-[#1b3a6b]">
                  <Icon aria-hidden="true" size={18} />
                </span>
              </div>
              <p className="m-0 mt-3 text-[28px] font-bold leading-none text-[#1b3a6b]">
                {metric.value}
              </p>
              <p className="m-0 mt-2 text-[11px] font-semibold leading-tight text-[#434343]">
                {metric.detail}
              </p>
            </article>
          )
        })}
      </section>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="rounded-[6px] border border-[#295498]/70 bg-white px-5 py-5 shadow-[3px_3px_2.5px_1px_#1b3a6b]">
          <h2 className="m-0 text-[22px] font-semibold text-[#1b3a6b]">System Analytics</h2>
          <div className="mt-5 grid gap-4">
            {[
              ['Concern Routing Accuracy', 92],
              ['Average Response Progress', 74],
              ['Appointment Approval Flow', 81],
              ['Directory Setup Completion', 68],
            ].map(([label, value]) => (
              <div key={label}>
                <div className="flex items-center justify-between text-[12px] font-semibold text-[#1b3a6b]">
                  <span>{label}</span>
                  <span>{value}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#d9d9d9]">
                  <span
                    className="block h-full rounded-full bg-[#1b3a6b]"
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="rounded-[12px] border border-[#1b3a6b] bg-[#c1d9ff] px-5 py-5 shadow-[0_4px_4px_0_#1b3a6b]">
          <h2 className="m-0 text-[22px] font-semibold">Operational Alerts</h2>
          <div className="mt-4 grid gap-3">
            {[
              { icon: AlertCircle, text: 'Facilities Management needs account setup.' },
              { icon: Activity, text: 'Safety concerns rose this week.' },
              { icon: CheckCircle2, text: 'Registrar report submitted for review.' },
            ].map((alert) => {
              const Icon = alert.icon
              return (
                <div
                  className="flex items-center gap-3 rounded-[6px] bg-white/55 px-3 py-3 text-[13px] font-semibold text-[#1b3a6b]"
                  key={alert.text}
                >
                  <Icon aria-hidden="true" size={16} />
                  {alert.text}
                </div>
              )
            })}
          </div>
        </aside>
      </div>
    </AdminShell>
  )
}
