import { ChevronUp, MapPin, Tag } from 'lucide-react'
import { useState } from 'react'
import type { StudentConcern } from '../studentData.types'
import { getConcernStatusClass } from '../studentUi'

type FeedConcernCardProps = {
  concern: StudentConcern
  onUp: (id: string) => Promise<void>
}

export function FeedConcernCard({ concern, onUp }: FeedConcernCardProps) {
  const [isReacting, setIsReacting] = useState(false)

  const handleUp = async () => {
    setIsReacting(true)
    try {
      await onUp(concern.id)
    } finally {
      setIsReacting(false)
    }
  }

  return (
    <article className="relative min-h-[150px] rounded-[5px] border border-[#295498]/70 bg-white px-4 pb-14 pt-4 shadow-[3px_3px_2.5px_1px_#1b3a6b] transition duration-200 hover:-translate-y-0.5 hover:shadow-[4px_5px_4px_1px_#1b3a6b] active:scale-[0.995] sm:min-h-[132px] sm:pb-12">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-[#1b3a6b]">
          <span>{concern.id}</span>
          <span className="inline-flex items-center gap-1 text-[#707070]">
            <MapPin aria-hidden="true" size={12} />
            {concern.location}
          </span>
          <span className="inline-flex items-center gap-1 text-[#707070]">
            <Tag aria-hidden="true" size={12} />
            {concern.category}
          </span>
        </div>

        <span
          className={`inline-flex min-h-[22px] items-center rounded-[5px] border px-3 text-[10px] font-semibold leading-none ${getConcernStatusClass(
            concern.status,
          )}`}
        >
          {concern.status}
        </span>
      </div>

      <h2 className="m-0 mt-3 text-[21px] font-semibold leading-tight text-[#101010] sm:text-[23px]">
        {concern.title}
      </h2>
      <p className="m-0 mt-2 max-w-[510px] text-[13px] font-light leading-[1.35] text-[#101010]">
        {concern.description}
      </p>

      <div className="absolute bottom-3 left-4 right-4 flex items-center gap-3">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#d9d9d9]">
          <span
            className="block h-full rounded-full bg-[#1b3a6b] transition-all duration-500"
            style={{ width: `${concern.progress}%` }}
          />
        </div>

        <button
          className="inline-flex h-[30px] min-w-[58px] items-center justify-center gap-1.5 rounded-[5px] bg-[#1b3a6b] px-3 text-[12px] font-semibold !text-white transition duration-200 hover:bg-[#295498] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9fbef1] active:scale-95 sm:min-w-[86px]"
          onClick={() => void handleUp()}
          type="button"
        >
          {isReacting ? (
            <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <>
              <ChevronUp aria-hidden="true" size={15} strokeWidth={2.4} />
              <span className="hidden sm:inline">up</span>
              <span>{concern.reactions}</span>
            </>
          )}
        </button>
      </div>
    </article>
  )
}
