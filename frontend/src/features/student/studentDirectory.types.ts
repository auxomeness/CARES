import type { LucideIcon } from 'lucide-react'

export type DirectoryKind = 'office' | 'department' | 'faculty'

export type DirectoryEntry = {
  id: string
  kind: DirectoryKind
  name: string
  description: string
  contact: string
  location: string
  hours: string
  concernsHandled: number
  concernsResolved: number
  responsiveness: number
  mainConcerns: string[]
  relatedOffice?: string
  facultyLead?: string
  icon: LucideIcon
}
