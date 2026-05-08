import type { NewStorageInput, StorageRepository } from '@/application/ports/StorageRepository'
import type { StorageItem } from '@/domain/entities/StorageItem'
import { dedupeTags } from '@/domain/value-objects/Tag'
import { diffPatch } from '@/domain/rules/diffPatch'

export interface StorageServiceDeps {
  repo: StorageRepository
  userId: string | null
}

export type StorageSaveDraft = Pick<StorageItem, 'name' | 'description' | 'content' | 'tags'>

export type StorageCreatePartial = Omit<NewStorageInput, 'project_id' | 'user_id'>

export function createStorageService({ repo, userId }: StorageServiceDeps) {
  return {
    list: (projectId: string) => repo.listByProject(projectId),

    create: (projectId: string, partial?: StorageCreatePartial) =>
      repo.create({
        project_id: projectId,
        user_id: userId,
        name: partial?.name,
        description: partial?.description,
        content: partial?.content,
        tags: partial?.tags ? dedupeTags(partial.tags) : undefined,
        source_type: partial?.source_type,
        source_id: partial?.source_id,
      }),

    update: (id: string, patch: Partial<StorageItem>) => repo.update(id, patch),

    save: async (current: StorageItem, next: StorageSaveDraft) => {
      const sanitized: StorageSaveDraft = { ...next, tags: dedupeTags(next.tags) }
      const patch = diffPatch(
        { name: current.name, description: current.description, content: current.content, tags: current.tags },
        sanitized
      )
      if (Object.keys(patch).length === 0) return
      await repo.update(current.id, patch)
    },

    delete: (id: string) => repo.delete(id),
  }
}

export type StorageService = ReturnType<typeof createStorageService>
