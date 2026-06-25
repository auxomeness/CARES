import { AdminDirectoryPage } from '@/features/admin/components/AdminDirectoryPage'
import { adminDepartments } from '@/features/admin/adminData'

export function AdminDepartmentsPage() {
  return (
    <AdminDirectoryPage
      createLabel="Create Department"
      description="Manage academic departments, department-office credentials, and routing categories."
      initialItems={adminDepartments}
      section="departments"
      title="Departments"
    />
  )
}
