import type { InputHTMLAttributes } from 'react'
import { Search } from 'lucide-react'

type SearchFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: string
  className?: string
  inputClassName?: string
}

export function SearchField({
  label = 'Search',
  className = '',
  inputClassName = '',
  ...inputProps
}: SearchFieldProps) {
  return (
    <label
      className={`relative block rounded-[29px] border border-[#1b3a6b] bg-white ${className}`}
    >
      <Search
        aria-hidden="true"
        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1b3a6b]"
        size={20}
        strokeWidth={2}
      />
      <span className="sr-only">{label}</span>
      <input
        className={`h-full w-full rounded-[29px] bg-transparent px-12 text-sm outline-none ${inputClassName}`}
        type="search"
        {...inputProps}
      />
    </label>
  )
}
