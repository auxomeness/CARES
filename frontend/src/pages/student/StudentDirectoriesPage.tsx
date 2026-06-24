import { StudentDirectories } from '@/features/student/components/StudentDirectories'
import type { DirectoryKind } from '@/features/student/studentDirectory.types'

type StudentDirectoriesPageProps = {
  kind?: DirectoryKind
}

export function StudentDirectoriesPage({ kind }: StudentDirectoriesPageProps) {
  return <StudentDirectories kind={kind} />
}
