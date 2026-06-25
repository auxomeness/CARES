import { CheckCircle2, FileText, RotateCcw } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { LoadingLink } from '@/components/feedback/LoadingLink'
import { getApiErrorMessage } from '@/lib/api'
import { concernApi } from '@/services/caresApi'
import { useStudentData } from '../context/studentDataStore'
import { getConcernStatusClass } from '../studentUi'
import { StudentWorkspaceShell } from './StudentWorkspaceShell'

export function StudentConcerns() {
  const { concerns, isLoading, error, refresh } = useStudentData()
  const [selectedId, setSelectedId] = useState('')
  const [feedback, setFeedback] = useState('')
  const [actionError, setActionError] = useState('')
  const selected = concerns.find((item) => item.apiId === selectedId) ?? concerns[0] ?? null
  const detailQuery = useQuery({
    queryKey: ['concern', selected?.apiId],
    queryFn: () => concernApi.detail(selected!.apiId!),
    enabled: Boolean(selected?.apiId),
  })
  const detail = detailQuery.data ?? selected?.detail

  const act = async (action: () => Promise<unknown>) => {
    setActionError('')
    try {
      await action()
      await refresh()
    } catch (actionFailure) {
      setActionError(getApiErrorMessage(actionFailure))
    }
  }

  return (
    <StudentWorkspaceShell activeSection="concerns" contentClassName="max-w-none">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <DashboardHeader title="My Concerns" subtitle="Track status, evidence, and resolution history." />
        <LoadingLink
          className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-[5px] bg-[#1b3a6b] px-4 text-sm font-semibold text-white no-underline sm:w-auto"
          href="#student-concern-new"
        >
          <FileText size={16} /> Add Concern
        </LoadingLink>
      </div>
      {isLoading ? <p className="mt-8 text-sm">Loading concerns...</p> : null}
      {error || actionError ? (
        <p className="mt-6 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error || actionError}</p>
      ) : null}
      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <section className="grid content-start gap-4">
          {concerns.map((concern) => (
            <button
              className={`rounded-[5px] border px-4 py-4 text-left shadow-[3px_3px_2.5px_1px_#1b3a6b] ${
                selected?.apiId === concern.apiId ? 'bg-[#c1d9ff]' : 'bg-white'
              }`}
              key={concern.apiId}
              onClick={() => setSelectedId(concern.apiId ?? '')}
              type="button"
            >
              <div className="flex justify-between gap-3">
                <div>
                  <p className="m-0 text-xs font-semibold text-[#1b3a6b]">{concern.id}</p>
                  <h2 className="m-0 mt-2 text-xl font-semibold">{concern.title}</h2>
                </div>
                <span className={`h-fit rounded border px-3 py-1 text-xs ${getConcernStatusClass(concern.status)}`}>
                  {concern.backendStatus?.replaceAll('_', ' ')}
                </span>
              </div>
              <p className="mt-3 text-sm text-[#434343]">{concern.description}</p>
            </button>
          ))}
          {!isLoading && concerns.length === 0 ? (
            <p className="rounded border bg-white p-6 text-center text-sm">No concerns submitted.</p>
          ) : null}
        </section>
        <aside className="h-fit rounded-[5px] border border-[#1b3a6b] bg-white p-5 shadow-[3px_3px_2.5px_1px_#1b3a6b]">
          {selected ? (
            <>
              <p className="text-xs font-semibold text-[#1b3a6b]">{selected.id}</p>
              <h2 className="mt-2 text-xl font-semibold">{selected.title}</h2>
              <dl className="mt-5 grid gap-3 text-sm">
                <div><dt className="font-semibold">Target</dt><dd>{selected.location}</dd></div>
                <div><dt className="font-semibold">Visibility</dt><dd className="capitalize">{selected.visibility}</dd></div>
                <div><dt className="font-semibold">Description</dt><dd>{selected.description}</dd></div>
                {detail?.resolutionReport ? (
                  <div>
                    <dt className="font-semibold">Resolution</dt>
                    <dd>{detail.resolutionReport.summary}</dd>
                    <dd className="mt-1 text-xs text-[#707070]">{detail.resolutionReport.actionsTaken}</dd>
                  </div>
                ) : null}
              </dl>
              {detailQuery.isLoading ? <p className="mt-5 text-xs">Loading full history...</p> : null}
              {selected.backendStatus === 'AWAITING_CONFIRMATION' && selected.apiId ? (
                <div className="mt-6 grid gap-3">
                  <button
                    className="inline-flex h-10 items-center justify-center gap-2 rounded bg-green-700 text-sm font-semibold text-white"
                    onClick={() => void act(() => concernApi.confirm(selected.apiId!))}
                    type="button"
                  >
                    <CheckCircle2 size={16} /> Confirm Fixed
                  </button>
                  <textarea
                    className="min-h-20 rounded border px-3 py-2 text-sm"
                    onChange={(event) => setFeedback(event.target.value)}
                    placeholder="Explain what is still not fixed"
                    value={feedback}
                  />
                  <button
                    className="inline-flex h-10 items-center justify-center gap-2 rounded border border-red-700 text-sm font-semibold text-red-700"
                    disabled={!feedback.trim()}
                    onClick={() => void act(() => concernApi.rejectResolution(selected.apiId!, feedback))}
                    type="button"
                  >
                    <RotateCcw size={16} /> Not Fixed
                  </button>
                </div>
              ) : null}
              {detail?.timeline?.length ? (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold">Timeline</h3>
                  <ol className="mt-3 grid gap-3">
                    {detail.timeline.map((item) => (
                      <li className="border-l-2 border-[#1b3a6b] pl-3 text-xs" key={item.id}>
                        <strong>{item.eventType.replaceAll('_', ' ')}</strong>
                        <p>{item.description}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}
              {detail?.attachments?.length ? (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold">Attachments</h3>
                  <ul className="mt-3 grid gap-2 text-xs">
                    {detail.attachments.map((attachment) => (
                      <li key={attachment.id}>
                        <a className="font-semibold text-[#1b3a6b]" href={attachment.fileUrl} rel="noreferrer" target="_blank">
                          {attachment.fileName}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {detail?.transfers?.length ? (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold">Transfer History</h3>
                  <ol className="mt-3 grid gap-3">
                    {detail.transfers.map((transfer) => (
                      <li className="border-l-2 border-[#d4a017] pl-3 text-xs" key={transfer.id}>
                        <strong>
                          {transfer.fromOffice?.name ?? transfer.fromDepartment?.name ?? 'Previous target'}
                          {' to '}
                          {transfer.toOffice?.name ?? transfer.toDepartment?.name ?? 'New target'}
                        </strong>
                        <p>{transfer.reason}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}
            </>
          ) : <p className="text-sm">Select a concern.</p>}
        </aside>
      </div>
    </StudentWorkspaceShell>
  )
}
