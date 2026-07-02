import { Loader2, Pencil, Plus, Save, Trash2 } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { type FormEvent, useState } from 'react'
import { getApiErrorMessage } from '@/lib/api'
import type { DirectoryRecord, FacultyRecord, PaginatedEnvelope, StudentRecord } from '@/lib/apiTypes'
import { queryKeys } from '@/lib/queryKeys'
import { adminApi, directoryApi } from '@/services/caresApi'
import type { AdminSection } from '../adminData'
import { AdminShell } from './AdminShell'

type Props = {
  createLabel: string
  description: string
  section: Exclude<AdminSection, 'dashboard'>
  title: string
}

export function AdminDirectoryPage({ createLabel, description, section, title }: Props) {
  const queryClient = useQueryClient()
  const departments = useQuery({
    queryKey: queryKeys.directory.form('department'),
    queryFn: () => directoryApi.departments({ page: 1, limit: 100 }),
  })
  const records = useQuery<PaginatedEnvelope<DirectoryRecord | FacultyRecord | StudentRecord>>({
    queryKey: queryKeys.directory.admin(section),
    queryFn: async () => {
      if (section === 'offices') return directoryApi.offices({ page: 1, limit: 100 })
      if (section === 'departments') return directoryApi.departments({ page: 1, limit: 100 })
      if (section === 'faculty') return directoryApi.faculty({ page: 1, limit: 100 })
      return directoryApi.students({ page: 1, limit: 100 })
    },
  })
  const [selectedId, setSelectedId] = useState('')
  const [form, setForm] = useState<Record<string, string>>({
    name: '',
    email: '',
    location: '',
    description: '',
    firstName: '',
    lastName: '',
    employeeId: '',
    studentId: '',
    course: '',
    yearLevel: '1',
    position: 'PROFESSOR',
    departmentId: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [pendingAction, setPendingAction] = useState('')
  const [edit, setEdit] = useState<Record<string, string> | null>(null)
  const selected = records.data?.data.find((item) => item?.id === selectedId) ?? records.data?.data[0]

  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.directory.admin(section) })
  const set = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }))

  const create = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setNotice('')
    setPendingAction('create')
    try {
      if (section === 'offices') {
        await adminApi.createOffice({
          name: form.name,
          email: form.email,
          location: form.location,
          description: form.description,
        })
      } else if (section === 'departments') {
        await adminApi.createDepartment({
          name: form.name,
          email: form.email,
          location: form.location,
          description: form.description,
        })
      } else if (section === 'faculty') {
        await adminApi.createFaculty({
          email: form.email,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
          employeeId: form.employeeId,
          position: form.position,
          departmentId: form.departmentId || departments.data?.data[0]?.id,
        })
      } else {
        await adminApi.createStudent({
          email: form.email,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
          studentId: form.studentId,
          course: form.course,
          yearLevel: Number(form.yearLevel),
          departmentId: form.departmentId || departments.data?.data[0]?.id,
        })
      }
      setForm((current) => Object.fromEntries(Object.keys(current).map((key) => [key, key === 'position' ? 'PROFESSOR' : ''])))
      await refresh()
      setNotice(`${createLabel} created successfully.`)
    } catch (failure) {
      setError(getApiErrorMessage(failure))
    } finally {
      setPendingAction('')
    }
  }

  const remove = async () => {
    if (!selected) return
    setError('')
    setNotice('')
    setPendingAction('delete')
    try {
      if (section === 'offices') await adminApi.deleteOffice(selected.id)
      else if (section === 'departments') await adminApi.deleteDepartment(selected.id)
      else if (section === 'faculty') await adminApi.deleteFaculty(selected.id)
      else await adminApi.deleteStudent(selected.id)
      setSelectedId('')
      await refresh()
      setNotice('Selected record was removed.')
    } catch (failure) {
      setError(getApiErrorMessage(failure))
    } finally {
      setPendingAction('')
    }
  }

  const beginEdit = () => {
    if (!selected) return
    if ('position' in selected) {
      setEdit({
        email: selected.user?.email ?? '',
        firstName: selected.user?.firstName ?? '',
        lastName: selected.user?.lastName ?? '',
        employeeId: selected.employeeId ?? '',
        position: selected.position,
        departmentId:
          selected.departmentId ??
          (typeof selected.department === 'string' ? '' : selected.department.id),
      })
      return
    }
    if ('studentId' in selected) {
      setEdit({
        email: selected.user.email,
        firstName: selected.user.firstName,
        lastName: selected.user.lastName,
        studentId: selected.studentId,
        course: selected.course,
        yearLevel: String(selected.yearLevel),
        departmentId: selected.departmentId ?? selected.department.id,
      })
      return
    }
    setEdit({
      name: selected.name,
      email: selected.email ?? '',
      location: selected.location ?? '',
      description: selected.description ?? '',
    })
  }

  const update = async (event: FormEvent) => {
    event.preventDefault()
    if (!selected || !edit) return
    setError('')
    setNotice('')
    setPendingAction('update')
    try {
      if (section === 'offices') await adminApi.updateOffice(selected.id, edit)
      else if (section === 'departments') await adminApi.updateDepartment(selected.id, edit)
      else if (section === 'faculty') await adminApi.updateFaculty(selected.id, edit)
      else await adminApi.updateStudent(selected.id, { ...edit, yearLevel: Number(edit.yearLevel) })
      setEdit(null)
      await refresh()
      setNotice('Selected record was updated.')
    } catch (failure) {
      setError(getApiErrorMessage(failure))
    } finally {
      setPendingAction('')
    }
  }

  return (
    <AdminShell activeSection={section}>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
        <section>
          <h1 className="text-4xl font-bold text-[#1b3a6b]">{title}</h1>
          <p className="mt-2 text-[#434343]">{description}</p>
          {records.isLoading ? <p className="mt-8 text-sm">Loading records...</p> : null}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {records.data?.data.map((item) => {
              const faculty = 'position' in item
              const student = 'studentId' in item
              const name = faculty || student ? `${item.user?.firstName ?? ''} ${item.user?.lastName ?? ''}` : item.name
              const detail = faculty
                ? `${item.position} - ${typeof item.department === 'string' ? item.department : item.department.name}`
                : student
                  ? `${item.studentId} - ${item.course} - Year ${item.yearLevel}`
                : item.email || item.location
              return (
                <button className={`rounded border p-4 text-left shadow-[3px_3px_2.5px_1px_#1b3a6b] transition duration-200 hover:-translate-y-0.5 hover:shadow-[4px_5px_4px_1px_#1b3a6b] ${selected?.id === item.id ? 'bg-[#c1d9ff]' : 'bg-white'}`} key={item.id} onClick={() => setSelectedId(item.id)} type="button">
                  <p className="text-xs font-semibold text-[#1b3a6b]">{item.id}</p>
                  <h2 className="mt-2 text-xl font-semibold">{name}</h2>
                  <p className="mt-2 text-sm">{detail}</p>
                </button>
              )
            })}
          </div>
        </section>
        <aside className="grid h-fit gap-5">
          <form className="grid gap-3 rounded border border-[#1b3a6b] bg-white p-5 shadow-[3px_3px_2.5px_1px_#1b3a6b]" onSubmit={create}>
            <h2 className="text-xl font-semibold text-[#1b3a6b]">{createLabel}</h2>
            {section === 'faculty' || section === 'students' ? (
              <>
                <input className="h-10 rounded border px-3 text-sm" onChange={(e) => set('firstName', e.target.value)} placeholder="First name" required value={form.firstName} />
                <input className="h-10 rounded border px-3 text-sm" onChange={(e) => set('lastName', e.target.value)} placeholder="Last name" required value={form.lastName} />
                {section === 'faculty' ? (
                  <>
                    <input className="h-10 rounded border px-3 text-sm" onChange={(e) => set('employeeId', e.target.value)} placeholder="Employee ID" required value={form.employeeId} />
                    <select className="h-10 rounded border px-3 text-sm" onChange={(e) => set('position', e.target.value)} value={form.position}><option>PROFESSOR</option><option>CHAIR</option><option>DEAN</option></select>
                  </>
                ) : (
                  <>
                    <input className="h-10 rounded border px-3 text-sm" onChange={(e) => set('studentId', e.target.value)} placeholder="Student ID" required value={form.studentId} />
                    <input className="h-10 rounded border px-3 text-sm" onChange={(e) => set('course', e.target.value)} placeholder="Course" required value={form.course} />
                    <input className="h-10 rounded border px-3 text-sm" min={1} onChange={(e) => set('yearLevel', e.target.value)} placeholder="Year level" required type="number" value={form.yearLevel} />
                  </>
                )}
                <select className="h-10 rounded border px-3 text-sm" onChange={(e) => set('departmentId', e.target.value)} required value={form.departmentId || departments.data?.data[0]?.id || ''}>{departments.data?.data.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</select>
                <input className="h-10 rounded border px-3 text-sm" minLength={12} onChange={(e) => set('password', e.target.value)} placeholder="Initial password" required type="password" value={form.password} />
              </>
            ) : (
              <>
                <input className="h-10 rounded border px-3 text-sm" onChange={(e) => set('name', e.target.value)} placeholder="Name" required value={form.name} />
                <input className="h-10 rounded border px-3 text-sm" onChange={(e) => set('location', e.target.value)} placeholder="Location" value={form.location} />
                <textarea className="min-h-20 rounded border px-3 py-2 text-sm" onChange={(e) => set('description', e.target.value)} placeholder="Description" value={form.description} />
              </>
            )}
            <input className="h-10 rounded border px-3 text-sm" onChange={(e) => set('email', e.target.value)} placeholder="Email" required type="email" value={form.email} />
            {notice ? <p className="rounded bg-green-50 px-3 py-2 text-xs font-semibold text-green-700">{notice}</p> : null}
            {error ? <p className="rounded bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{error}</p> : null}
            <button className="inline-flex h-10 items-center justify-center gap-2 rounded bg-[#1b3a6b] text-sm font-semibold !text-white disabled:opacity-70" disabled={Boolean(pendingAction)} type="submit">
              {pendingAction === 'create' ? <Loader2 className="animate-spin" size={15} /> : <Plus size={15} />} Create
            </button>
          </form>
          <section className="rounded border border-[#1b3a6b] bg-white p-5 shadow-[3px_3px_2.5px_1px_#1b3a6b]">
            <h2 className="text-xl font-semibold text-[#1b3a6b]">Selected Record</h2>
            {selected ? (
              <div className="mt-5 grid gap-3">
                {edit ? (
                  <form className="grid gap-3" onSubmit={update}>
                    {section === 'faculty' || section === 'students' ? (
                      <>
                        <input className="h-10 rounded border px-3 text-sm" onChange={(event) => setEdit({ ...edit, firstName: event.target.value })} placeholder="First name" required value={edit.firstName} />
                        <input className="h-10 rounded border px-3 text-sm" onChange={(event) => setEdit({ ...edit, lastName: event.target.value })} placeholder="Last name" required value={edit.lastName} />
                        {section === 'faculty' ? (
                          <>
                            <input className="h-10 rounded border px-3 text-sm" onChange={(event) => setEdit({ ...edit, employeeId: event.target.value })} placeholder="Employee ID" required value={edit.employeeId} />
                            <select className="h-10 rounded border px-3 text-sm" onChange={(event) => setEdit({ ...edit, position: event.target.value })} value={edit.position}><option>PROFESSOR</option><option>CHAIR</option><option>DEAN</option></select>
                          </>
                        ) : (
                          <>
                            <input className="h-10 rounded border px-3 text-sm" onChange={(event) => setEdit({ ...edit, studentId: event.target.value })} placeholder="Student ID" required value={edit.studentId} />
                            <input className="h-10 rounded border px-3 text-sm" onChange={(event) => setEdit({ ...edit, course: event.target.value })} placeholder="Course" required value={edit.course} />
                            <input className="h-10 rounded border px-3 text-sm" min={1} onChange={(event) => setEdit({ ...edit, yearLevel: event.target.value })} placeholder="Year level" required type="number" value={edit.yearLevel} />
                          </>
                        )}
                        <select className="h-10 rounded border px-3 text-sm" onChange={(event) => setEdit({ ...edit, departmentId: event.target.value })} required value={edit.departmentId}>{departments.data?.data.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</select>
                      </>
                    ) : (
                      <>
                        <input className="h-10 rounded border px-3 text-sm" onChange={(event) => setEdit({ ...edit, name: event.target.value })} placeholder="Name" required value={edit.name} />
                        <input className="h-10 rounded border px-3 text-sm" onChange={(event) => setEdit({ ...edit, location: event.target.value })} placeholder="Location" value={edit.location} />
                        <textarea className="min-h-20 rounded border px-3 py-2 text-sm" onChange={(event) => setEdit({ ...edit, description: event.target.value })} placeholder="Description" value={edit.description} />
                      </>
                    )}
                    <input className="h-10 rounded border px-3 text-sm" onChange={(event) => setEdit({ ...edit, email: event.target.value })} placeholder="Email" required type="email" value={edit.email} />
                    <button className="inline-flex h-10 items-center justify-center gap-2 rounded bg-[#1b3a6b] text-sm font-semibold !text-white disabled:opacity-70" disabled={Boolean(pendingAction)} type="submit">
                      {pendingAction === 'update' ? <Loader2 className="animate-spin" size={15} /> : <Save size={15} />} Save Changes
                    </button>
                    <button className="h-9 text-sm font-semibold text-[#434343]" onClick={() => setEdit(null)} type="button">Cancel Edit</button>
                  </form>
                ) : (
                  <button className="inline-flex h-10 w-full items-center justify-center gap-2 rounded border border-[#1b3a6b] text-sm font-semibold text-[#1b3a6b]" onClick={beginEdit} type="button"><Pencil size={15} /> Edit</button>
                )}
                <button className="inline-flex h-10 w-full items-center justify-center gap-2 rounded border border-red-700 text-sm font-semibold text-red-700 disabled:opacity-60" disabled={Boolean(pendingAction)} onClick={() => void remove()} type="button">
                  {pendingAction === 'delete' ? <Loader2 className="animate-spin" size={15} /> : <Trash2 size={15} />} Deactivate / Delete
                </button>
              </div>
            ) : <p className="mt-3 text-sm">No record selected.</p>}
          </section>
        </aside>
      </div>
    </AdminShell>
  )
}
