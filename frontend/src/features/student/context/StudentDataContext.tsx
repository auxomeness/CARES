import { useQuery, useQueryClient } from '@tanstack/react-query'
import { type ReactNode, useCallback, useMemo } from 'react'
import { getApiErrorMessage } from '@/lib/api'
import { queryKeys } from '@/lib/queryKeys'
import { useAuth } from '@/features/auth/AuthContext'
import type { AppointmentRecord, ConcernRecord, PaginatedEnvelope } from '@/lib/apiTypes'
import { appointmentApi, concernApi } from '@/services/caresApi'
import type {
  AppointmentInput,
  AppointmentStatus,
  ConcernInput,
  ConcernStatus,
  StudentAppointment,
  StudentConcern,
} from '../studentData.types'
import { StudentDataContext, type StudentDataContextValue } from './studentDataStore'

const concernStatus: Record<string, ConcernStatus> = {
  SUBMITTED: 'For Approval',
  UNDER_REVIEW: 'Pending',
  IN_PROGRESS: 'Approved',
  TRANSFERRED: 'Pending',
  AWAITING_CONFIRMATION: 'Approved',
  REOPENED: 'Pending',
  RESOLVED: 'Completed',
  CLOSED: 'Completed',
}

const appointmentStatus: Record<string, AppointmentStatus> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Cancelled',
  RESCHEDULED: 'Approved',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

function fullName(user?: {
  firstName: string
  middleName?: string | null
  lastName: string
}) {
  return user ? [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' ') : 'Student'
}

// eslint-disable-next-line react-refresh/only-export-components
export function mapConcern(record: ConcernRecord): StudentConcern {
  const target = record.targetOffice ?? record.targetDepartment
  return {
    id: record.referenceNumber,
    apiId: record.id,
    title: record.title,
    description: record.description,
    category: record.targetType === 'OFFICE' ? 'Student Services' : 'Academic',
    location: target?.name ?? record.targetType,
    status: concernStatus[record.status] ?? 'Pending',
    backendStatus: record.status,
    visibility: record.visibility.toLowerCase() as 'public' | 'private',
    anonymous: false,
    author: fullName(record.submittedBy?.user),
    createdAt: new Date(record.createdAt).toLocaleDateString(),
    reactions: record._count?.supports ?? 0,
    progress:
      record.status === 'RESOLVED' || record.status === 'CLOSED'
        ? 100
        : record.status === 'AWAITING_CONFIRMATION'
          ? 85
          : record.status === 'IN_PROGRESS'
            ? 60
            : 25,
    detail: record,
  }
}

// eslint-disable-next-line react-refresh/only-export-components
export function mapAppointment(record: AppointmentRecord): StudentAppointment {
  const start = new Date(record.startTime)
  const target = record.office?.name ?? record.department?.name ?? record.faculty?.user?.lastName ?? ''
  return {
    id: record.id,
    mode: record.targetType === 'OFFICE' ? 'office' : 'department',
    office: target,
    department: record.department?.name,
    faculty: record.faculty?.user
      ? fullName(record.faculty.user)
      : undefined,
    date: start.toLocaleDateString(),
    time: start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    purpose: record.title,
    consultationCategory: record.targetType,
    description: record.description ?? '',
    status: appointmentStatus[record.status] ?? 'Pending',
    backendStatus: record.status,
    createdAt: record.startTime,
    detail: record,
  }
}

