import { officeWorkspaceConfig } from '../../features/office'
import { RoleWorkspaceLayout } from '../../layouts/RoleWorkspaceLayout'

export function OfficeDashboardPage() {
  return <RoleWorkspaceLayout config={officeWorkspaceConfig} />
}
