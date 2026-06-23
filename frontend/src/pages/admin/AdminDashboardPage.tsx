import { adminWorkspaceConfig } from '../../features/admin'
import { RoleWorkspaceLayout } from '../../layouts/RoleWorkspaceLayout'

export function AdminDashboardPage() {
  return <RoleWorkspaceLayout config={adminWorkspaceConfig} />
}
