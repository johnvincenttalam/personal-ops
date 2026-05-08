import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPromptService } from './PromptService'
import type { PromptRepository, NewPromptInput } from '@/application/ports/PromptRepository'
import type { Prompt } from '@/domain/entities/Prompt'

function makeFakeRepo(): PromptRepository {
  return {
    listByProject: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async (input: NewPromptInput) => ({
      id: 'new-id', user_id: input.user_id, project_id: input.project_id,
      title: input.title ?? 'Untitled', content: input.content ?? '',
      is_pinned: false, status: 'draft', tags: [],
      position: 0, created_at: '', updated_at: '',
    } as Prompt)),
    update: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
  }
}

function buildPrompt(overrides: Partial<Prompt> = {}): Prompt {
  return {
    id: 'p1', user_id: 'u1', project_id: 'proj-1',
    title: 'My prompt', content: 'You are a helpful assistant',
    is_pinned: false, status: 'draft', tags: ['ai'],
    position: 0, created_at: '', updated_at: '',
    ...overrides,
  }
}

describe('PromptService', () => {
  let repo: PromptRepository
  beforeEach(() => { repo = makeFakeRepo() })

  it('save: skips repo when unchanged', async () => {
    const svc = createPromptService({ repo, userId: 'u1' })
    const p = buildPrompt()
    await svc.save(p, { title: p.title, content: p.content, status: p.status, tags: p.tags })
    expect(repo.update).not.toHaveBeenCalled()
  })

  it('save: dedupes tags', async () => {
    const svc = createPromptService({ repo, userId: 'u1' })
    const p = buildPrompt({ tags: [] })
    await svc.save(p, { title: p.title, content: p.content, status: 'draft', tags: ['AI', '#ai', 'spec'] })
    expect(repo.update).toHaveBeenCalledWith('p1', { tags: ['ai', 'spec'] })
  })

  it('save: rejects illegal status transition', async () => {
    const svc = createPromptService({ repo, userId: 'u1' })
    const p = buildPrompt({ status: 'archived' })
    await expect(
      svc.save(p, { title: p.title, content: p.content, status: 'final', tags: [] })
    ).rejects.toThrow(/Illegal status transition/)
  })

  it('togglePin: flips is_pinned', async () => {
    const svc = createPromptService({ repo, userId: 'u1' })
    await svc.togglePin(buildPrompt({ is_pinned: true }))
    expect(repo.update).toHaveBeenCalledWith('p1', { is_pinned: false })
  })

  it('duplicate: returns null when no project', async () => {
    const svc = createPromptService({ repo, userId: 'u1' })
    expect(await svc.duplicate(buildPrompt({ project_id: null }))).toBeNull()
    expect(repo.create).not.toHaveBeenCalled()
  })

  it('duplicate: appends "(copy)" suffix', async () => {
    const svc = createPromptService({ repo, userId: 'user-X' })
    await svc.duplicate(buildPrompt({ title: 'Greeter' }))
    expect(repo.create).toHaveBeenCalledWith({
      project_id: 'proj-1',
      user_id: 'user-X',
      title: 'Greeter (copy)',
      content: 'You are a helpful assistant',
    })
  })

  it('move: updates project_id', async () => {
    const svc = createPromptService({ repo, userId: 'u1' })
    await svc.move('p1', 'proj-2')
    expect(repo.update).toHaveBeenCalledWith('p1', { project_id: 'proj-2' })
  })

  it('create: injects userId', async () => {
    const svc = createPromptService({ repo, userId: 'user-X' })
    await svc.create('proj-1', { title: 'New' })
    expect(repo.create).toHaveBeenCalledWith({
      project_id: 'proj-1',
      user_id: 'user-X',
      title: 'New',
      content: undefined,
    })
  })
})
