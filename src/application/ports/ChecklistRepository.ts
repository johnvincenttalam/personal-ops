import type { ChecklistItem } from '@/domain/entities/ChecklistItem'

export interface NewChecklistRow {
  project_id: string
  user_id: string | null
  parent_id: string | null
  content: string
  position?: number
}

export interface ChecklistRepository {
  listByProject(projectId: string): Promise<ChecklistItem[]>
  create(input: NewChecklistRow): Promise<ChecklistItem>
  createMany(inputs: NewChecklistRow[]): Promise<ChecklistItem[]>
  update(id: string, patch: Partial<ChecklistItem>): Promise<void>
  /** Bulk update for moving a list + its children to a different project. */
  updateMany(ids: string[], patch: Partial<ChecklistItem>): Promise<void>
  /** Deletes a single row. DB cascade is expected to remove children. */
  delete(id: string): Promise<void>
}
