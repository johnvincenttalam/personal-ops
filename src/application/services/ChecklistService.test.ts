import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createChecklistService } from './ChecklistService'
import type { ChecklistRepository, NewChecklistRow } from '@/application/ports/ChecklistRepository'
import type { ChecklistItem } from '@/domain/entities/ChecklistItem'

let counter = 0
const makeRow = (input: NewChecklistRow): ChecklistItem => ({
  id: `id-${++counter}`,
  user_id: input.user_id, project_id: input.project_id,
  parent_id: input.parent_id,
  content: input.content,
  is_completed: false,
  position: input.position ?? 0,
  created_at: '', updated_at: '',
})

function makeFakeRepo(): ChecklistRepository {
  return {
    listByProject: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async (i: NewChecklistRow) => makeRow(i)),
    createMany: vi.fn().mockImplementation(async (inputs: NewChecklistRow[]) => inputs.map(makeRow)),
    update: vi.fn().mockResolvedValue(undefined),
    updateMany: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
  }
}

function buildItem(overrides: Partial<ChecklistItem> = {}): ChecklistItem {
  return {
    id: 'i1', user_id: 'u1', project_id: 'proj-1',
    parent_id: 'list-1', content: 'do thing', is_completed: false,
    position: 0, created_at: '', updated_at: '',
    ...overrides,
  }
}

describe('ChecklistService', () => {
  let repo: ChecklistRepository
  beforeEach(() => { repo = makeFakeRepo(); counter = 0 })

  it('createList: creates a parent row with parent_id = null', async () => {
    const svc = createChecklistService({ repo, userId: 'u1' })
    await svc.createList('proj-1', 'My list')
    expect(repo.create).toHaveBeenCalledWith({
      project_id: 'proj-1', user_id: 'u1', parent_id: null, content: 'My list',
    })
  })

  it('createListWithItems: creates parent then bulk-inserts children', async () => {
    const svc = createChecklistService({ repo, userId: 'u1' })
    const result = await svc.createListWithItems('proj-1', 'List', ['a', 'b', 'c'])

    expect(repo.create).toHaveBeenCalledOnce()
    expect(repo.createMany).toHaveBeenCalledOnce()
    const childInputs = (repo.createMany as ReturnType<typeof vi.fn>).mock.calls[0][0] as NewChecklistRow[]
    expect(childInputs).toHaveLength(3)
    expect(childInputs.map((c) => c.content)).toEqual(['a', 'b', 'c'])
    expect(childInputs.every((c) => c.parent_id === result.list.id)).toBe(true)
    expect(childInputs.map((c) => c.position)).toEqual([0, 1, 2])
  })

  it('createListWithItems: skips bulk insert for empty items array', async () => {
    const svc = createChecklistService({ repo, userId: 'u1' })
    await svc.createListWithItems('proj-1', 'Empty', [])
    expect(repo.createMany).not.toHaveBeenCalled()
  })

  it('toggleComplete: flips is_completed', async () => {
    const svc = createChecklistService({ repo, userId: 'u1' })
    await svc.toggleComplete(buildItem({ is_completed: false }))
    expect(repo.update).toHaveBeenCalledWith('i1', { is_completed: true })
  })

  it('moveList: bulk-updates list + children to new project', async () => {
    const svc = createChecklistService({ repo, userId: 'u1' })
    await svc.moveList('list-1', ['c1', 'c2'], 'proj-2')
    expect(repo.updateMany).toHaveBeenCalledWith(
      ['list-1', 'c1', 'c2'],
      { project_id: 'proj-2' },
    )
  })

  it('createItem: defaults content to empty string', async () => {
    const svc = createChecklistService({ repo, userId: 'u1' })
    await svc.createItem('proj-1', 'list-1')
    expect(repo.create).toHaveBeenCalledWith({
      project_id: 'proj-1', user_id: 'u1', parent_id: 'list-1', content: '',
    })
  })
})
