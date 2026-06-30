import { api } from '@/lib/api'
import type { ApiEnvelope, BootstrapPayload, DirectoryRecord, UserProfile } from '@/lib/apiTypes'

export type LoginInput = { email: string; password: string }

export type RegisterInput = LoginInput & {
  firstName: string
  middleName?: string
  lastName: string
  studentId: string
  course: string
  yearLevel: number
  departmentId: string
}

export type AuthResult = { accessToken: string; user: UserProfile; bootstrap?: BootstrapPayload }

export const authApi = {
  async login(input: LoginInput) {
    const response = await api.post<ApiEnvelope<AuthResult>>('/auth/login', input)
    return response.data.data
  },
  async register(input: RegisterInput) {
    const response = await api.post<ApiEnvelope<AuthResult>>('/auth/register', input)
    return response.data.data
  },
  async me() {
    const response = await api.get<ApiEnvelope<{ user: UserProfile }>>('/users/me')
    return response.data.data.user
  },
  async bootstrap() {
    const response = await api.get<ApiEnvelope<BootstrapPayload>>('/bootstrap')
    return response.data.data
  },
  async updateProfile(input: Partial<RegisterInput>) {
    const response = await api.put<ApiEnvelope<{ user: UserProfile }>>('/users/me', input)
    return response.data.data.user
  },
  async departments() {
    const response =
      await api.get<ApiEnvelope<{ departments: DirectoryRecord[] }>>('/auth/departments')
    return response.data.data.departments
  },
}
