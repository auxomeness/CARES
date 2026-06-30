import { UserProfileView } from '@/features/profile'
import { StudentWorkspaceShell } from '@/features/student/components/StudentWorkspaceShell'

export function StudentProfilePage() {
  return (
    <StudentWorkspaceShell activeSection="profile" contentClassName="max-w-none">
      <UserProfileView />
    </StudentWorkspaceShell>
  )
}
