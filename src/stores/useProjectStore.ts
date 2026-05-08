import { create } from 'zustand'
import { services } from '@/infrastructure/composition'
import { useNoteStore } from './useNoteStore'
import { usePromptStore } from './usePromptStore'
import { useChecklistStore } from './useChecklistStore'
import type { Project, ProjectColor } from '@/domain/entities/Project'

interface ProjectState {
  projects: Project[]
  activeProjectId: string | null
  loading: boolean
  fetchProjects: () => Promise<void>
  setActiveProject: (id: string | null) => void
  createProject: (
    name: string,
    color?: ProjectColor,
    description?: string,
    tags?: string[]
  ) => Promise<Project | null>
  updateProject: (id: string, patch: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
}

const svc = services.projects

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  activeProjectId: null,
  loading: false,

  fetchProjects: async () => {
    set({ loading: true })
    try {
      const projects = await svc.list()
      set({
        projects,
        loading: false,
        activeProjectId: get().activeProjectId ?? projects[0]?.id ?? null,
      })
    } catch (e) {
      console.error('[projects] fetch', e)
      set({ loading: false })
    }
  },

  setActiveProject: (id) => set({ activeProjectId: id }),

  createProject: async (name, color = 'violet', description = '', tags = []) => {
    try {
      const project = await svc.create(name, color, description, tags)
      set((s) => ({
        projects: [...s.projects, project],
        activeProjectId: s.activeProjectId ?? project.id,
      }))
      return project
    } catch (e) {
      console.error('[projects] create', e)
      return null
    }
  },

  updateProject: async (id, patch) => {
    set((s) => ({ projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)) }))
    try { await svc.update(id, patch) }
    catch (e) { console.error('[projects] update', e) }
  },

  deleteProject: async (id) => {
    const prev = get().projects
    const prevActive = get().activeProjectId
    const remaining = prev.filter((p) => p.id !== id)
    const nextActive = prevActive === id ? (remaining[0]?.id ?? null) : prevActive

    set({ projects: remaining, activeProjectId: nextActive })

    // DB cascade-deletes children; mirror that in client stores so we don't
    // show stale notes/prompts/checklists/storage after deleting the last project.
    if (!nextActive) {
      useNoteStore.setState({ notes: [], activeNoteId: null })
      usePromptStore.setState({ prompts: [], activePromptId: null })
      useChecklistStore.setState({ items: [], activeListId: null })
    }

    try { await svc.delete(id) }
    catch (e) {
      console.error('[projects] delete', e)
      set({ projects: prev, activeProjectId: prevActive })
    }
  },
}))
