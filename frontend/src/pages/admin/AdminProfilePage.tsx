import { UserProfileView } from '@/features/profile'
import { AdminShell } from '@/features/admin/components/AdminShell'

export function AdminProfilePage() {
  return (
    <AdminShell activeSection="dashboard">
      <UserProfileView />
    </AdminShell>
  )
}
