import type { StorageItem, StorageSourceType } from '@/domain/entities/StorageItem'

export interface NewStorageInput {
  project_id: string
  user_id: string | null
  name?: string
  description?: string
  content?: string
  tags?: string[]
  source_type?: StorageSourceType
  source_id?: string | null
}

export interface StorageRepository {
  listByProject(projectId: string): Promise<StorageItem[]>
  create(input: NewStorageInput): Promise<StorageItem>
  update(id: string, patch: Partial<StorageItem>): Promise<void>
  delete(id: string): Promise<void>
}
