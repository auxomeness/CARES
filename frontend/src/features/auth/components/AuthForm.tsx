import { Loader2 } from 'lucide-react'
import { type FormEvent, useEffect, useState } from 'react'
import { useAuth } from '../AuthContext'
import { authApi } from '../auth.api'
import type { DirectoryRecord } from '@/lib/apiTypes'
import { getApiErrorMessage } from '@/lib/api'
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
  const [departments, setDepartments] = useState<DirectoryRecord[]>([])
  const { login, register } = useAuth()

  useEffect(() => {
    if (isRegister) {
      void authApi.departments().then(setDepartments).catch(() => setDepartments([]))
    }
  }, [isRegister])

  const updateField = (id: string, value: string) => {
    setValues((currentValues) => ({ ...currentValues, [id]: value }))
    setError('')
  }

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      if (isRegister) {
        const departmentId = values.departmentId || departments[0]?.id
        if (!departmentId) throw new Error('Choose an academic department.')
        await register({
          email: values.email ?? '',
          password: values.password ?? '',
          firstName: values.firstName ?? '',
          lastName: values.lastName ?? '',
          studentId: values.studentId ?? '',
          course: values.course ?? '',
          yearLevel: Number(values.yearLevel),
          departmentId,
        })
      } else {
        await login({ email: values.email ?? '', password: values.password ?? '' })
      }
    } catch (submitError) {
      setError(getApiErrorMessage(submitError))
    } finally {
      setIsSubmitting(false)
    }
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
        {isRegister ? (
          <label className="grid gap-2 text-[12px] font-semibold text-[#1b3a6b]">
            Department
            <select
              className="h-10 rounded-[10px] border border-[#7fa8de] bg-white px-3 text-[13px]"
              onChange={(event) => updateField('departmentId', event.target.value)}
              required
              value={values.departmentId ?? departments[0]?.id ?? ''}
            >
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
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
              {isRegister ? 'Creating account' : 'Signing in'}
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
