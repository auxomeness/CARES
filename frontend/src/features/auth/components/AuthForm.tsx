import { Loader2 } from 'lucide-react'
import { type FormEvent, useMemo, useState } from 'react'
import { authRoleCredentials } from '../auth.config'
import type { AuthMode, AuthModeConfig } from '../types'
import { AuthField } from './AuthField'
import { AuthOptions } from './AuthOptions'

type AuthFormProps = {
  config: AuthModeConfig
  mode: AuthMode
  onModeChange: (mode: AuthMode) => void
}

export function AuthForm({ config, mode, onModeChange }: AuthFormProps) {
  const isRegister = mode === 'register'
  const switchLink = config.switchLink
  const [values, setValues] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const normalizedUsername = values.username?.trim().toLowerCase() ?? ''
  const matchedRole = useMemo(
    () => authRoleCredentials.find((credential) => credential.username === normalizedUsername),
    [normalizedUsername],
  )

  const updateField = (id: string, value: string) => {
    setValues((currentValues) => ({ ...currentValues, [id]: value }))
    setError('')
  }

  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isRegister) {
      setIsSubmitting(true)
      window.setTimeout(() => {
        setIsSubmitting(false)
        onModeChange('login')
      }, 700)
      return
    }

    if (!matchedRole) {
      setError('Use a role username: student, office, department, faculty, or admin.')
      return
    }

    setIsSubmitting(true)

    window.setTimeout(() => {
      window.location.hash = matchedRole.route
      setIsSubmitting(false)
    }, 850)
  }

  return (
    <form
      className={`mt-0 w-[298px] max-w-full lg:w-auto ${
        isRegister ? 'lg:mt-[23px]' : 'lg:mt-10'
      }`}
      onSubmit={submitForm}
    >
      <div className={`grid ${isRegister ? 'gap-[25px] lg:gap-[17px]' : 'gap-[30px]'}`}>
        {config.fields.map((field) => (
          <AuthField
            field={field}
            key={field.id}
            onChange={updateField}
            value={values[field.id] ?? ''}
          />
        ))}
      </div>

      <AuthOptions mode={mode} />

      {error ? (
        <p className="m-0 mt-3 rounded-[7px] border border-[#8a1f1f] bg-[#f0d7d7] px-3 py-2 text-[11px] font-semibold leading-snug text-[#8a1f1f]">
          {error}
        </p>
      ) : null}

      <button
        className={`relative block h-10 w-full cursor-pointer overflow-hidden rounded-[10px] border-0 bg-[#1b3a6b] text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#295498] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3875d7] active:scale-[0.98] disabled:cursor-wait disabled:opacity-85 ${
          isRegister
            ? 'mt-[24px] text-[16px] font-extrabold leading-none tracking-[1.8px] lg:mt-[24px]'
            : 'mt-[24px] text-[18px] font-extrabold leading-none tracking-[1.8px] lg:mt-[24px]'
        }`}
        disabled={isSubmitting}
        type="submit"
      >
        <span className={`inline-flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-0' : ''}`}>
          {config.action}
        </span>
        {isSubmitting ? (
          <span className="absolute inset-0 grid place-items-center" role="status">
            <span className="inline-flex items-center gap-2 text-[12px] tracking-normal">
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              Loading workspace
            </span>
          </span>
        ) : null}
      </button>

      {switchLink ? (
        <button
          className="mx-auto mt-[15px] block cursor-pointer border-0 bg-transparent p-0 text-center text-[12px] font-medium leading-none tracking-[0.48px] text-[#1b3a6b] lg:text-[13px] lg:tracking-[0.52px]"
          onClick={() => onModeChange(switchLink.target)}
          type="button"
        >
          {switchLink.label} <span className="font-extrabold">{switchLink.action}</span>
        </button>
      ) : null}
    </form>
  )
}
