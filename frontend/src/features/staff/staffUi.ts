import type { StaffAppointmentStatus, StaffConcernStatus } from './staffData'

export function getStaffStatusClass(status: StaffConcernStatus | StaffAppointmentStatus) {
  switch (status) {
    case 'New':
    case 'Requested':
      return 'border-[#d4a017] bg-[#f5d788] text-[#1b3a6b]'
    case 'Acknowledged':
    case 'Verified':
      return 'border-[#7fa8de] bg-[#c1d9ff] text-[#1b3a6b]'
    case 'Investigating':
    case 'Approved':
      return 'border-[#295498] bg-[#edf4ff] text-[#1b3a6b]'
    case 'Transferred':
      return 'border-[#d38a22] bg-[#ffe0b5] text-[#7a4300]'
    case 'Resolved':
    case 'Completed':
      return 'border-[#70b77b] bg-[#cfead6] text-[#1d6530]'
    case 'Declined':
      return 'border-[#ca7777] bg-[#f0d7d7] text-[#8a1f1f]'
  }
}
