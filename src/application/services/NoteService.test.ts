import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createNoteService } from './NoteService'
import type { NoteRepository, NewNoteInput } from '@/application/ports/NoteRepository'
import type { Note } from '@/domain/entities/Note'

function makeFakeRepo(): NoteRepository {
  return {
    listByProject: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async (input: NewNoteInput) => ({
      id: 'new-id', user_id: input.user_id, project_id: input.project_id,
      title: input.title ?? 'Untitled', content: input.content ?? '',
      is_pinned: false, status: 'draft', tags: [],
      position: 0, created_at: '', updated_at: '',
    } as Note)),
    update: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
  }
}

function buildNote(overrides: Partial<Note> = {}): Note {
  return {
    id: 'n1', user_id: 'u1', project_id: 'p1',
    title: 'Hello', content: 'world',
    is_pinned: false, status: 'draft', tags: ['foo'],
    position: 0, created_at: '', updated_at: '',
    ...overrides,
  }
}

describe('NoteService', () => {
  let repo: NoteRepository
  beforeEach(() => { repo = makeFakeRepo() })

  describe('save', () => {
    it('does not call repo when nothing changed', async () => {
      const svc = createNoteService({ repo, userId: 'u1' })
      const note = buildNote()
      await svc.save(note, {
        title: note.title, content: note.content, status: note.status, tags: note.tags,
      })
      expect(repo.update).not.toHaveBeenCalled()
    })

    it('persists only the keys that changed', async () => {
      const svc = createNoteService({ repo, userId: 'u1' })
      const note = buildNote({ title: 'Old', content: 'same' })
      await svc.save(note, { title: 'New', content: 'same', status: 'draft', tags: ['foo'] })
      expect(repo.update).toHaveBeenCalledOnce()
      expect(repo.update).toHaveBeenCalledWith('n1', { title: 'New' })
    })

    it('dedupes and normalizes tags before persisting', async () => {
      const svc = createNoteService({ repo, userId: 'u1' })
      const note = buildNote({ tags: [] })
      await svc.save(note, { title: 'Hello', content: 'world', status: 'draft', tags: ['Foo', '#foo', 'bar'] })
      expect(repo.update).toHaveBeenCalledWith('n1', { tags: ['foo', 'bar'] })
    })

    it('rejects illegal status transitions', async () => {
      const svc = createNoteService({ repo, userId: 'u1' })
      const note = buildNote({ status: 'archived' })
      await expect(
        svc.save(note, { title: 'Hello', content: 'world', status: 'final', tags: [] })
      ).rejects.toThrow(/Illegal status transition/)
      expect(repo.update).not.toHaveBeenCalled()
    })
  })

  describe('togglePin', () => {
    it('flips is_pinned via repo update', async () => {
      const svc = createNoteService({ repo, userId: 'u1' })
      await svc.togglePin(buildNote({ is_pinned: false }))
      expect(repo.update).toHaveBeenCalledWith('n1', { is_pinned: true })
    })
  })

  describe('duplicate', () => {
    it('returns null and skips repo when source has no project_id', async () => {
      const svc = createNoteService({ repo, userId: 'u1' })
      const result = await svc.duplicate(buildNote({ project_id: null }))
      expect(result).toBeNull()
      expect(repo.create).not.toHaveBeenCalled()
    })

    it('creates with "(copy)" suffix and the configured user_id', async () => {
      const svc = createNoteService({ repo, userId: 'user-X' })
      await svc.duplicate(buildNote({ title: 'My Note' }))
      expect(repo.create).toHaveBeenCalledWith({
        project_id: 'p1',
        user_id: 'user-X',
        title: 'My Note (copy)',
        content: 'world',
      })
    })

    it('uses fallback title when source title is empty', async () => {
      const svc = createNoteService({ repo, userId: 'u1' })
      await svc.duplicate(buildNote({ title: '' }))
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Untitled (copy)' })
      )
    })
  })

  describe('move', () => {
    it('updates project_id', async () => {
      const svc = createNoteService({ repo, userId: 'u1' })
      await svc.move('n1', 'p2')
      expect(repo.update).toHaveBeenCalledWith('n1', { project_id: 'p2' })
    })
  })

  describe('create', () => {
    it('passes the configured userId through to the repo', async () => {
      const svc = createNoteService({ repo, userId: 'user-X' })
      await svc.create('proj-1')
      expect(repo.create).toHaveBeenCalledWith({
        project_id: 'proj-1',
        user_id: 'user-X',
        title: undefined,
        content: undefined,
      })
    })

    it('handles a null userId for local-mode setups', async () => {
      const svc = createNoteService({ repo, userId: null })
      await svc.create('proj-1', { title: 'Hi' })
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: null, title: 'Hi' })
      )
    })
  })
})
