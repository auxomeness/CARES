import { AdminDirectoryPage } from '@/features/admin/components/AdminDirectoryPage'
import { adminFaculty } from '@/features/admin/adminData'

export function AdminFacultyPage() {
  return (
    <AdminDirectoryPage
      createLabel="Create Faculty"
      description="Manage faculty profiles, department assignment, and faculty role access."
      initialItems={adminFaculty}
      section="faculty"
      title="Faculty"
    />
  )
}
