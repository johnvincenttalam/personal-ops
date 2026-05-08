import type { ChecklistRepository } from '@/application/ports/ChecklistRepository'
import type { ChecklistItem } from '@/domain/entities/ChecklistItem'

export interface ChecklistServiceDeps {
  repo: ChecklistRepository
  userId: string | null
}

export function createChecklistService({ repo, userId }: ChecklistServiceDeps) {
  return {
    list: (projectId: string) => repo.listByProject(projectId),

    createList: (projectId: string, content = 'New list') =>
      repo.create({
        project_id: projectId,
        user_id: userId,
        parent_id: null,
        content,
      }),

    createListWithItems: async (projectId: string, content: string, items: string[]) => {
      const list = await repo.create({
        project_id: projectId,
        user_id: userId,
        parent_id: null,
        content,
      })
      if (items.length === 0) return { list, children: [] as ChecklistItem[] }
      const children = await repo.createMany(
        items.map((c, i) => ({
          project_id: projectId,
          user_id: userId,
          parent_id: list.id,
          content: c,
          position: i,
        }))
      )
      return { list, children }
    },

    createItem: (projectId: string, parentId: string, content = '') =>
      repo.create({
        project_id: projectId,
        user_id: userId,
        parent_id: parentId,
        content,
      }),

    update: (id: string, patch: Partial<ChecklistItem>) => repo.update(id, patch),

    toggleComplete: (item: ChecklistItem) =>
      repo.update(item.id, { is_completed: !item.is_completed }),

    delete: (id: string) => repo.delete(id),

    /** Moves a list and all of its children to a target project. */
    moveList: (listId: string, childIds: string[], targetProjectId: string) =>
      repo.updateMany([listId, ...childIds], { project_id: targetProjectId }),
  }
}

export type ChecklistService = ReturnType<typeof createChecklistService>
