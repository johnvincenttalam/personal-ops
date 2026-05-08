import type { NoteRepository } from '@/application/ports/NoteRepository'
import type { Note } from '@/domain/entities/Note'
import { noteCopyTitle } from '@/domain/entities/Note'
import { dedupeTags } from '@/domain/value-objects/Tag'
import { canTransition } from '@/domain/value-objects/ItemStatus'
import { diffPatch } from '@/domain/rules/diffPatch'

export interface NoteServiceDeps {
  repo: NoteRepository
  userId: string | null
}

export type SaveDraft = Pick<Note, 'title' | 'content' | 'status' | 'tags'>

export function createNoteService({ repo, userId }: NoteServiceDeps) {
  return {
    list: (projectId: string) => repo.listByProject(projectId),

    create: (projectId: string, partial?: { title?: string; content?: string }) =>
      repo.create({
        project_id: projectId,
        user_id: userId,
        title: partial?.title,
        content: partial?.content,
      }),

    /** Direct patch — caller already knows what changed. Used for is_pinned, project_id, etc. */
    update: (id: string, patch: Partial<Note>) => repo.update(id, patch),

    /** Diffed save — caller passes full editor state, service skips the call if nothing changed. */
    save: async (current: Note, next: SaveDraft) => {
      const sanitized: SaveDraft = { ...next, tags: dedupeTags(next.tags) }
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

    togglePin: (note: Note) => repo.update(note.id, { is_pinned: !note.is_pinned }),

    delete: (id: string) => repo.delete(id),

    duplicate: (note: Note): Promise<Note | null> => {
      if (!note.project_id) return Promise.resolve(null)
      return repo.create({
        project_id: note.project_id,
        user_id: userId,
        title: noteCopyTitle(note.title),
        content: note.content,
      })
    },

    move: (id: string, targetProjectId: string) =>
      repo.update(id, { project_id: targetProjectId }),
  }
}

export type NoteService = ReturnType<typeof createNoteService>
