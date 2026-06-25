import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import type { AuthField as AuthFieldType } from '../types'

type AuthFieldProps = {
  field: AuthFieldType
  onChange: (id: string, value: string) => void
  value: string
}

export function AuthField({ field, onChange, value }: AuthFieldProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const isPassword = field.type === 'password'
  const inputType = isPassword && isPasswordVisible ? 'text' : field.type
  const VisibilityIcon = isPasswordVisible ? EyeOff : Eye

  return (
    <label
      className="grid gap-[5px] text-[12px] font-semibold leading-[1.2] tracking-[0.24px] text-[#1b3a6b] lg:text-[14px]"
      htmlFor={field.id}
    >
      <span>{field.label}</span>
      <span className="relative block">
        <input
          className="h-10 w-full rounded-[9px] border border-[#3875d7] bg-[#fefefe] px-[13px] py-[7px] pr-[42px] text-[15px] font-normal tracking-normal text-black outline-none transition duration-200 focus:border-[#1b3a6b] focus:outline-2 focus:outline-offset-1 focus:outline-[#3875d7]/25 lg:bg-[#fff4f4]"
          autoComplete={field.autoComplete}
          id={field.id}
          name={field.id}
          onChange={(event) => onChange(field.id, event.target.value)}
          type={inputType}
          value={value}
        />
        {isPassword ? (
          <button
            aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
            className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 cursor-pointer place-items-center rounded-md border-0 bg-transparent p-0 text-[#1b3a6b] transition duration-200 hover:bg-[#edf4ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3875d7] active:scale-95"
            onClick={() => setIsPasswordVisible((current) => !current)}
            type="button"
          >
            <VisibilityIcon aria-hidden="true" className="size-[17px]" strokeWidth={2.2} />
          </button>
        ) : null}
      </span>
    </label>
  )
}
