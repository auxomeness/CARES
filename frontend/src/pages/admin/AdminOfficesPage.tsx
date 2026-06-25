import { AdminDirectoryPage } from '@/features/admin/components/AdminDirectoryPage'

export function AdminOfficesPage() {
  return (
    <AdminDirectoryPage
      createLabel="Create Office"
      description="Manage operational offices, credentials, leads, and service categories."
      section="offices"
      title="Offices"
    />
  )
}
