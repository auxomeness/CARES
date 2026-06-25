import { api } from '@/lib/api'
import type {
  ApiEnvelope,
  AppointmentRecord,
  ConcernRecord,
  DirectoryRecord,
  FacultyRecord,
  NotificationRecord,
  PaginatedEnvelope,
  StudentRecord,
} from '@/lib/apiTypes'

const list = async <T>(path: string, params?: object) =>
  (await api.get<PaginatedEnvelope<T>>(path, { params })).data

export const directoryApi = {
  offices: (params?: object) => list<DirectoryRecord>('/offices', params),
  office: async (id: string) =>
    (await api.get<ApiEnvelope<{ office: DirectoryRecord }>>(`/offices/${id}`)).data.data.office,
  departments: (params?: object) => list<DirectoryRecord>('/departments', params),
  department: async (id: string) =>
    (await api.get<ApiEnvelope<{ department: DirectoryRecord }>>(`/departments/${id}`)).data.data
      .department,
  faculty: (params?: object) => list<FacultyRecord>('/faculty', params),
  facultyMember: async (id: string) =>
    (await api.get<ApiEnvelope<{ faculty: FacultyRecord }>>(`/faculty/${id}`)).data.data.faculty,
  students: (params?: object) => list<StudentRecord>('/students', params),
}

export const concernApi = {
  list: (params?: object) => list<ConcernRecord>('/concerns', params),
  publicFeed: (params?: object) => list<ConcernRecord>('/concerns/public', params),
  detail: async (id: string) =>
    (await api.get<ApiEnvelope<{ concern: ConcernRecord }>>(`/concerns/${id}`)).data.data.concern,
  create: async (input: object) =>
    (await api.post<ApiEnvelope<{ concern: ConcernRecord }>>('/concerns', input)).data.data.concern,
  upload: async (id: string, image: File) => {
    const body = new FormData()
    body.append('image', image)
    return (await api.post(`/concerns/${id}/attachments`, body)).data
  },
  support: (id: string) => api.post(`/concerns/${id}/support`),
  status: (id: string, status: string) => api.patch(`/concerns/${id}/status`, { status }),
  transfer: (id: string, input: object) => api.post(`/concerns/${id}/transfer`, input),
  resolve: (id: string, input: object) => api.post(`/concerns/${id}/resolution`, input),
  confirm: (id: string) => api.post(`/concerns/${id}/confirm`),
  rejectResolution: (id: string, reason: string) =>
    api.post(`/concerns/${id}/reject`, { reason }),
}

export const appointmentApi = {
  list: (params?: object) => list<AppointmentRecord>('/appointments', params),
  detail: async (id: string) =>
    (await api.get<ApiEnvelope<{ appointment: AppointmentRecord }>>(`/appointments/${id}`)).data
      .data.appointment,
  create: async (input: object) =>
    (await api.post<ApiEnvelope<{ appointment: AppointmentRecord }>>('/appointments', input)).data
      .data.appointment,
  approve: (id: string) => api.patch(`/appointments/${id}/approve`),
  reject: (id: string, reason: string) => api.patch(`/appointments/${id}/reject`, { reason }),
  cancel: (id: string) => api.patch(`/appointments/${id}/cancel`),
  reschedule: (id: string, input: object) => api.post(`/appointments/${id}/reschedule`, input),
  complete: (id: string) => api.patch(`/appointments/${id}/complete`),
  availability: async (ownerId: string, targetType?: string) =>
    (await api.get(`/availability/${ownerId}`, { params: { targetType } })).data,
  slots: async (ownerId: string, targetType: string, date: string) =>
    (
      await api.get(`/availability/${ownerId}/slots`, {
        params: { targetType, date },
      })
    ).data,
  createAvailability: (input: object) => api.post('/availability', input),
}

export const notificationApi = {
  list: (params?: object) => list<NotificationRecord>('/notifications', params),
  read: (id: string) => api.patch(`/notifications/${id}/read`),
  unread: (id: string) => api.patch(`/notifications/${id}/unread`),
  readAll: () => api.patch('/notifications/read-all'),
  remove: (id: string) => api.delete(`/notifications/${id}`),
}

export const adminApi = {
  createOffice: (input: object) => api.post('/offices', input),
  updateOffice: (id: string, input: object) => api.put(`/offices/${id}`, input),
  deleteOffice: (id: string) => api.delete(`/offices/${id}`),
  createDepartment: (input: object) => api.post('/departments', input),
  updateDepartment: (id: string, input: object) => api.put(`/departments/${id}`, input),
  deleteDepartment: (id: string) => api.delete(`/departments/${id}`),
  createFaculty: (input: object) => api.post('/faculty', input),
  updateFaculty: (id: string, input: object) => api.put(`/faculty/${id}`, input),
  deleteFaculty: (id: string) => api.delete(`/faculty/${id}`),
  createStudent: (input: object) => api.post('/students', input),
  updateStudent: (id: string, input: object) => api.put(`/students/${id}`, input),
  deleteStudent: (id: string) => api.delete(`/students/${id}`),
}
