import { Building2, GraduationCap, Mail, MapPin, UserRound } from 'lucide-react'
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
              <LoadingLink
                className="rounded-[5px] border border-[#295498]/70 bg-white p-5 text-[#1b3a6b] no-underline shadow-[3px_3px_2.5px_1px_#1b3a6b] transition duration-200 hover:-translate-y-0.5"
                href={`#student-directories-${entryKind}`}
                key={entryKind}
              >
                <Icon size={26} />
                <h2 className="m-0 mt-4 text-xl font-semibold">{meta[entryKind].title}</h2>
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
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <DashboardHeader title={meta[kind].title} subtitle="Search current CARES directory records." />
        <SearchField
          className="h-10 w-full sm:max-w-[360px]"
          label="Search"
          onChange={(event) => setSearch(event.target.value)}
          value={search}
        />
      </div>
      {result.isLoading ? <p className="mt-8 text-sm">Loading directory...</p> : null}
      {result.isError ? <p className="mt-8 text-sm text-red-700">Unable to load directory.</p> : null}
      <section className="mt-8 grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
        {result.data?.data.map((record) => {
          const isFaculty = 'position' in record
          const name = isFaculty
            ? `${record.user?.firstName ?? ''} ${record.user?.lastName ?? ''}`.trim()
            : record.name
          const departmentName = isFaculty
            ? typeof record.department === 'string'
              ? record.department
              : record.department.name
            : ''
          const detail = isFaculty
            ? `${record.position} - ${departmentName}`
            : record.description || 'No description provided yet.'
          const email = isFaculty ? record.user?.email : record.email
          const location = isFaculty ? departmentName : record.location
          return (
            <article className="grid min-h-[245px] content-start rounded-[6px] border border-[#295498]/70 bg-white p-5 shadow-[3px_3px_2.5px_1px_#1b3a6b] transition duration-200 hover:-translate-y-0.5 hover:shadow-[4px_5px_4px_1px_#1b3a6b]" key={record.id}>
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-11 place-items-center rounded-[6px] bg-[#edf4ff] text-[#1b3a6b]">
                  <Icon size={23} />
                </span>
                <span className="rounded-full bg-[#f5d788] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.04em] text-[#1b3a6b]">
                  {kind}
                </span>
              </div>
              <h2 className="m-0 mt-4 text-xl font-semibold leading-tight text-[#101010]">{name || 'Unnamed record'}</h2>
              <p className="m-0 mt-2 line-clamp-3 text-sm leading-snug text-[#434343]">{detail}</p>
              <div className="mt-4 grid gap-2 text-[12px] text-[#1b3a6b]">
                {location ? (
                  <span className="inline-flex items-center gap-2">
                    <MapPin aria-hidden="true" size={14} />
                    {location}
                  </span>
                ) : null}
                {email ? (
                  <span className="inline-flex items-center gap-2 break-all">
                    <Mail aria-hidden="true" size={14} />
                    {email}
                  </span>
                ) : null}
              </div>
              <LoadingLink className="mt-auto inline-flex h-9 w-fit items-center rounded bg-[#1b3a6b] px-4 text-sm font-semibold !text-white no-underline transition duration-200 hover:bg-[#295498] active:scale-[0.98]" href={`#student-directory-${kind}-${record.id}`}>View details</LoadingLink>
            </article>
          )
        })}
      </section>
      {!result.isLoading && !result.data?.data.length ? <p className="mt-8 rounded border bg-white p-6 text-center text-sm">No matching records.</p> : null}
    </StudentWorkspaceShell>
  )
}