export function StudentDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const enabled = user?.role === 'STUDENT'
  const concernsQuery = useQuery({
    queryKey: queryKeys.concerns.mine,
    queryFn: () => concernApi.list({ page: 1, limit: 100 }),
    retry: false,
    staleTime: 30_000,
    enabled,
  })
  const appointmentsQuery = useQuery({
    queryKey: queryKeys.appointments.mine,
    queryFn: () => appointmentApi.list({ page: 1, limit: 100 }),
    retry: false,
    staleTime: 30_000,
    enabled,
  })

  const refresh = useCallback(async (targets: Array<'concerns' | 'appointments' | 'notifications'> = [
    'concerns',
    'appointments',
    'notifications',
  ]) => {
    await Promise.all([
      targets.includes('concerns')
        ? queryClient.invalidateQueries({ queryKey: queryKeys.concerns.all })
        : Promise.resolve(),
      targets.includes('appointments')
        ? queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all })
        : Promise.resolve(),
      targets.includes('notifications')
        ? queryClient.invalidateQueries({ queryKey: queryKeys.notifications })
        : Promise.resolve(),
    ])
  }, [queryClient])

  const value = useMemo<StudentDataContextValue>(
    () => ({
      concerns: (concernsQuery.data?.data ?? []).map(mapConcern),
      appointments: (appointmentsQuery.data?.data ?? []).map(mapAppointment),
      isLoading: concernsQuery.isLoading || appointmentsQuery.isLoading,
      error: concernsQuery.error
        ? getApiErrorMessage(concernsQuery.error)
        : appointmentsQuery.error
          ? getApiErrorMessage(appointmentsQuery.error)
          : '',
      addConcern: async (input: ConcernInput) => {
        const concern = await concernApi.create({
          title: input.title,
          description: input.description,
          visibility: input.visibility.toUpperCase(),
          targetType: input.targetType,
          targetOfficeId: input.targetOfficeId ?? null,
          targetDepartmentId: input.targetDepartmentId ?? null,
        })
        queryClient.setQueryData<PaginatedEnvelope<ConcernRecord>>(queryKeys.concerns.mine, (old) =>
          old
            ? {
                ...old,
                data: [concern, ...old.data.filter((item) => item.id !== concern.id)],
                meta: { ...old.meta, total: old.meta.total + 1 },
              }
            : old,
        )
        if (input.image) await concernApi.upload(concern.id, input.image, input.onUploadProgress)
        await refresh(['concerns', 'notifications'])
      },
      updateConcern: async () => {
        throw new Error('Submitted concerns are immutable. Use resolution actions to update state.')
      },
      deleteConcern: async () => {
        throw new Error('Submitted concerns cannot be deleted.')
      },
      upConcern: async (id: string) => {
        const record = (concernsQuery.data?.data ?? []).find(
          (concern) => concern.id === id || concern.referenceNumber === id,
        )
        const concernId = record?.id ?? id
        const previousPublicQueries = queryClient.getQueriesData<PaginatedEnvelope<ConcernRecord>>(
          { queryKey: queryKeys.concerns.publicRoot },
        )
        queryClient.setQueriesData<PaginatedEnvelope<ConcernRecord>>(
          { queryKey: queryKeys.concerns.publicRoot },
          (old) =>
            old
              ? {
                  ...old,
                  data: old.data.map((concern) =>
                    concern.id === concernId || concern.referenceNumber === id
                      ? {
                          ...concern,
                          _count: {
                            supports: (concern._count?.supports ?? 0) + 1,
                            attachments: concern._count?.attachments ?? 0,
                          },
                        }
                      : concern,
                  ),
                }
              : old,
        )
        try {
          await concernApi.support(record?.id ?? id)
          void queryClient.invalidateQueries({ queryKey: queryKeys.notifications })
        } catch (failure) {
          previousPublicQueries.forEach(([key, value]) => queryClient.setQueryData(key, value))
          throw failure
        }
      },
      addAppointment: async (input: AppointmentInput) => {
        const appointment = await appointmentApi.create({
          title: input.purpose,
          description: input.description,
          targetType: input.targetType,
          officeId: input.officeId ?? null,
          departmentId: input.departmentId ?? null,
          facultyId: input.facultyId ?? null,
          startTime: input.startTime,
          endTime: input.endTime,
        })
        queryClient.setQueryData<PaginatedEnvelope<AppointmentRecord>>(
          queryKeys.appointments.mine,
          (old) =>
            old
              ? {
                  ...old,
                  data: [appointment, ...old.data.filter((item) => item.id !== appointment.id)],
                  meta: { ...old.meta, total: old.meta.total + 1 },
                }
              : old,
        )
        await refresh(['appointments', 'notifications'])
      },
      updateAppointment: async (id: string, input: AppointmentInput) => {
        if (!input.startTime || !input.endTime) throw new Error('Choose a new schedule.')
        await appointmentApi.reschedule(id, {
          newStartTime: input.startTime,
          newEndTime: input.endTime,
          reason: 'Student requested a new schedule',
        })
        await refresh(['appointments', 'notifications'])
      },
      deleteAppointment: async (id: string) => {
        await appointmentApi.cancel(id)
        await refresh(['appointments', 'notifications'])
      },
      refresh,
    }),
    [appointmentsQuery, concernsQuery, queryClient, refresh],
  )

  return <StudentDataContext.Provider value={value}>{children}</StudentDataContext.Provider>
}
