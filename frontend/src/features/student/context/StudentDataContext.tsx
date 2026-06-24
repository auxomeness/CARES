import { type ReactNode, useCallback, useMemo, useState } from 'react'
import {
  initialStudentAppointments,
  initialStudentConcerns,
} from '../studentData.config'
import type {
  AppointmentInput,
  ConcernInput,
  StudentAppointment,
  StudentConcern,
} from '../studentData.types'
import { StudentDataContext, type StudentDataContextValue } from './studentDataStore'

type StudentDataProviderProps = {
  children: ReactNode
}

function nextConcernId(items: StudentConcern[]) {
  const nextNumber =
    Math.max(0, ...items.map((item) => Number(item.id.replace('CON-', '')) || 0)) + 1

  return `CON-${String(nextNumber).padStart(3, '0')}`
}

function nextAppointmentId(items: StudentAppointment[]) {
  const nextNumber =
    Math.max(0, ...items.map((item) => Number(item.id.replace('APT-', '')) || 0)) + 1

  return `APT-${String(nextNumber).padStart(3, '0')}`
}

function todayLabel() {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date())
}

export function StudentDataProvider({ children }: StudentDataProviderProps) {
  const [concerns, setConcerns] = useState(initialStudentConcerns)
  const [appointments, setAppointments] = useState(initialStudentAppointments)

  const addConcern = useCallback((input: ConcernInput) => {
    setConcerns((currentConcerns) => [
      {
        ...input,
        id: nextConcernId(currentConcerns),
        status: 'For Approval',
        author: input.anonymous ? 'Anonymous student' : 'Xian Humphrey',
        createdAt: todayLabel(),
        reactions: 0,
        progress: 18,
      },
      ...currentConcerns,
    ])
  }, [])

  const updateConcern = useCallback((id: string, input: ConcernInput) => {
    setConcerns((currentConcerns) =>
      currentConcerns.map((concern) =>
        concern.id === id
          ? {
              ...concern,
              ...input,
              author: input.anonymous ? 'Anonymous student' : 'Xian Humphrey',
            }
          : concern,
      ),
    )
  }, [])

  const deleteConcern = useCallback((id: string) => {
    setConcerns((currentConcerns) => currentConcerns.filter((concern) => concern.id !== id))
  }, [])

  const upConcern = useCallback((id: string) => {
    setConcerns((currentConcerns) =>
      currentConcerns.map((concern) =>
        concern.id === id ? { ...concern, reactions: concern.reactions + 1 } : concern,
      ),
    )
  }, [])

  const addAppointment = useCallback((input: AppointmentInput) => {
    setAppointments((currentAppointments) => [
      {
        ...input,
        id: nextAppointmentId(currentAppointments),
        status: 'Pending',
        createdAt: todayLabel(),
      },
      ...currentAppointments,
    ])
  }, [])

  const updateAppointment = useCallback((id: string, input: AppointmentInput) => {
    setAppointments((currentAppointments) =>
      currentAppointments.map((appointment) =>
        appointment.id === id ? { ...appointment, ...input } : appointment,
      ),
    )
  }, [])

  const deleteAppointment = useCallback((id: string) => {
    setAppointments((currentAppointments) =>
      currentAppointments.filter((appointment) => appointment.id !== id),
    )
  }, [])

  const value = useMemo<StudentDataContextValue>(
    () => ({
      concerns,
      appointments,
      addConcern,
      updateConcern,
      deleteConcern,
      upConcern,
      addAppointment,
      updateAppointment,
      deleteAppointment,
    }),
    [
      concerns,
      appointments,
      addConcern,
      updateConcern,
      deleteConcern,
      upConcern,
      addAppointment,
      updateAppointment,
      deleteAppointment,
    ],
  )

  return <StudentDataContext.Provider value={value}>{children}</StudentDataContext.Provider>
}
