import { AdminDirectoryPage } from '@/features/admin/components/AdminDirectoryPage'

export function AdminFacultyPage() {
  return (
    <AdminDirectoryPage
      createLabel="Create Faculty"
      description="Manage faculty profiles, department assignment, and faculty role access."
      section="faculty"
      title="Faculty"
    />
  )
}
