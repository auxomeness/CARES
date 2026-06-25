import { useQuery } from '@tanstack/react-query'
import { directoryApi } from '@/services/caresApi'
import { staffRoleConfigs } from '../staffData'
import { StaffWorkspaceShell } from './StaffWorkspaceShell'

export function StaffDirectory() {
  const faculty = useQuery({
    queryKey: ['faculty', 'department-scope'],
    queryFn: () => directoryApi.faculty({ page: 1, limit: 100 }),
  })
  const students = useQuery({
    queryKey: ['students', 'department-scope'],
    queryFn: () => directoryApi.students({ page: 1, limit: 100 }),
  })

  return (
    <StaffWorkspaceShell activeSection="directory" config={staffRoleConfigs.department}>
      <h1 className="text-4xl font-bold text-[#1b3a6b]">Department Directory</h1>
      <p className="mt-2 text-[#434343]">
        Faculty and students are automatically limited to your assigned department.
      </p>
      <div className="mt-8 grid gap-8 xl:grid-cols-2">
        <section>
          <h2 className="text-xl font-semibold text-[#1b3a6b]">Faculty</h2>
          {faculty.isLoading ? <p className="mt-4 text-sm">Loading faculty...</p> : null}
          <div className="mt-4 grid gap-3">
            {faculty.data?.data.map((member) => (
              <article className="rounded border bg-white p-4 shadow-[3px_3px_2.5px_1px_#1b3a6b]" key={member.id}>
                <h3 className="font-semibold">
                  {member.user?.firstName} {member.user?.lastName}
                </h3>
                <p className="mt-1 text-sm">{member.position} · {member.employeeId}</p>
              </article>
            ))}
          </div>
          {!faculty.isLoading && !faculty.data?.data.length ? <p className="mt-4 text-sm">No faculty records.</p> : null}
        </section>
        <section>
          <h2 className="text-xl font-semibold text-[#1b3a6b]">Students</h2>
          {students.isLoading ? <p className="mt-4 text-sm">Loading students...</p> : null}
          <div className="mt-4 grid gap-3">
            {students.data?.data.map((student) => (
              <article className="rounded border bg-white p-4 shadow-[3px_3px_2.5px_1px_#1b3a6b]" key={student.id}>
                <h3 className="font-semibold">{student.user.firstName} {student.user.lastName}</h3>
                <p className="mt-1 text-sm">{student.studentId} · {student.course} · Year {student.yearLevel}</p>
              </article>
            ))}
          </div>
          {!students.isLoading && !students.data?.data.length ? <p className="mt-4 text-sm">No student records.</p> : null}
        </section>
      </div>
    </StaffWorkspaceShell>
  )
}
