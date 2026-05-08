import type { ItemStatus } from '@/domain/value-objects/ItemStatus'

export interface Note {
  id: string
  user_id: string | null
  project_id: string | null
  title: string
  content: string
  is_pinned: boolean
  status: ItemStatus
  tags: string[]
  position: number
  created_at: string
  updated_at: string
}

/** Title used when duplicating a note. Domain rule, not infra. */
export function noteCopyTitle(original: string): string {
  return original ? `${original} (copy)` : 'Untitled (copy)'
}
