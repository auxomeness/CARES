import { Building2, GraduationCap, UserRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { LoadingLink } from '@/components/feedback/LoadingLink'
import { SearchField } from '@/components/forms/SearchField'
import { directoryEntries } from '../studentDirectory.config'
import type { DirectoryKind } from '../studentDirectory.types'
import { DirectoryEntryCard } from './DirectoryEntryCard'
import { StudentWorkspaceShell } from './StudentWorkspaceShell'

type StudentDirectoriesProps = {
  kind?: DirectoryKind
}

const directoryMeta = {
  office: {
    title: 'Campus Offices',
    subtitle: 'Find the office responsible for routed student services and concern handling.',
  },
  department: {
    title: 'Departments',
    subtitle: 'Browse academic departments for consultation, concerns, and program support.',
  },
  faculty: {
    title: 'Faculty',
    subtitle: 'Find faculty members available for consultation and routed academic support.',
  },
} satisfies Record<DirectoryKind, { title: string; subtitle: string }>

const directoryGroups = [
  {
    href: '#student-directories-office',
    icon: Building2,
    label: 'Office',
    text: 'Campus offices that receive student service, records, and support concerns.',
  },
  {
    href: '#student-directories-department',
    icon: GraduationCap,
    label: 'Department',
    text: 'Academic departments for program, course, and department-specific concerns.',
  },
  {
    href: '#student-directories-faculty',
    icon: UserRound,
    label: 'Faculty',
    text: 'Faculty contacts for consultation, advising, and appointment requests.',
  },
]

export function StudentDirectories({ kind }: StudentDirectoriesProps) {
  const [query, setQuery] = useState('')

  const filteredEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return directoryEntries.filter((entry) => {
      const matchesKind = !kind || entry.kind === kind
      const matchesSearch =
        !normalizedQuery ||
        [
          entry.name,
          entry.description,
          entry.contact,
          entry.location,
          entry.kind,
          entry.relatedOffice ?? '',
          entry.facultyLead ?? '',
          entry.mainConcerns.join(' '),
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)

      return matchesKind && matchesSearch
    })
  }, [kind, query])

  if (!kind) {
    return (
      <StudentWorkspaceShell activeSection="offices" contentClassName="max-w-[930px]">
        <DashboardHeader
          title="Directories"
          subtitle="Choose a directory level before viewing records."
        />

        <section className="mt-8 grid gap-5 md:grid-cols-3" aria-label="Directory levels">
          {directoryGroups.map((group) => {
            const Icon = group.icon

            return (
              <article
                className="rounded-[5px] border border-[#295498]/70 bg-white px-5 py-5 shadow-[3px_3px_2.5px_1px_#1b3a6b]"
                key={group.label}
              >
                <span className="grid size-12 place-items-center rounded-[5px] bg-[#f5d788] text-[#1b3a6b]">
                  <Icon aria-hidden="true" size={24} />
                </span>
                <h2 className="m-0 mt-4 text-[22px] font-semibold text-[#1b3a6b]">
                  {group.label}
                </h2>
                <p className="m-0 mt-2 text-[13px] leading-snug text-[#434343]">{group.text}</p>
                <LoadingLink
                  className="relative mt-5 inline-flex h-10 w-full items-center justify-center overflow-hidden rounded-[5px] border border-[#1b3a6b] bg-[#1b3a6b] px-4 text-[13px] font-semibold !text-white no-underline transition duration-200 hover:bg-[#295498] active:scale-[0.98] [&_*]:!text-white"
                  href={group.href}
                >
                  View {group.label}
                </LoadingLink>
              </article>
            )
          })}
        </section>
      </StudentWorkspaceShell>
    )
  }

  const pageMeta = directoryMeta[kind]

  return (
    <StudentWorkspaceShell activeSection="offices" contentClassName="max-w-[930px]">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <DashboardHeader
          title={pageMeta.title}
          subtitle={pageMeta.subtitle}
        />
        <SearchField
          className="h-9 w-full xl:w-[300px]"
          label="Search directories"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search"
          value={query}
        />
      </div>

      <section
        className="mt-8 grid gap-5 md:grid-cols-2 2xl:grid-cols-3"
        aria-label="Directory entries"
      >
        {filteredEntries.map((entry) => (
          <DirectoryEntryCard entry={entry} key={`${entry.kind}-${entry.id}`} />
        ))}
      </section>

      {filteredEntries.length === 0 ? (
        <div className="mt-8 rounded-[5px] border border-[#295498]/60 bg-white px-5 py-8 text-center text-[14px] text-[#434343] shadow-sm">
          No directory records match the current search.
        </div>
      ) : null}
    </StudentWorkspaceShell>
  )
}
