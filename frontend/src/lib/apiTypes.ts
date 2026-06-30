import type { BackendRole } from '@/types/roles'

export type ApiEnvelope<T> = {
  success: true
  message: string
  data: T
}

export type PaginatedEnvelope<T> = {
  success: true
  message: string
  data: T[]
  meta: { page: number; limit: number; total: number; unread?: number }
}

export type BootstrapPage<T> = {
  data: T[]
  meta: { page: number; limit: number; total: number; unread?: number }
}

export type BootstrapPayload = {
  user: UserProfile
  notifications?: BootstrapPage<NotificationRecord>
  concerns?: BootstrapPage<ConcernRecord>
  publicConcerns?: BootstrapPage<ConcernRecord>
  appointments?: BootstrapPage<AppointmentRecord>
  directory?: {
    offices?: BootstrapPage<DirectoryRecord>
    departments?: BootstrapPage<DirectoryRecord>
    faculty?: BootstrapPage<FacultyRecord>
  }
}

export type UserProfile = {
  id: string
  email: string
  firstName?: string
  middleName?: string | null
  lastName?: string
  name?: string
  role: BackendRole
  isActive: boolean
  studentProfile?: {
    id: string
    studentId: string
    course: string
    yearLevel: number
    department: DirectoryRecord
  } | null
  facultyProfile?: {
    id: string
    employeeId: string
    position: string
    department: DirectoryRecord
  } | null
  officeStaffProfile?: {
    id: string
    office: DirectoryRecord
  } | null
}

export type DirectoryRecord = {
  id: string
  name: string
  description?: string | null
  email?: string | null
  location?: string | null
}

export type FacultyRecord = {
  id: string
  employeeId?: string
  position: 'DEAN' | 'CHAIR' | 'PROFESSOR'
  user?: {
    id: string
    email: string
    firstName: string
    middleName?: string | null
    lastName: string
  }
  name?: string
  department: DirectoryRecord | string
  departmentId?: string
}

export type StudentRecord = {
  id: string
  studentId: string
  course: string
  yearLevel: number
  departmentId?: string
  department: DirectoryRecord
  user: {
    id: string
    email: string
    firstName: string
    middleName?: string | null
    lastName: string
    isActive: boolean
  }
}

export type ConcernRecord = {
  id: string
  referenceNumber: string
  title: string
  description: string
  status: string
  visibility: 'PUBLIC' | 'PRIVATE'
  targetType: 'OFFICE' | 'DEPARTMENT'
  targetOffice?: DirectoryRecord | null
  targetDepartment?: DirectoryRecord | null
  createdAt: string
  updatedAt: string
  submittedBy?: {
    user: {
      firstName: string
      middleName?: string | null
      lastName: string
      email: string
    }
    department: DirectoryRecord
  }
  attachments?: Array<{ id: string; fileName: string; fileUrl: string; uploadedAt: string }>
  timeline?: Array<{
    id: string
    eventType: string
    description: string
    createdAt: string
    actor: { firstName: string; lastName: string }
  }>
  transfers?: Array<{
    id: string
    reason: string
    createdAt: string
    fromOffice?: DirectoryRecord | null
    fromDepartment?: DirectoryRecord | null
    toOffice?: DirectoryRecord | null
    toDepartment?: DirectoryRecord | null
    transferredBy: { firstName: string; lastName: string }
  }>
  resolutionReport?: {
    summary: string
    actionsTaken: string
    evidenceUrl?: string | null
    resolvedAt: string
  } | null
  _count?: { supports: number; attachments: number }
}

export type AppointmentRecord = {
  id: string
  title: string
  description?: string | null
  status: string
  targetType: 'OFFICE' | 'DEPARTMENT' | 'PROFESSOR'
  office?: DirectoryRecord | null
  department?: DirectoryRecord | null
  faculty?: FacultyRecord | null
  student?: {
    studentId: string
    user: { firstName: string; middleName?: string | null; lastName: string; email: string }
  }
  startTime: string
  endTime: string
  rejectionReason?: string | null
  reschedules?: Array<{
    id: string
    oldStartTime: string
    newStartTime: string
    reason: string
  }>
}

export type NotificationRecord = {
  id: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
}
