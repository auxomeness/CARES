import { UserProfileView } from '@/features/profile'
import { StaffWorkspaceShell } from '@/features/staff/components/StaffWorkspaceShell'
import { staffRoleConfigs } from '@/features/staff/staffData'

export function DepartmentProfilePage() {
  return (
    <StaffWorkspaceShell activeSection="dashboard" config={staffRoleConfigs.department}>
      <UserProfileView />
    </StaffWorkspaceShell>
  )
}
