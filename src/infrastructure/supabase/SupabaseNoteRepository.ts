import type { SupabaseClient } from '@supabase/supabase-js'
import type { NewNoteInput, NoteRepository } from '@/application/ports/NoteRepository'
import type { Note } from '@/domain/entities/Note'
import { BaseSupabaseRepository } from './BaseSupabaseRepository'

export class SupabaseNoteRepository
  extends BaseSupabaseRepository<Note>
  implements NoteRepository
{
  constructor(db: SupabaseClient) { super(db, 'notes') }

  listByProject(projectId: string): Promise<Note[]> {
    return this.listOrderedBy(
      { project_id: projectId },
      [
        { column: 'is_pinned', ascending: false },
        { column: 'updated_at', ascending: false },
      ],
    )
  }

  create(input: NewNoteInput): Promise<Note> {
    return this.insertOne({
      project_id: input.project_id,
      user_id: input.user_id,
      title: input.title ?? 'Untitled',
      content: input.content ?? '',
    })
  }
}
