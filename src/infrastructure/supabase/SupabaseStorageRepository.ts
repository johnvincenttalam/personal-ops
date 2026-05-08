import type { SupabaseClient } from '@supabase/supabase-js'
import type { NewStorageInput, StorageRepository } from '@/application/ports/StorageRepository'
import type { StorageItem } from '@/domain/entities/StorageItem'
import { BaseSupabaseRepository } from './BaseSupabaseRepository'

export class SupabaseStorageRepository
  extends BaseSupabaseRepository<StorageItem>
  implements StorageRepository
{
  constructor(db: SupabaseClient) { super(db, 'storage_items') }

  listByProject(projectId: string): Promise<StorageItem[]> {
    return this.listOrderedBy(
      { project_id: projectId },
      [{ column: 'updated_at', ascending: false }],
    )
  }

  create(input: NewStorageInput): Promise<StorageItem> {
    return this.insertOne({
      project_id: input.project_id,
      user_id: input.user_id,
      name: input.name ?? 'Untitled',
      description: input.description ?? '',
      content: input.content ?? '',
      tags: input.tags ?? [],
      source_type: input.source_type ?? 'manual',
      source_id: input.source_id ?? null,
    })
  }
}
