import type { Prompt } from '@/domain/entities/Prompt'

export interface NewPromptInput {
  project_id: string
  user_id: string | null
  title?: string
  content?: string
}

export interface PromptRepository {
  listByProject(projectId: string): Promise<Prompt[]>
  create(input: NewPromptInput): Promise<Prompt>
  update(id: string, patch: Partial<Prompt>): Promise<void>
  delete(id: string): Promise<void>
}
