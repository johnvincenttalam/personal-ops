import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createStorageService } from './StorageService'
import type { StorageRepository, NewStorageInput } from '@/application/ports/StorageRepository'
import type { StorageItem } from '@/domain/entities/StorageItem'

function makeFakeRepo(): StorageRepository {
  return {
    listByProject: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async (input: NewStorageInput) => ({
      id: 'new-id', user_id: input.user_id, project_id: input.project_id,
      name: input.name ?? 'Untitled', description: input.description ?? '',
      content: input.content ?? '', tags: input.tags ?? [],
      source_type: input.source_type ?? 'manual', source_id: input.source_id ?? null,
      created_at: '', updated_at: '',
    } as StorageItem)),
    update: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
  }
}

function buildItem(overrides: Partial<StorageItem> = {}): StorageItem {
  return {
    id: 's1', user_id: 'u1', project_id: 'proj-1',
    name: 'Snippet', description: 'A useful one',
    content: 'body', tags: ['flutter'],
    source_type: 'manual', source_id: null,
    created_at: '', updated_at: '',
    ...overrides,
  }
}

describe('StorageService', () => {
  let repo: StorageRepository
  beforeEach(() => { repo = makeFakeRepo() })

  it('save: skips repo when unchanged', async () => {
    const svc = createStorageService({ repo, userId: 'u1' })
    const item = buildItem()
    await svc.save(item, {
      name: item.name, description: item.description, content: item.content, tags: item.tags,
    })
    expect(repo.update).not.toHaveBeenCalled()
  })

  it('save: only writes changed fields', async () => {
    const svc = createStorageService({ repo, userId: 'u1' })
    const item = buildItem()
    await svc.save(item, {
      name: 'Renamed', description: item.description, content: item.content, tags: item.tags,
    })
    expect(repo.update).toHaveBeenCalledWith('s1', { name: 'Renamed' })
  })

  it('save: dedupes tags', async () => {
    const svc = createStorageService({ repo, userId: 'u1' })
    const item = buildItem({ tags: [] })
    await svc.save(item, {
      name: item.name, description: item.description, content: item.content, tags: ['#x', 'X', 'y'],
    })
    expect(repo.update).toHaveBeenCalledWith('s1', { tags: ['x', 'y'] })
  })

  it('create: passes source linkage through', async () => {
    const svc = createStorageService({ repo, userId: 'user-X' })
    await svc.create('proj-1', {
      name: 'From note', content: 'snapshot', tags: ['Spec'],
      source_type: 'note', source_id: 'note-42',
    })
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({
      project_id: 'proj-1',
      user_id: 'user-X',
      name: 'From note',
      content: 'snapshot',
      tags: ['spec'],
      source_type: 'note',
      source_id: 'note-42',
    }))
  })
})
