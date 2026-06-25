import type { ReactNode } from 'react'
import { AppBottomNav } from '@/components/navigation/AppBottomNav'
import { AppSidebar } from '@/components/navigation/AppSidebar'
import { useAuth } from '@/features/auth/AuthContext'
import {
  getStudentHomeNavItems,
  getStudentMobileNavItems,
  studentHomeBrand,
  studentHomeProfile,
  studentUtilityNavItem,
  type StudentSection,
} from '../home.config'

type StudentWorkspaceShellProps = {
  activeSection: StudentSection
  children: ReactNode
  contentClassName?: string
  rightRail?: ReactNode
  workspaceClassName?: string
}

export function StudentWorkspaceShell({
  activeSection,
  children,
  contentClassName = '',
  rightRail,
  workspaceClassName = '',
}: StudentWorkspaceShellProps) {
  const { user } = useAuth()
  const currentHash = window.location.hash.toLowerCase()
  const profile = {
    ...studentHomeProfile,
    name: user
      ? [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' ')
      : 'Student',
    role: user?.studentProfile?.course ?? 'Student',
  }

  return (
    <main className="min-h-svh overflow-x-hidden bg-[#f2f2f2] text-[#101010] lg:flex">
      <AppSidebar
        brand={studentHomeBrand}
        items={getStudentHomeNavItems(activeSection)}
        profile={profile}
        utilityItem={{
          ...studentUtilityNavItem,
          active: activeSection === 'offices',
          children: studentUtilityNavItem.children?.map((item) => ({
            ...item,
            active: item.href.toLowerCase() === currentHash,
          })),
        }}
      />

      <div
        className={`min-h-svh min-w-0 flex-1 px-4 pb-[92px] pt-6 sm:px-6 lg:flex lg:gap-7 lg:px-0 lg:pb-14 lg:pl-6 lg:pr-8 lg:pt-11 ${workspaceClassName}`}
      >
        <section className={`min-w-0 flex-1 ${contentClassName}`}>{children}</section>
        {rightRail}
      </div>

      <AppBottomNav items={getStudentMobileNavItems(activeSection)} />
    </main>
  )
}
