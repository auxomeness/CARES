import type { AppointmentStatus, ConcernStatus } from './studentData.types'

export function getConcernStatusClass(status: ConcernStatus) {
  switch (status) {
    case 'For Approval':
      return 'bg-[#f5d788] text-[#1b3a6b] border-[#d4a017]'
    case 'Pending':
      return 'bg-[#ffe0b5] text-[#7a4300] border-[#d38a22]'
    case 'Approved':
      return 'bg-[#c1d9ff] text-[#1b3a6b] border-[#7fa8de]'
    case 'Completed':
      return 'bg-[#cfead6] text-[#1d6530] border-[#70b77b]'
  }
}

export function getAppointmentStatusClass(status: AppointmentStatus) {
  switch (status) {
    case 'Pending':
      return 'bg-[#ffe0b5] text-[#7a4300] border-[#d38a22]'
    case 'Approved':
      return 'bg-[#c1d9ff] text-[#1b3a6b] border-[#7fa8de]'
    case 'Completed':
      return 'bg-[#cfead6] text-[#1d6530] border-[#70b77b]'
    case 'Cancelled':
      return 'bg-[#f0d7d7] text-[#8a1f1f] border-[#ca7777]'
  }
}
