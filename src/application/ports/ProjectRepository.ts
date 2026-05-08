import type { Project, ProjectColor } from '@/domain/entities/Project'

export interface NewProjectInput {
  user_id: string | null
  name: string
  color: ProjectColor
  description: string
  tags: string[]
}

export interface ProjectRepository {
  list(): Promise<Project[]>
  create(input: NewProjectInput): Promise<Project>
  update(id: string, patch: Partial<Project>): Promise<void>
  delete(id: string): Promise<void>
}
