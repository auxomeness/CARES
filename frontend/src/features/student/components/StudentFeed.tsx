import { Plus } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
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
  const [visibleCount, setVisibleCount] = useState(4)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const loadMoreLockRef = useRef(false)

  const publicConcerns = useMemo(
    () => concerns.filter((concern) => concern.visibility === 'public'),
    [concerns],
  )

  const filteredConcerns = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return publicConcerns
      .filter((concern) => {
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
      .sort((leftConcern, rightConcern) => rightConcern.reactions - leftConcern.reactions)
  }, [categoryFilter, locationFilter, publicConcerns, search, statusFilter])

  const feedItems = useMemo(() => {
    if (!filteredConcerns.length) {
      return []
    }

    return Array.from({ length: visibleCount }, (_, index) => {
      const concern = filteredConcerns[index % filteredConcerns.length]

      return {
        concern,
        key: `${concern.id}-${index}`,
      }
    })
  }, [filteredConcerns, visibleCount])

  useEffect(() => {
    const node = loadMoreRef.current

    if (!node || filteredConcerns.length === 0) {
      return
    }

    const loadMore = () => {
      if (loadMoreLockRef.current) {
        return
      }

      loadMoreLockRef.current = true
      setIsLoadingMore(true)

      window.setTimeout(() => {
        setVisibleCount((currentCount) => currentCount + 4)
        setIsLoadingMore(false)
        loadMoreLockRef.current = false
      }, 520)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadMore()
        }
      },
      { rootMargin: '180px' },
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [filteredConcerns.length])

  return (
    <StudentWorkspaceShell
      activeSection="feed"
      contentClassName="max-w-none"
      workspaceClassName="xl:pr-6 2xl:pr-8"
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(300px,460px)_minmax(0,1fr)] xl:items-start">
        <div className="max-w-[460px]">
          <DashboardHeader
            title="Community Feed"
            subtitle="See public concerns around campus and help raise urgent issues."
          />
        </div>

        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] xl:pt-1">
          <SearchField
            className="h-9 min-w-0"
            label="Search public concerns"
            onChange={(event) => {
              setSearch(event.target.value)
              setVisibleCount(4)
            }}
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
        className="mt-7 flex gap-2 overflow-x-auto rounded-[5px] border border-[#295498]/60 bg-white px-2 py-2 shadow-sm xl:mt-10"
      >
        <button
          className={`h-8 min-w-[96px] rounded-[5px] border px-3 text-[11px] font-semibold transition duration-200 active:scale-[0.98] ${
            statusFilter === 'all' && categoryFilter === 'all' && locationFilter === 'all'
              ? 'border-[#1b3a6b] bg-[#1b3a6b] !text-white'
              : 'border-[#1b3a6b] bg-white text-[#1b3a6b] hover:bg-[#edf4ff]'
          }`}
          onClick={() => {
            setStatusFilter('all')
            setCategoryFilter('all')
            setLocationFilter('all')
            setVisibleCount(4)
          }}
          type="button"
        >
          All
        </button>

        <select
          className="h-8 min-w-[118px] rounded-[5px] border border-[#1b3a6b] bg-white px-3 text-[11px] font-semibold text-[#1b3a6b] outline-none focus:ring-2 focus:ring-[#9fbef1]"
          onChange={(event) => {
            setStatusFilter(event.target.value)
            setVisibleCount(4)
          }}
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
          className="h-8 min-w-[132px] rounded-[5px] border border-[#1b3a6b] bg-white px-3 text-[11px] font-semibold text-[#1b3a6b] outline-none focus:ring-2 focus:ring-[#9fbef1]"
          onChange={(event) => {
            setCategoryFilter(event.target.value)
            setVisibleCount(4)
          }}
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
          className="h-8 min-w-[132px] rounded-[5px] border border-[#1b3a6b] bg-white px-3 text-[11px] font-semibold text-[#1b3a6b] outline-none focus:ring-2 focus:ring-[#9fbef1]"
          onChange={(event) => {
            setLocationFilter(event.target.value)
            setVisibleCount(4)
          }}
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

      <div className="mt-10 grid gap-7 xl:grid-cols-[minmax(0,1fr)_350px] xl:items-start">
        <section className="grid gap-5" aria-label="Public concerns">
          {feedItems.map(({ concern, key }) => (
            <FeedConcernCard concern={concern} key={key} onUp={upConcern} />
          ))}

          {filteredConcerns.length === 0 ? (
            <div className="rounded-[5px] border border-[#295498]/60 bg-white px-5 py-8 text-center text-[14px] text-[#434343] shadow-sm">
              No public concerns match the current filters.
            </div>
          ) : null}

          {filteredConcerns.length > 0 ? (
            <div
              className="grid min-h-[52px] place-items-center text-[12px] font-semibold text-[#1b3a6b]"
              ref={loadMoreRef}
            >
              {isLoadingMore ? (
                <span className="inline-flex items-center gap-2">
                  <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Loading more concerns
                </span>
              ) : (
                <span className="text-[#707070]">Scroll for more concerns</span>
              )}
            </div>
          ) : null}
        </section>

        <StudentFeedInsights className="hidden xl:block" concerns={publicConcerns} />
      </div>
    </StudentWorkspaceShell>
  )
}
