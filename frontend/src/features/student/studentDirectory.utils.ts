import { directoryEntries } from './studentDirectory.config'
import type { DirectoryEntry, DirectoryKind } from './studentDirectory.types'

export function getDirectoryHash(entry: DirectoryEntry) {
  return `#student-directory-${entry.kind}-${entry.id}`
}

export function getDirectoryEntryFromHash(hash: string) {
  const match = hash.toLowerCase().match(/^#student-directory-(office|department|faculty)-(.+)$/)

  if (!match) {
    return null
  }

  const [, kind, id] = match

  return (
    directoryEntries.find(
      (entry) => entry.kind === (kind as DirectoryKind) && entry.id.toLowerCase() === id,
    ) ?? null
  )
}
