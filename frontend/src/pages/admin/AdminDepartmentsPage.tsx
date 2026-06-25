import { AdminDirectoryPage } from '@/features/admin/components/AdminDirectoryPage'

export function AdminDepartmentsPage() {
  return (
    <AdminDirectoryPage
      createLabel="Create Department"
      description="Manage academic departments, department-office credentials, and routing categories."
      section="departments"
      title="Departments"
    />
  )
}
