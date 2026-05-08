import type { ProjectRepository } from '@/application/ports/ProjectRepository'
import type { Project, ProjectColor } from '@/domain/entities/Project'
import { dedupeTags } from '@/domain/value-objects/Tag'

export interface ProjectServiceDeps {
  repo: ProjectRepository
  userId: string | null
}

export function createProjectService({ repo, userId }: ProjectServiceDeps) {
  return {
    list: () => repo.list(),

    create: (
      name: string,
      color: ProjectColor = 'violet',
      description = '',
      tags: string[] = []
    ) =>
      repo.create({
        user_id: userId,
        name,
        color,
        description,
        tags: dedupeTags(tags),
      }),

    update: (id: string, patch: Partial<Project>) => {
      const sanitized = patch.tags !== undefined
        ? { ...patch, tags: dedupeTags(patch.tags) }
        : patch
      return repo.update(id, sanitized)
    },

    delete: (id: string) => repo.delete(id),
  }
}

export type ProjectService = ReturnType<typeof createProjectService>
