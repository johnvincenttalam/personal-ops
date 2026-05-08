export interface ChecklistItem {
  id: string
  user_id: string | null
  project_id: string | null
  parent_id: string | null
  content: string
  is_completed: boolean
  position: number
  created_at: string
  updated_at: string
}

export const isList = (i: ChecklistItem): boolean => i.parent_id === null
export const isChildOf = (parentId: string) => (i: ChecklistItem): boolean =>
  i.parent_id === parentId
