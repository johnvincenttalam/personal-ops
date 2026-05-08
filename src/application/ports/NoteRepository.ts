import type { Note } from '@/domain/entities/Note'

export interface NewNoteInput {
  project_id: string
  user_id: string | null
  title?: string
  content?: string
}

export interface NoteRepository {
  listByProject(projectId: string): Promise<Note[]>
  create(input: NewNoteInput): Promise<Note>
  update(id: string, patch: Partial<Note>): Promise<void>
  delete(id: string): Promise<void>
}
