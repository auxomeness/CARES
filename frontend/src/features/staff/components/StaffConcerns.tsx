import { CheckCircle2, Loader2, Send, Shuffle } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { getApiErrorMessage } from '@/lib/api'
import type { DirectoryRecord } from '@/lib/apiTypes'
import { concernApi, directoryApi } from '@/services/caresApi'
import type { StaffRole } from '../staffData'
import { staffRoleConfigs } from '../staffData'
import { StaffWorkspaceShell } from './StaffWorkspaceShell'

export function StaffConcerns({ role }: { role: Exclude<StaffRole, 'faculty'> }) {
  const config = staffRoleConfigs[role]
  const queryClient = useQueryClient()
  const concerns = useQuery({
    queryKey: ['concerns', 'staff'],
    queryFn: () => concernApi.list({ page: 1, limit: 100 }),
  })
  const offices = useQuery({
    queryKey: ['offices'],
    queryFn: () => directoryApi.offices({ page: 1, limit: 100 }),
  })
  const departments = useQuery({
    queryKey: ['departments'],
    queryFn: () => directoryApi.departments({ page: 1, limit: 100 }),
  })
  const [selectedId, setSelectedId] = useState('')
  const [status, setStatus] = useState('UNDER_REVIEW')
  const [resolution, setResolution] = useState('')
  const [transferType, setTransferType] = useState<'OFFICE' | 'DEPARTMENT'>('OFFICE')
  const [transferId, setTransferId] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [pendingAction, setPendingAction] = useState('')
  const selected =
    concerns.data?.data.find((concern) => concern.id === selectedId) ??
    concerns.data?.data[0] ??
    null

  const mutate = async (action: () => Promise<unknown>, successMessage: string) => {
    setError('')
    setNotice('')
    setPendingAction(successMessage)
    try {
      await action()
      await queryClient.invalidateQueries({ queryKey: ['concerns'] })
      setNotice(successMessage)
    } catch (failure) {
      setError(getApiErrorMessage(failure))
    } finally {
      setPendingAction('')
    }
  }

  const transferTargets: DirectoryRecord[] =
    transferType === 'OFFICE' ? offices.data?.data ?? [] : departments.data?.data ?? []
  const targetId = transferId || transferTargets[0]?.id || ''
  const canManageSelected = Boolean(
    selected &&
      ['SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS', 'TRANSFERRED', 'REOPENED'].includes(
        selected.status,
      ),
  )

  return (
    <StaffWorkspaceShell activeSection="concerns" config={config}>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section>
          <h1 className="text-4xl font-bold text-[#1b3a6b]">Concern Queue</h1>
          <p className="mt-2 text-[#434343]">Review, transfer, update, and resolve concerns assigned to your role.</p>
          {concerns.isLoading ? <p className="mt-8 text-sm">Loading concerns...</p> : null}
          <div className="mt-8 grid gap-4">
            {concerns.data?.data.map((concern) => (
              <button
                className={`rounded-[6px] border p-4 text-left shadow-[3px_3px_2.5px_1px_#1b3a6b] transition duration-200 hover:-translate-y-0.5 hover:shadow-[4px_5px_4px_1px_#1b3a6b] ${selected?.id === concern.id ? 'bg-[#c1d9ff]' : 'bg-white'}`}
                key={concern.id}
                onClick={() => setSelectedId(concern.id)}
                type="button"
              >
                <div className="flex justify-between gap-3">
                  <div><p className="text-xs font-semibold text-[#1b3a6b]">{concern.referenceNumber}</p><h2 className="mt-2 text-xl font-semibold">{concern.title}</h2></div>
                  <span className="h-fit rounded bg-[#edf4ff] px-3 py-1 text-xs font-semibold">{concern.status.replaceAll('_', ' ')}</span>
                </div>
                <p className="mt-3 text-sm">{concern.description}</p>
              </button>
            ))}
            {!concerns.isLoading && !concerns.data?.data.length ? <p className="rounded border bg-white p-6 text-center text-sm">No assigned concerns.</p> : null}
          </div>
        </section>
        <aside className="h-fit rounded-[6px] border border-[#1b3a6b] bg-white p-5 shadow-[3px_3px_2.5px_1px_#1b3a6b]">
          <h2 className="text-xl font-semibold text-[#1b3a6b]">Concern Action</h2>
          {selected ? (
            <div className="mt-5 grid gap-4">
              <h3 className="text-lg font-semibold">{selected.title}</h3>
              {canManageSelected ? (
                <>
                  <label className="grid gap-2 text-xs font-semibold">
                    Status
                    <select className="h-10 rounded border px-3" onChange={(e) => setStatus(e.target.value)} value={status}>
                      <option value="UNDER_REVIEW">Under Review</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      {role === 'office' ? null : <option value="CLOSED">Closed</option>}
                    </select>
                  </label>
                  <button className="inline-flex h-10 items-center justify-center gap-2 rounded bg-[#1b3a6b] text-sm font-semibold !text-white disabled:opacity-70" disabled={Boolean(pendingAction)} onClick={() => void mutate(() => concernApi.status(selected.id, status), 'Concern status updated.')} type="button">
                    {pendingAction === 'Concern status updated.' ? <Loader2 className="animate-spin" size={15} /> : <Send size={15} />} Update Status
                  </button>
                  <label className="grid gap-2 text-xs font-semibold">
                    Resolution report
                    <textarea className="min-h-24 rounded border px-3 py-2" onChange={(e) => setResolution(e.target.value)} value={resolution} />
                  </label>
                  <button className="inline-flex h-10 items-center justify-center gap-2 rounded border border-green-700 text-sm font-semibold text-green-700 disabled:opacity-60" disabled={!resolution.trim() || Boolean(pendingAction)} onClick={() => void mutate(() => concernApi.resolve(selected.id, { summary: resolution, actionsTaken: resolution }), 'Resolution report submitted.')} type="button">
                    {pendingAction === 'Resolution report submitted.' ? <Loader2 className="animate-spin" size={15} /> : <CheckCircle2 size={15} />} Submit Resolution
                  </button>
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-2 gap-2">
                      <select className="h-10 rounded border px-2 text-xs" onChange={(e) => { setTransferType(e.target.value as typeof transferType); setTransferId('') }} value={transferType}>
                        <option value="OFFICE">Office</option><option value="DEPARTMENT">Department</option>
                      </select>
                      <select className="h-10 rounded border px-2 text-xs" onChange={(e) => setTransferId(e.target.value)} value={targetId}>
                        {transferTargets.map((target) => <option key={target.id} value={target.id}>{target.name}</option>)}
                      </select>
                    </div>
                    <textarea className="mt-2 min-h-20 w-full rounded border px-3 py-2 text-sm" onChange={(e) => setReason(e.target.value)} placeholder="Transfer reason" value={reason} />
                    <button className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded border border-[#1b3a6b] text-sm font-semibold text-[#1b3a6b] disabled:opacity-60" disabled={!targetId || !reason.trim() || Boolean(pendingAction)} onClick={() => void mutate(() => concernApi.transfer(selected.id, { toTargetType: transferType, toOfficeId: transferType === 'OFFICE' ? targetId : null, toDepartmentId: transferType === 'DEPARTMENT' ? targetId : null, reason }), 'Concern transfer submitted.')} type="button">
                      {pendingAction === 'Concern transfer submitted.' ? <Loader2 className="animate-spin" size={15} /> : <Shuffle size={15} />} Transfer Concern
                    </button>
                  </div>
                </>
              ) : (
                <p className="rounded bg-[#edf4ff] px-3 py-3 text-sm text-[#1b3a6b]">
                  This concern is read-only while it is {selected.status.replaceAll('_', ' ').toLowerCase()}.
                </p>
              )}
              {notice ? <p className="rounded bg-green-50 px-3 py-2 text-xs font-semibold text-green-700">{notice}</p> : null}
              {error ? <p className="rounded bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{error}</p> : null}
            </div>
          ) : <p className="mt-3 text-sm">No concern selected.</p>}
        </aside>
      </div>
    </StaffWorkspaceShell>
  )
}
