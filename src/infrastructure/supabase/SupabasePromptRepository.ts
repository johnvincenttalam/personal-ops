import type { SupabaseClient } from '@supabase/supabase-js'
import type { NewPromptInput, PromptRepository } from '@/application/ports/PromptRepository'
import type { Prompt } from '@/domain/entities/Prompt'
import { BaseSupabaseRepository } from './BaseSupabaseRepository'

export class SupabasePromptRepository
  extends BaseSupabaseRepository<Prompt>
  implements PromptRepository
{
  constructor(db: SupabaseClient) { super(db, 'prompts') }

  listByProject(projectId: string): Promise<Prompt[]> {
    return this.listOrderedBy(
      { project_id: projectId },
      [
        { column: 'is_pinned', ascending: false },
        { column: 'updated_at', ascending: false },
      ],
    )
  }

  create(input: NewPromptInput): Promise<Prompt> {
    return this.insertOne({
      project_id: input.project_id,
      user_id: input.user_id,
      title: input.title ?? 'Untitled',
      content: input.content ?? '',
    })
  }
}
