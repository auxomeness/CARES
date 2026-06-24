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
  addConcern: (input: ConcernInput) => void
  updateConcern: (id: string, input: ConcernInput) => void
  deleteConcern: (id: string) => void
  upConcern: (id: string) => void
  addAppointment: (input: AppointmentInput) => void
  updateAppointment: (id: string, input: AppointmentInput) => void
  deleteAppointment: (id: string) => void
}

export const StudentDataContext = createContext<StudentDataContextValue | undefined>(undefined)

export function useStudentData() {
  const context = useContext(StudentDataContext)

  if (!context) {
    throw new Error('useStudentData must be used within StudentDataProvider')
  }

  return context
}
