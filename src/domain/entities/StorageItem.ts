export type StorageSourceType = 'prompt' | 'note' | 'manual'

export interface StorageItem {
  id: string
  user_id: string | null
  project_id: string | null
  name: string
  description: string
  content: string
  tags: string[]
  source_type: StorageSourceType
  source_id: string | null
  created_at: string
  updated_at: string
}
