import { studentWorkspaceConfig } from '../../features/student'
import { RoleWorkspaceLayout } from '../../layouts/RoleWorkspaceLayout'

export function StudentDashboardPage() {
  return <RoleWorkspaceLayout config={studentWorkspaceConfig} />
}
