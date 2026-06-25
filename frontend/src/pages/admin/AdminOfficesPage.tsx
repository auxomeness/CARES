import { AdminDirectoryPage } from '@/features/admin/components/AdminDirectoryPage'
import { adminOffices } from '@/features/admin/adminData'

export function AdminOfficesPage() {
  return (
    <AdminDirectoryPage
      createLabel="Create Office"
      description="Manage operational offices, credentials, leads, and service categories."
      initialItems={adminOffices}
      section="offices"
      title="Offices"
    />
  )
}
