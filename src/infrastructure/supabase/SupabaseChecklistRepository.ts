import type { SupabaseClient } from '@supabase/supabase-js'
import type { ChecklistRepository, NewChecklistRow } from '@/application/ports/ChecklistRepository'
import type { ChecklistItem } from '@/domain/entities/ChecklistItem'
import { BaseSupabaseRepository } from './BaseSupabaseRepository'

export class SupabaseChecklistRepository
  extends BaseSupabaseRepository<ChecklistItem>
  implements ChecklistRepository
{
  constructor(db: SupabaseClient) { super(db, 'checklist_items') }

  listByProject(projectId: string): Promise<ChecklistItem[]> {
    return this.listOrderedBy(
      { project_id: projectId },
      [
        { column: 'position', ascending: true },
        { column: 'created_at', ascending: true },
      ],
    )
  }

  create(input: NewChecklistRow): Promise<ChecklistItem> {
    return this.insertOne(input as unknown as Record<string, unknown>)
  }

  createMany(inputs: NewChecklistRow[]): Promise<ChecklistItem[]> {
    return this.insertMany(inputs as unknown as Record<string, unknown>[])
  }

  updateMany(ids: string[], patch: Partial<ChecklistItem>): Promise<void> {
    return this.updateManyById(ids, patch)
  }
}
