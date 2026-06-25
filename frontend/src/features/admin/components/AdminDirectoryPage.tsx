import { Edit3, Trash2 } from 'lucide-react'
import { type FormEvent, useMemo, useState } from 'react'
import type { AdminDirectoryItem, AdminSection } from '../adminData'
import { adminCreateIcon } from '../adminData'
import { AdminShell } from './AdminShell'

type AdminDirectoryPageProps = {
  createLabel: string
  description: string
  initialItems: AdminDirectoryItem[]
  section: Exclude<AdminSection, 'dashboard'>
  title: string
}

export function AdminDirectoryPage({
  createLabel,
  description,
  initialItems,
  section,
  title,
}: AdminDirectoryPageProps) {
  const [items, setItems] = useState(initialItems)
  const [selectedId, setSelectedId] = useState(initialItems[0]?.id ?? '')
  const [name, setName] = useState('')
  const [lead, setLead] = useState('')
  const [email, setEmail] = useState('')
  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) ?? items[0] ?? null,
    [items, selectedId],
  )
  const CreateIcon = adminCreateIcon

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!name.trim() || !lead.trim() || !email.trim()) {
      return
    }

    const nextItem: AdminDirectoryItem = {
      id: `${section.slice(0, 3).toUpperCase()}-${String(items.length + 1).padStart(3, '0')}`,
      name,
      lead,
      email,
      status: 'Needs Setup',
      members: 1,
      category: section === 'faculty' ? 'Faculty' : section === 'offices' ? 'Office' : 'Academic',
    }

    setItems((currentItems) => [nextItem, ...currentItems])
    setSelectedId(nextItem.id)
    setName('')
    setLead('')
    setEmail('')
  }

  const deleteSelected = () => {
    if (!selectedItem) {
      return
    }

    const remainingItems = items.filter((item) => item.id !== selectedItem.id)
    setItems(remainingItems)
    setSelectedId(remainingItems[0]?.id ?? '')
  }

  return (
    <AdminShell activeSection={section}>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px] xl:items-start">
        <section>
          <div>
            <p className="m-0 text-[12px] font-bold uppercase tracking-[0.08em] text-[#1b3a6b]">
              Admin Directory
            </p>
            <h1 className="m-0 mt-1 text-[38px] font-bold leading-tight text-[#1b3a6b]">
              {title}
            </h1>
            <p className="m-0 mt-2 max-w-[760px] text-[16px] font-light leading-snug text-[#434343]">
              {description}
            </p>
          </div>

          <section
            className="mt-8 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]"
            aria-label={`${title} records`}
          >
            {items.map((item) => {
              const isSelected = item.id === selectedItem?.id

              return (
                <button
                  className={`rounded-[6px] border px-4 py-4 text-left shadow-[3px_3px_2.5px_1px_#1b3a6b] transition duration-200 hover:-translate-y-0.5 active:scale-[0.995] ${
                    isSelected
                      ? 'border-[#1b3a6b] bg-[#c1d9ff]'
                      : 'border-[#295498]/70 bg-white hover:bg-[#f8fbff]'
                  }`}
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="m-0 text-[11px] font-semibold text-[#1b3a6b]">{item.id}</p>
                      <h2 className="m-0 mt-2 text-[20px] font-semibold leading-tight">
                        {item.name}
                      </h2>
                    </div>
                    <span className="rounded-full bg-[#edf4ff] px-3 py-1 text-[10px] font-semibold text-[#1b3a6b]">
                      {item.status}
                    </span>
                  </div>
                  <p className="m-0 mt-3 text-[12px] leading-snug text-[#434343]">
                    Lead: {item.lead}
                  </p>
                  <p className="m-0 mt-1 text-[12px] leading-snug text-[#434343]">
                    {item.email}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold text-[#1b3a6b]">
                    <span className="rounded-full bg-[#edf4ff] px-3 py-1">
                      {item.members} members
                    </span>
                    <span className="rounded-full bg-[#edf4ff] px-3 py-1">{item.category}</span>
                  </div>
                </button>
              )
            })}
          </section>
        </section>

        <aside className="grid gap-5 xl:sticky xl:top-8">
          <section className="rounded-[6px] border border-[#1b3a6b] bg-white px-5 py-5 shadow-[3px_3px_2.5px_1px_#1b3a6b]">
            <h2 className="m-0 text-[22px] font-semibold text-[#1b3a6b]">{createLabel}</h2>
            <form className="mt-5 grid gap-4" onSubmit={handleCreate}>
              <label className="grid gap-2 text-[12px] font-semibold text-[#1b3a6b]">
                Name
                <input
                  className="h-10 rounded-[5px] border border-[#7fa8de] bg-white px-3 text-[13px] outline-none focus:ring-2 focus:ring-[#9fbef1]"
                  onChange={(event) => setName(event.target.value)}
                  value={name}
                />
              </label>
              <label className="grid gap-2 text-[12px] font-semibold text-[#1b3a6b]">
                Lead or Role
                <input
                  className="h-10 rounded-[5px] border border-[#7fa8de] bg-white px-3 text-[13px] outline-none focus:ring-2 focus:ring-[#9fbef1]"
                  onChange={(event) => setLead(event.target.value)}
                  value={lead}
                />
              </label>
              <label className="grid gap-2 text-[12px] font-semibold text-[#1b3a6b]">
                Email
                <input
                  className="h-10 rounded-[5px] border border-[#7fa8de] bg-white px-3 text-[13px] outline-none focus:ring-2 focus:ring-[#9fbef1]"
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  value={email}
                />
              </label>

              <button
                className="inline-flex h-10 items-center justify-center gap-2 rounded-[5px] border border-[#1b3a6b] bg-[#1b3a6b] text-[13px] font-semibold !text-white transition duration-200 hover:bg-[#295498] active:scale-[0.98]"
                type="submit"
              >
                <CreateIcon aria-hidden="true" size={15} />
                Create Record
              </button>
            </form>
          </section>

          <section className="rounded-[6px] border border-[#1b3a6b] bg-white px-5 py-5 shadow-[3px_3px_2.5px_1px_#1b3a6b]">
            <h2 className="m-0 text-[22px] font-semibold text-[#1b3a6b]">Selected Record</h2>
            {selectedItem ? (
              <>
                <p className="m-0 mt-4 text-[11px] font-semibold text-[#1b3a6b]">
                  {selectedItem.id}
                </p>
                <h3 className="m-0 mt-1 text-[20px] font-semibold leading-tight">
                  {selectedItem.name}
                </h3>
                <dl className="mt-4 grid gap-3 text-[13px]">
                  {[
                    ['Lead', selectedItem.lead],
                    ['Email', selectedItem.email],
                    ['Status', selectedItem.status],
                    ['Members', selectedItem.members],
                  ].map(([label, value]) => (
                    <div className="grid gap-1" key={label}>
                      <dt className="font-semibold text-[#1b3a6b]">{label}</dt>
                      <dd className="m-0 text-[#434343]">{value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-5 grid gap-3">
                  <button
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-[5px] border border-[#1b3a6b] bg-[#1b3a6b] text-[13px] font-semibold !text-white transition duration-200 hover:bg-[#295498] active:scale-[0.98]"
                    type="button"
                  >
                    <Edit3 aria-hidden="true" size={15} />
                    Edit Record
                  </button>
                  <button
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-[5px] border border-[#8a1f1f] bg-white text-[13px] font-semibold text-[#8a1f1f] transition duration-200 hover:bg-[#f0d7d7] active:scale-[0.98]"
                    onClick={deleteSelected}
                    type="button"
                  >
                    <Trash2 aria-hidden="true" size={15} />
                    Delete Record
                  </button>
                </div>
              </>
            ) : (
              <p className="m-0 mt-3 text-[13px] text-[#434343]">No record selected.</p>
            )}
          </section>
        </aside>
      </div>
    </AdminShell>
  )
}
