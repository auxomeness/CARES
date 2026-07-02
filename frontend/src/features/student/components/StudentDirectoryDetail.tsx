import { ArrowLeft, Mail, MapPin } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { LoadingLink } from '@/components/feedback/LoadingLink'
import { directoryApi } from '@/services/caresApi'
import type { DirectoryRecord, FacultyRecord } from '@/lib/apiTypes'
import { queryKeys } from '@/lib/queryKeys'
import { StudentWorkspaceShell } from './StudentWorkspaceShell'

export function StudentDirectoryDetail() {
  const match = window.location.hash.match(/^#student-directory-(office|department|faculty)-(.+)$/)
  const kind = match?.[1]
  const id = match?.[2]
  const record = useQuery<DirectoryRecord | FacultyRecord>({
    queryKey: queryKeys.directory.detail(kind as 'office' | 'department' | 'faculty' | undefined, id),
    enabled: Boolean(kind && id),
    queryFn: async () => {
      if (kind === 'office') return directoryApi.office(id!)
      if (kind === 'department') return directoryApi.department(id!)
      return directoryApi.facultyMember(id!)
    },
  })

  return (
    <StudentWorkspaceShell activeSection="offices" contentClassName="max-w-[820px]">
      <LoadingLink className="inline-flex h-9 items-center gap-2 rounded border px-4 text-sm text-[#1b3a6b] no-underline" href="#student-directories"><ArrowLeft size={15} /> Back</LoadingLink>
      {record.isLoading ? <p className="mt-8">Loading directory record...</p> : null}
      {record.isError || !match ? <p className="mt-8 rounded border bg-white p-6">Directory record not found.</p> : null}
      {record.data ? (
        <section className="mt-6 rounded border bg-white p-6 shadow-[3px_3px_2.5px_1px_#1b3a6b]">
          {'position' in record.data ? (
            <>
              <p className="text-xs font-semibold uppercase text-[#707070]">{record.data.position}</p>
              <h1 className="mt-2 text-3xl font-bold text-[#1b3a6b]">{record.data.user?.firstName} {record.data.user?.lastName}</h1>
              <p className="mt-3">{typeof record.data.department === 'string' ? record.data.department : record.data.department.name}</p>
              <p className="mt-4 inline-flex items-center gap-2 text-sm"><Mail size={15} /> {record.data.user?.email}</p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-[#1b3a6b]">{record.data.name}</h1>
              <p className="mt-3 text-sm">{record.data.description || 'No description provided.'}</p>
              {record.data.email ? <p className="mt-5 inline-flex items-center gap-2 text-sm"><Mail size={15} /> {record.data.email}</p> : null}
              {record.data.location ? <p className="mt-3 inline-flex items-center gap-2 text-sm"><MapPin size={15} /> {record.data.location}</p> : null}
            </>
          )}
          <LoadingLink className="mt-6 inline-flex h-10 items-center rounded bg-[#1b3a6b] px-5 text-sm font-semibold text-white no-underline" href="#student-concern-new">Submit concern</LoadingLink>
        </section>
      ) : null}
    </StudentWorkspaceShell>
  )
}
