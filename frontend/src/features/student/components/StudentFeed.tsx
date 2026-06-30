import { Plus, X } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { LoadingLink } from '@/components/feedback/LoadingLink'
import { SearchField } from '@/components/forms/SearchField'
import { getApiErrorMessage } from '@/lib/api'
import { concernApi } from '@/services/caresApi'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import type { StudentConcern } from '../studentData.types'
import { mapConcern } from '../context/StudentDataContext'
import { FeedConcernCard } from './FeedConcernCard'
import { StudentWorkspaceShell } from './StudentWorkspaceShell'

function FeedDetailCard({ concern, onClose }: { concern: StudentConcern; onClose?: () => void }) {
  return (
    <article className="rounded-[8px] border border-[#1b3a6b] bg-white p-5 shadow-[3px_3px_2.5px_1px_#1b3a6b]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="m-0 text-[11px] font-semibold text-[#1b3a6b]">{concern.id}</p>
          <h2 className="m-0 mt-2 text-[22px] font-semibold leading-tight">{concern.title}</h2>
        </div>
        {onClose ? (
          <button
            aria-label="Close concern details"
            className="grid size-9 shrink-0 place-items-center rounded-full border border-[#1b3a6b] text-[#1b3a6b]"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={18} />
          </button>
        ) : null}
      </div>
      <dl className="mt-5 grid gap-3 text-[13px]">
        <div>
          <dt className="font-semibold text-[#1b3a6b]">Category</dt>
          <dd className="m-0">{concern.category}</dd>
        </div>
        <div>
          <dt className="font-semibold text-[#1b3a6b]">Location</dt>
          <dd className="m-0">{concern.location}</dd>
        </div>
        <div>
          <dt className="font-semibold text-[#1b3a6b]">Status</dt>
          <dd className="m-0">{concern.status}</dd>
        </div>
        <div>
          <dt className="font-semibold text-[#1b3a6b]">Up reactions</dt>
          <dd className="m-0">{concern.reactions}</dd>
        </div>
        <div>
          <dt className="font-semibold text-[#1b3a6b]">Description</dt>
          <dd className="m-0 leading-snug text-[#434343]">{concern.description}</dd>
        </div>
      </dl>
    </article>
  )
}

export function StudentFeed() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search.trim())
  const [error, setError] = useState('')
  const [visibleCount, setVisibleCount] = useState(10)
  const [selectedConcern, setSelectedConcern] = useState<StudentConcern | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const feed = useQuery({
    queryKey: ['concerns', 'public', debouncedSearch],
    queryFn: () =>
      concernApi.publicFeed({
        page: 1,
        limit: 50,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      }),
    staleTime: 30_000,
  })
  const concerns = useMemo(
    () =>
      (feed.data?.data ?? [])
        .map(mapConcern)
        .sort((left, right) => right.reactions - left.reactions),
    [feed.data],
  )
  const visibleConcerns = concerns.slice(0, visibleCount)

  useEffect(() => {
    const target = loadMoreRef.current
    if (!target) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((currentCount) => Math.min(currentCount + 10, concerns.length))
        }
      },
      { rootMargin: '160px' },
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [concerns.length])

  const support = async (id: string) => {
    setError('')
    try {
      const concern = feed.data?.data.find((item) => item.referenceNumber === id || item.id === id)
      await concernApi.support(concern?.id ?? id)
      await queryClient.invalidateQueries({ queryKey: ['concerns', 'public'] })
    } catch (failure) {
      setError(getApiErrorMessage(failure))
    }
  }

  return (
    <StudentWorkspaceShell activeSection="feed" contentClassName="max-w-none">
      <div className="grid gap-5 xl:grid-cols-[minmax(260px,0.8fr)_minmax(420px,1fr)] xl:items-end">
        <DashboardHeader
          title="Community Feed"
          subtitle="Support public concerns reported by the student community."
        />
        <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row">
          <SearchField
            className="h-10 min-w-0 flex-1"
            label="Search"
            onChange={(e) => {
              setSearch(e.target.value)
              setVisibleCount(10)
            }}
            value={search}
          />
          <LoadingLink
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded bg-[#1b3a6b] px-4 text-sm font-semibold !text-white no-underline"
            href="#student-concern-new"
          >
            <Plus size={16} /> New Concern
          </LoadingLink>
        </div>
      </div>
      {feed.isLoading ? <p className="mt-8 text-sm">Loading public concerns...</p> : null}
      {error || feed.isError ? <p className="mt-6 rounded bg-red-50 p-3 text-sm text-red-700">{error || 'Unable to load public concerns.'}</p> : null}
      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="grid content-start gap-5">
          {visibleConcerns.map((concern) => (
            <FeedConcernCard
              concern={concern}
              key={concern.apiId}
              onSelect={setSelectedConcern}
              onUp={support}
            />
          ))}
          {!feed.isLoading && concerns.length === 0 ? <p className="rounded border bg-white p-6 text-center text-sm">No public concerns.</p> : null}
          {visibleCount < concerns.length ? (
            <div ref={loadMoreRef} className="py-4 text-center text-xs font-semibold text-[#1b3a6b]">
              Loading more concerns...
            </div>
          ) : null}
        </section>
        <aside className="hidden content-start gap-6 xl:grid">
          {selectedConcern ? (
            <FeedDetailCard concern={selectedConcern} />
          ) : (
            <div className="rounded-[8px] border border-[#1b3a6b] bg-[#c1d9ff] p-5 shadow-[3px_3px_2.5px_1px_#1b3a6b]">
              <h2 className="m-0 text-[19px] font-semibold">Most Supported First</h2>
              <p className="m-0 mt-3 text-[13px] leading-snug">
                Public concerns are ordered by the number of up reactions so urgent shared issues stay visible.
              </p>
            </div>
          )}
        </aside>
      </div>
      {selectedConcern ? (
        <div className="fixed inset-0 z-50 grid place-items-end bg-[#101010]/35 px-3 pb-3 pt-8 backdrop-blur-[2px] xl:hidden">
          <div className="w-full max-w-[560px] animate-[modalIn_220ms_ease-out]">
            <FeedDetailCard concern={selectedConcern} onClose={() => setSelectedConcern(null)} />
          </div>
        </div>
      ) : null}
    </StudentWorkspaceShell>
  )
}
