import { createContext, useContext } from 'react'
import type {
  AppointmentInput,
  ConcernInput,
  StudentAppointment,
  StudentConcern,
} from '../studentData.types'

export type StudentDataContextValue = {
  concerns: StudentConcern[]
  appointments: StudentAppointment[]
  isLoading: boolean
  error: string
  addConcern: (input: ConcernInput) => Promise<void>
  updateConcern: (id: string, input: ConcernInput) => Promise<void>
  deleteConcern: (id: string) => Promise<void>
  upConcern: (id: string) => Promise<void>
  addAppointment: (input: AppointmentInput) => Promise<void>
  updateAppointment: (id: string, input: AppointmentInput) => Promise<void>
  deleteAppointment: (id: string) => Promise<void>
  refresh: () => Promise<void>
}

export const StudentDataContext = createContext<StudentDataContextValue | undefined>(undefined)

export function useStudentData() {
  const context = useContext(StudentDataContext)

  if (!context) {
    throw new Error('useStudentData must be used within StudentDataProvider')
  }

  return context
}
