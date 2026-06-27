import { Building2, GraduationCap, UserRound } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { LoadingLink } from '@/components/feedback/LoadingLink'
import { SearchField } from '@/components/forms/SearchField'
import { directoryApi } from '@/services/caresApi'
import type { DirectoryRecord, FacultyRecord, PaginatedEnvelope } from '@/lib/apiTypes'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import type { DirectoryKind } from '../studentDirectory.types'
import { StudentWorkspaceShell } from './StudentWorkspaceShell'

const meta = {
  office: { title: 'Campus Offices', icon: Building2 },
  department: { title: 'Departments', icon: GraduationCap },
  faculty: { title: 'Faculty', icon: UserRound },
}

export function StudentDirectories({ kind }: { kind?: DirectoryKind }) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search.trim())
  const result = useQuery<PaginatedEnvelope<DirectoryRecord | FacultyRecord>>({
    queryKey: ['directory', kind, debouncedSearch],
    enabled: Boolean(kind),
    queryFn: async () => {
      const params = {
        page: 1,
        limit: 100,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      }
      if (kind === 'office') return directoryApi.offices(params)
      if (kind === 'department') return directoryApi.departments(params)
      return directoryApi.faculty(params)
    },
  })

  if (!kind) {
    return (
      <StudentWorkspaceShell activeSection="offices" contentClassName="max-w-none">
        <DashboardHeader title="Directories" subtitle="Browse real office, department, and faculty records." />
        <section className="mt-8 grid gap-5 sm:grid-cols-3">
          {(Object.keys(meta) as DirectoryKind[]).map((entryKind) => {
            const Icon = meta[entryKind].icon
            return (
              <LoadingLink className="rounded border bg-white p-5 text-[#1b3a6b] no-underline shadow-[3px_3px_2.5px_1px_#1b3a6b]" href={`#student-directories-${entryKind}`} key={entryKind}>
                <Icon size={26} /><h2 className="mt-4 text-xl font-semibold">{meta[entryKind].title}</h2>
              </LoadingLink>
            )
          })}
        </section>
      </StudentWorkspaceShell>
    )
  }

  const Icon = meta[kind].icon
  return (
    <StudentWorkspaceShell activeSection="offices" contentClassName="max-w-none">
      <div className="flex flex-col justify-between gap-4 sm:flex-row">
        <DashboardHeader title={meta[kind].title} subtitle="Search current CARES directory records." />
        <SearchField label="Search" onChange={(event) => setSearch(event.target.value)} value={search} />
      </div>
      {result.isLoading ? <p className="mt-8 text-sm">Loading directory...</p> : null}
      {result.isError ? <p className="mt-8 text-sm text-red-700">Unable to load directory.</p> : null}
      <section className="mt-8 grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
        {result.data?.data.map((record) => {
          const isFaculty = 'position' in record
          const name = isFaculty
            ? `${record.user?.firstName ?? ''} ${record.user?.lastName ?? ''}`.trim()
            : record.name
          const detail = isFaculty
            ? `${record.position} · ${typeof record.department === 'string' ? record.department : record.department.name}`
            : record.description || record.email || record.location || ''
          return (
            <article className="rounded border bg-white p-5 shadow-[3px_3px_2.5px_1px_#1b3a6b]" key={record.id}>
              <Icon className="text-[#1b3a6b]" size={24} />
              <h2 className="mt-4 text-xl font-semibold">{name}</h2>
              <p className="mt-2 text-sm text-[#434343]">{detail}</p>
              <LoadingLink className="mt-5 inline-flex h-9 items-center rounded bg-[#1b3a6b] px-4 text-sm font-semibold text-white no-underline" href={`#student-directory-${kind}-${record.id}`}>View details</LoadingLink>
            </article>
          )
        })}
      </section>
      {!result.isLoading && !result.data?.data.length ? <p className="mt-8 rounded border bg-white p-6 text-center text-sm">No matching records.</p> : null}
    </StudentWorkspaceShell>
  )
}
