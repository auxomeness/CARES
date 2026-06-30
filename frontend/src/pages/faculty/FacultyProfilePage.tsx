import { UserProfileView } from '@/features/profile'
import { StaffWorkspaceShell } from '@/features/staff/components/StaffWorkspaceShell'
import { staffRoleConfigs } from '@/features/staff/staffData'

export function FacultyProfilePage() {
  return (
    <StaffWorkspaceShell activeSection="dashboard" config={staffRoleConfigs.faculty}>
      <UserProfileView />
    </StaffWorkspaceShell>
  )
}
