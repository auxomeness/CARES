import { Plus } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { LoadingLink } from '@/components/feedback/LoadingLink'
import { SearchField } from '@/components/forms/SearchField'
import { getApiErrorMessage } from '@/lib/api'
import { concernApi } from '@/services/caresApi'
import { mapConcern } from '../context/StudentDataContext'
import { FeedConcernCard } from './FeedConcernCard'
import { StudentWorkspaceShell } from './StudentWorkspaceShell'

export function StudentFeed() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const feed = useQuery({
    queryKey: ['concerns', 'public', search],
    queryFn: () =>
      concernApi.publicFeed({
        page: 1,
        limit: 50,
        ...(search.trim() ? { search: search.trim() } : {}),
      }),
  })
  const concerns = (feed.data?.data ?? []).map(mapConcern)

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
      <div className="flex flex-col justify-between gap-4 sm:flex-row">
        <DashboardHeader title="Community Feed" subtitle="Support public concerns reported by the student community." />
        <div className="flex gap-3"><SearchField label="Search" onChange={(e) => setSearch(e.target.value)} value={search} /><LoadingLink className="inline-flex h-10 items-center gap-2 rounded bg-[#1b3a6b] px-4 text-sm font-semibold text-white no-underline" href="#student-concern-new"><Plus size={16} /> New</LoadingLink></div>
      </div>
      {feed.isLoading ? <p className="mt-8 text-sm">Loading public concerns...</p> : null}
      {error || feed.isError ? <p className="mt-6 rounded bg-red-50 p-3 text-sm text-red-700">{error || 'Unable to load public concerns.'}</p> : null}
      <section className="mt-8 grid gap-5">
        {concerns.map((concern) => <FeedConcernCard concern={concern} key={concern.apiId} onUp={support} />)}
        {!feed.isLoading && concerns.length === 0 ? <p className="rounded border bg-white p-6 text-center text-sm">No public concerns.</p> : null}
      </section>
    </StudentWorkspaceShell>
  )
}
