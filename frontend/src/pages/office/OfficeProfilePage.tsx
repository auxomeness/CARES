import { UserProfileView } from '@/features/profile'
import { StaffWorkspaceShell } from '@/features/staff/components/StaffWorkspaceShell'
import { staffRoleConfigs } from '@/features/staff/staffData'

export function OfficeProfilePage() {
  return (
    <StaffWorkspaceShell activeSection="dashboard" config={staffRoleConfigs.office}>
      <UserProfileView />
    </StaffWorkspaceShell>
  )
}
