import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createProjectService } from './ProjectService'
import type { ProjectRepository, NewProjectInput } from '@/application/ports/ProjectRepository'
import type { Project } from '@/domain/entities/Project'

function makeFakeRepo(): ProjectRepository {
  return {
    list: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async (input: NewProjectInput) => ({
      id: 'new-id', user_id: input.user_id,
      name: input.name, color: input.color,
      description: input.description, tags: input.tags,
      position: 0, created_at: '', updated_at: '',
    } as Project)),
    update: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
  }
}

describe('ProjectService', () => {
  let repo: ProjectRepository
  beforeEach(() => { repo = makeFakeRepo() })

  it('create: defaults color to violet', async () => {
    const svc = createProjectService({ repo, userId: 'u1' })
    await svc.create('Personal')
    expect(repo.create).toHaveBeenCalledWith({
      user_id: 'u1', name: 'Personal', color: 'violet', description: '', tags: [],
    })
  })

  it('create: dedupes tags before persisting', async () => {
    const svc = createProjectService({ repo, userId: 'u1' })
    await svc.create('Work', 'blue', 'desc', ['#a', 'A', 'b'])
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({
      tags: ['a', 'b'],
    }))
  })

  it('update: dedupes tags when present', async () => {
    const svc = createProjectService({ repo, userId: 'u1' })
    await svc.update('p1', { tags: ['#X', 'x', 'y'] })
    expect(repo.update).toHaveBeenCalledWith('p1', { tags: ['x', 'y'] })
  })

  it('update: passes through patches without tags untouched', async () => {
    const svc = createProjectService({ repo, userId: 'u1' })
    await svc.update('p1', { name: 'Renamed' })
    expect(repo.update).toHaveBeenCalledWith('p1', { name: 'Renamed' })
  })
})
