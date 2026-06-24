import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { LoadingLink } from '@/components/feedback/LoadingLink'
import { SearchField } from '@/components/forms/SearchField'
import {
  campusLocations,
  concernCategories,
  concernStatuses,
} from '../studentData.config'
import { useStudentData } from '../context/studentDataStore'
import { FeedConcernCard } from './FeedConcernCard'
import { StudentFeedInsights } from './StudentFeedInsights'
import { StudentWorkspaceShell } from './StudentWorkspaceShell'

export function StudentFeed() {
  const { concerns, upConcern } = useStudentData()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')

  const publicConcerns = useMemo(
    () => concerns.filter((concern) => concern.visibility === 'public'),
    [concerns],
  )

  const filteredConcerns = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return publicConcerns.filter((concern) => {
      const matchesSearch =
        !normalizedSearch ||
        [concern.title, concern.description, concern.category, concern.location]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch)

      const matchesStatus = statusFilter === 'all' || concern.status === statusFilter
      const matchesCategory = categoryFilter === 'all' || concern.category === categoryFilter
      const matchesLocation = locationFilter === 'all' || concern.location === locationFilter

      return matchesSearch && matchesStatus && matchesCategory && matchesLocation
    })
  }, [categoryFilter, locationFilter, publicConcerns, search, statusFilter])

  return (
    <StudentWorkspaceShell
      activeSection="feed"
      contentClassName="max-w-[632px]"
      rightRail={<StudentFeedInsights concerns={publicConcerns} />}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <DashboardHeader
          title="Community Feed"
          subtitle="See public concerns around campus and help raise urgent issues."
        />

        <div className="grid w-full shrink-0 grid-cols-[minmax(0,1fr)_auto] gap-3 sm:max-w-[500px]">
          <SearchField
            className="h-9 min-w-0"
            label="Search public concerns"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search"
            value={search}
          />
          <LoadingLink
            className="relative inline-flex h-9 min-w-[142px] items-center justify-center overflow-hidden rounded-[5px] border border-[#1b3a6b] bg-[#1b3a6b] px-4 text-[13px] font-semibold !text-white no-underline transition duration-200 hover:bg-[#295498] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9fbef1] active:scale-[0.98] [&_*]:!text-white"
            href="#student-concern-new"
          >
            <Plus aria-hidden="true" size={16} />
            New Concern
          </LoadingLink>
        </div>
      </div>

      <section
        aria-label="Concern filters"
        className="mt-8 grid gap-3 rounded-[5px] border border-[#295498]/60 bg-white px-3 py-3 shadow-sm sm:grid-cols-4"
      >
        <button
          className={`h-9 rounded-[5px] border px-3 text-[12px] font-semibold transition duration-200 active:scale-[0.98] ${
            statusFilter === 'all' && categoryFilter === 'all' && locationFilter === 'all'
              ? 'border-[#1b3a6b] bg-[#1b3a6b] !text-white'
              : 'border-[#1b3a6b] bg-white text-[#1b3a6b] hover:bg-[#edf4ff]'
          }`}
          onClick={() => {
            setStatusFilter('all')
            setCategoryFilter('all')
            setLocationFilter('all')
          }}
          type="button"
        >
          All
        </button>

        <select
          className="h-9 rounded-[5px] border border-[#1b3a6b] bg-white px-3 text-[12px] font-semibold text-[#1b3a6b] outline-none focus:ring-2 focus:ring-[#9fbef1]"
          onChange={(event) => setStatusFilter(event.target.value)}
          value={statusFilter}
        >
          <option value="all">Status</option>
          {concernStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <select
          className="h-9 rounded-[5px] border border-[#1b3a6b] bg-white px-3 text-[12px] font-semibold text-[#1b3a6b] outline-none focus:ring-2 focus:ring-[#9fbef1]"
          onChange={(event) => setCategoryFilter(event.target.value)}
          value={categoryFilter}
        >
          <option value="all">Category</option>
          {concernCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          className="h-9 rounded-[5px] border border-[#1b3a6b] bg-white px-3 text-[12px] font-semibold text-[#1b3a6b] outline-none focus:ring-2 focus:ring-[#9fbef1]"
          onChange={(event) => setLocationFilter(event.target.value)}
          value={locationFilter}
        >
          <option value="all">Location</option>
          {campusLocations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
      </section>

      <section className="mt-8 grid gap-5" aria-label="Public concerns">
        {filteredConcerns.map((concern) => (
          <FeedConcernCard concern={concern} key={concern.id} onUp={upConcern} />
        ))}

        {filteredConcerns.length === 0 ? (
          <div className="rounded-[5px] border border-[#295498]/60 bg-white px-5 py-8 text-center text-[14px] text-[#434343] shadow-sm">
            No public concerns match the current filters.
          </div>
        ) : null}
      </section>
    </StudentWorkspaceShell>
  )
}
