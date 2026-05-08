import type { ItemStatus } from '@/domain/value-objects/ItemStatus'

export interface Prompt {
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

export function promptCopyTitle(original: string): string {
  return original ? `${original} (copy)` : 'Untitled (copy)'
}
