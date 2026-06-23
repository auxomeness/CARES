import { EyeOff } from 'lucide-react'
import type { AuthField as AuthFieldType } from '../types'

type AuthFieldProps = {
  field: AuthFieldType
}

export function AuthField({ field }: AuthFieldProps) {
  return (
    <label
      className="grid gap-[3px] text-[13px] font-bold leading-[1.2] tracking-[0.52px] text-[#1b3a6b] lg:gap-1 lg:text-[17px] lg:font-extrabold lg:tracking-[0.68px]"
      htmlFor={field.id}
    >
      <span>{field.label}</span>
      <span className="relative block">
        <input
          className="h-10 w-full rounded-[10px] border border-[#3875d7] bg-[#fefefe] px-[13px] py-[7px] pr-[42px] text-[16px] font-normal tracking-normal text-black outline-none focus:outline-2 focus:outline-offset-1 focus:outline-[#3875d7]/25 lg:bg-[#fff4f4]"
          autoComplete={field.autoComplete}
          id={field.id}
          name={field.id}
          type={field.type}
        />
        {field.type === 'password' ? (
          <button
            aria-label="Show password"
            className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 cursor-pointer place-items-center rounded-md border-0 bg-transparent p-0 text-[#1b3a6b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3875d7]"
            type="button"
          >
            <EyeOff aria-hidden="true" className="size-[15px] lg:size-5" strokeWidth={2.2} />
          </button>
        ) : null}
      </span>
    </label>
  )
}
