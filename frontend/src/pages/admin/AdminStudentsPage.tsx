import { AdminDirectoryPage } from '@/features/admin/components/AdminDirectoryPage'

export function AdminStudentsPage() {
  return (
    <AdminDirectoryPage
      createLabel="Create Student"
      description="Manage student accounts, academic profiles, and department assignments."
      section="students"
      title="Students"
    />
  )
}
