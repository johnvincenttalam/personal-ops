import type { PromptRepository } from '@/application/ports/PromptRepository'
import type { Prompt } from '@/domain/entities/Prompt'
import { promptCopyTitle } from '@/domain/entities/Prompt'
import { dedupeTags } from '@/domain/value-objects/Tag'
import { canTransition } from '@/domain/value-objects/ItemStatus'
import { diffPatch } from '@/domain/rules/diffPatch'

export interface PromptServiceDeps {
  repo: PromptRepository
  userId: string | null
}

export type PromptSaveDraft = Pick<Prompt, 'title' | 'content' | 'status' | 'tags'>

export function createPromptService({ repo, userId }: PromptServiceDeps) {
  return {
    list: (projectId: string) => repo.listByProject(projectId),

    create: (projectId: string, partial?: { title?: string; content?: string }) =>
      repo.create({
        project_id: projectId,
        user_id: userId,
        title: partial?.title,
        content: partial?.content,
      }),

    update: (id: string, patch: Partial<Prompt>) => repo.update(id, patch),

    save: async (current: Prompt, next: PromptSaveDraft) => {
      const sanitized: PromptSaveDraft = { ...next, tags: dedupeTags(next.tags) }
      if (!canTransition(current.status, sanitized.status)) {
        throw new Error(`Illegal status transition: ${current.status} → ${sanitized.status}`)
      }
      const patch = diffPatch(
        { title: current.title, content: current.content, status: current.status, tags: current.tags },
        sanitized
      )
      if (Object.keys(patch).length === 0) return
      await repo.update(current.id, patch)
    },

    togglePin: (prompt: Prompt) => repo.update(prompt.id, { is_pinned: !prompt.is_pinned }),

    delete: (id: string) => repo.delete(id),

    duplicate: (prompt: Prompt): Promise<Prompt | null> => {
      if (!prompt.project_id) return Promise.resolve(null)
      return repo.create({
        project_id: prompt.project_id,
        user_id: userId,
        title: promptCopyTitle(prompt.title),
        content: prompt.content,
      })
    },

    move: (id: string, targetProjectId: string) =>
      repo.update(id, { project_id: targetProjectId }),
  }
}

export type PromptService = ReturnType<typeof createPromptService>
