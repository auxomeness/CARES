import { Loader2, Save } from 'lucide-react'
import { type FormEvent, useMemo, useState } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import { getApiErrorMessage } from '@/lib/api'

function readableRole(role?: string) {
  return (role ?? 'User').replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function UserProfileView() {
  const { user, updateProfile } = useAuth()
  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [middleName, setMiddleName] = useState(user?.middleName ?? '')
  const [lastName, setLastName] = useState(user?.lastName ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [course, setCourse] = useState(user?.studentProfile?.course ?? '')
  const [yearLevel, setYearLevel] = useState(String(user?.studentProfile?.yearLevel ?? ''))
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [success, setSuccess] = useState('')

  const fullName = useMemo(
    () =>
      [user?.firstName, user?.middleName, user?.lastName]
        .filter(Boolean)
        .join(' ') || user?.name || 'CARES User',
    [user],
  )
  const isStudent = user?.role === 'STUDENT'
  const department =
    user?.studentProfile?.department?.name ??
    user?.facultyProfile?.department?.name ??
    user?.officeStaffProfile?.office?.name ??
    'Assigned by admin'

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setIsSaving(true)

    try {
      await updateProfile({
        email,
        firstName,
        middleName: middleName.trim() || undefined,
        lastName,
        ...(isStudent
          ? {
              course,
              yearLevel: Number(yearLevel),
            }
          : {}),
      })
      setSuccess('Profile updated successfully.')
    } catch (failure) {
      setError(getApiErrorMessage(failure))
    } finally {
      setIsSaving(false)
    }
  }

  if (!user) {
    return (
      <section className="rounded-[6px] border border-[#295498]/70 bg-white px-5 py-8 text-center shadow-[3px_3px_2.5px_1px_#1b3a6b]">
        <p className="m-0 text-sm text-[#434343]">No active user session.</p>
      </section>
    )
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
      <section>
        <p className="m-0 text-[12px] font-bold uppercase tracking-[0.08em] text-[#1b3a6b]">
          Account
        </p>
        <h1 className="m-0 mt-1 text-[36px] font-bold leading-tight text-[#1b3a6b] sm:text-[44px]">
          My Profile
        </h1>
        <p className="m-0 mt-2 max-w-[720px] text-[16px] font-light leading-snug text-[#434343]">
          Review your account details and update editable information. Role and assigned unit
          changes are managed by the administrator.
        </p>

        <form
          className="mt-8 rounded-[6px] border border-[#295498]/70 bg-white px-5 py-5 shadow-[3px_3px_2.5px_1px_#1b3a6b]"
          onSubmit={submit}
        >
          <h2 className="m-0 text-[22px] font-semibold text-[#1b3a6b]">Account Details</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-[12px] font-semibold text-[#1b3a6b]">
              First Name
              <input
                className="h-11 rounded-[5px] border border-[#7fa8de] bg-white px-3 text-[13px] outline-none focus:ring-2 focus:ring-[#9fbef1]"
                onChange={(event) => setFirstName(event.target.value)}
                value={firstName}
              />
            </label>
            <label className="grid gap-2 text-[12px] font-semibold text-[#1b3a6b]">
              Middle Name
              <input
                className="h-11 rounded-[5px] border border-[#7fa8de] bg-white px-3 text-[13px] outline-none focus:ring-2 focus:ring-[#9fbef1]"
                onChange={(event) => setMiddleName(event.target.value)}
                value={middleName ?? ''}
              />
            </label>
            <label className="grid gap-2 text-[12px] font-semibold text-[#1b3a6b]">
              Last Name
              <input
                className="h-11 rounded-[5px] border border-[#7fa8de] bg-white px-3 text-[13px] outline-none focus:ring-2 focus:ring-[#9fbef1]"
                onChange={(event) => setLastName(event.target.value)}
                value={lastName}
              />
            </label>
            <label className="grid gap-2 text-[12px] font-semibold text-[#1b3a6b]">
              Email
              <input
                className="h-11 rounded-[5px] border border-[#7fa8de] bg-white px-3 text-[13px] outline-none focus:ring-2 focus:ring-[#9fbef1]"
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                value={email}
              />
            </label>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-[12px] font-semibold text-[#1b3a6b]">
              Role
              <input
                className="h-11 rounded-[5px] border border-[#d6dce8] bg-[#edf4ff] px-3 text-[13px] text-[#434343]"
                disabled
                value={readableRole(user.role)}
              />
            </label>
            <label className="grid gap-2 text-[12px] font-semibold text-[#1b3a6b]">
              Assigned Unit
              <input
                className="h-11 rounded-[5px] border border-[#d6dce8] bg-[#edf4ff] px-3 text-[13px] text-[#434343]"
                disabled
                value={department}
              />
            </label>
          </div>

          {isStudent ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-[12px] font-semibold text-[#1b3a6b]">
                Course
                <input
                  className="h-11 rounded-[5px] border border-[#7fa8de] bg-white px-3 text-[13px] outline-none focus:ring-2 focus:ring-[#9fbef1]"
                  onChange={(event) => setCourse(event.target.value)}
                  value={course}
                />
              </label>
              <label className="grid gap-2 text-[12px] font-semibold text-[#1b3a6b]">
                Year Level
                <select
                  className="h-11 rounded-[5px] border border-[#7fa8de] bg-white px-3 text-[13px] outline-none focus:ring-2 focus:ring-[#9fbef1]"
                  onChange={(event) => setYearLevel(event.target.value)}
                  value={yearLevel}
                >
                  {[1, 2, 3, 4, 5].map((year) => (
                    <option key={year} value={year}>
                      Year {year}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : null}

          {error ? (
            <p className="m-0 mt-5 rounded-[5px] border border-[#8a1f1f] bg-[#f0d7d7] px-3 py-2 text-[12px] font-semibold text-[#8a1f1f]">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="m-0 mt-5 rounded-[5px] border border-[#70b77b] bg-[#cfead6] px-3 py-2 text-[12px] font-semibold text-[#1d6530]">
              {success}
            </p>
          ) : null}

          <button
            className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[5px] border border-[#1b3a6b] bg-[#1b3a6b] text-[13px] font-semibold !text-white transition duration-200 hover:bg-[#295498] active:scale-[0.98] sm:w-auto sm:px-6"
            disabled={isSaving}
            type="submit"
          >
            {isSaving ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : <Save size={16} />}
            Save Changes
          </button>
        </form>
      </section>

      <aside className="rounded-[12px] border border-[#1b3a6b] bg-[#c1d9ff] px-5 py-5 shadow-[0_4px_4px_0_#1b3a6b] xl:sticky xl:top-8">
        <div className="grid size-20 place-items-center rounded-full bg-white text-[26px] font-bold text-[#1b3a6b]">
          {fullName
            .split(' ')
            .map((part) => part[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()}
        </div>
        <h2 className="m-0 mt-4 text-[22px] font-semibold leading-tight text-[#1b3a6b]">
          {fullName}
        </h2>
        <p className="m-0 mt-1 text-[13px] font-semibold text-[#434343]">{readableRole(user.role)}</p>
        <dl className="mt-5 grid gap-3 text-[13px]">
          <div className="rounded-[5px] bg-white/55 px-3 py-2">
            <dt className="font-semibold text-[#1b3a6b]">Email</dt>
            <dd className="m-0 mt-1 leading-snug">{user.email}</dd>
          </div>
          <div className="rounded-[5px] bg-white/55 px-3 py-2">
            <dt className="font-semibold text-[#1b3a6b]">Assigned Unit</dt>
            <dd className="m-0 mt-1 leading-snug">{department}</dd>
          </div>
          <div className="rounded-[5px] bg-white/55 px-3 py-2">
            <dt className="font-semibold text-[#1b3a6b]">Role Access</dt>
            <dd className="m-0 mt-1 leading-snug">Role changes are admin-only.</dd>
          </div>
        </dl>
      </aside>
    </div>
  )
}
