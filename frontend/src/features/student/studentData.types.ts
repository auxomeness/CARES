export type ConcernStatus = 'For Approval' | 'Pending' | 'Approved' | 'Completed'

export type ConcernVisibility = 'public' | 'private'

export type ConcernCategory =
  | 'Facilities'
  | 'Student Services'
  | 'Safety'
  | 'Academic'
  | 'Campus Life'

export type StudentConcern = {
  id: string
  apiId?: string
  title: string
  description: string
  category: ConcernCategory
  location: string
  status: ConcernStatus
  visibility: ConcernVisibility
  anonymous: boolean
  author: string
  createdAt: string
  reactions: number
  progress: number
  backendStatus?: string
  detail?: import('@/lib/apiTypes').ConcernRecord
}

export type ConcernInput = {
  title: string
  description: string
  visibility: ConcernVisibility
  targetType: 'OFFICE' | 'DEPARTMENT'
  targetOfficeId?: string | null
  targetDepartmentId?: string | null
  image?: File | null
  onUploadProgress?: (percent: number) => void
}

export type AppointmentMode = 'office' | 'department'

export type AppointmentStatus = 'Pending' | 'Approved' | 'Completed' | 'Cancelled'

export type StudentAppointment = {
  id: string
  mode: AppointmentMode
  office: string
  department?: string
  faculty?: string
  date: string
  time: string
  purpose: string
  consultationCategory: string
  description: string
  status: AppointmentStatus
  createdAt: string
  backendStatus?: string
  detail?: import('@/lib/apiTypes').AppointmentRecord
}

export type AppointmentInput = {
  mode: AppointmentMode
  office: string
  department?: string
  faculty?: string
  date: string
  time: string
  purpose: string
  consultationCategory: string
  description: string
  targetType?: 'OFFICE' | 'DEPARTMENT' | 'PROFESSOR'
  officeId?: string | null
  departmentId?: string | null
  facultyId?: string | null
  startTime?: string
  endTime?: string
}
