import type { SupabaseClient } from '@supabase/supabase-js'
import type { NewProjectInput, ProjectRepository } from '@/application/ports/ProjectRepository'
import type { Project } from '@/domain/entities/Project'
import { BaseSupabaseRepository } from './BaseSupabaseRepository'

export class SupabaseProjectRepository
  extends BaseSupabaseRepository<Project>
  implements ProjectRepository
{
  constructor(db: SupabaseClient) { super(db, 'projects') }

  list(): Promise<Project[]> {
    return this.listOrderedBy(
      {},
      [
        { column: 'position', ascending: true },
        { column: 'created_at', ascending: true },
      ],
    )
  }

  create(input: NewProjectInput): Promise<Project> {
    return this.insertOne({
      user_id: input.user_id,
      name: input.name,
      color: input.color,
      description: input.description,
      tags: input.tags,
    })
  }
}
