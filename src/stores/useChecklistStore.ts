import { create } from 'zustand'
import { services } from '@/infrastructure/composition'
import type { ChecklistItem } from '@/domain/entities/ChecklistItem'

interface ChecklistState {
  items: ChecklistItem[]
  activeListId: string | null
  loading: boolean
  fetchAll: (projectId: string) => Promise<void>
  setActiveList: (id: string | null) => void
  createList: (
    projectId: string,
    content?: string,
    items?: string[]
  ) => Promise<ChecklistItem | null>
  createItem: (projectId: string, parentId: string, content?: string) => Promise<ChecklistItem | null>
  updateItem: (id: string, patch: Partial<ChecklistItem>) => Promise<void>
  toggleComplete: (id: string) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  moveList: (id: string, targetProjectId: string) => Promise<void>
}

const svc = services.checklists

export const useChecklistStore = create<ChecklistState>((set, get) => ({
  items: [],
  activeListId: null,
  loading: false,

  fetchAll: async (projectId) => {
    set({ loading: true })
    try {
      const items = await svc.list(projectId)
      const firstList = items.find((i) => i.parent_id === null)
      set({ items, loading: false, activeListId: firstList?.id ?? null })
    } catch (e) {
      console.error('[checklist] fetch', e)
      set({ loading: false })
    }
  },

  setActiveList: (id) => set({ activeListId: id }),

  createList: async (projectId, content = 'New list', items) => {
    try {
      if (items?.length) {
        const { list, children } = await svc.createListWithItems(projectId, content, items)
        set((s) => ({ items: [...s.items, list, ...children], activeListId: list.id }))
        return list
      }
      const list = await svc.createList(projectId, content)
      set((s) => ({ items: [...s.items, list], activeListId: list.id }))
      return list
    } catch (e) {
      console.error('[checklist] create list', e)
      return null
    }
  },

  createItem: async (projectId, parentId, content = '') => {
    try {
      const item = await svc.createItem(projectId, parentId, content)
      set((s) => ({ items: [...s.items, item] }))
      return item
    } catch (e) {
      console.error('[checklist] create item', e)
      return null
    }
  },

  updateItem: async (id, patch) => {
    set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) }))
    try { await svc.update(id, patch) }
    catch (e) { console.error('[checklist] update', e) }
  },

  toggleComplete: async (id) => {
    const item = get().items.find((i) => i.id === id)
    if (!item) return
    set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, is_completed: !i.is_completed } : i)) }))
    try { await svc.toggleComplete(item) }
    catch (e) { console.error('[checklist] toggle', e) }
  },

  deleteItem: async (id) => {
    const prev = get().items
    set((s) => ({
      items: s.items.filter((i) => i.id !== id && i.parent_id !== id),
      activeListId: s.activeListId === id ? null : s.activeListId,
    }))
    try { await svc.delete(id) }
    catch (e) {
      console.error('[checklist] delete', e)
      set({ items: prev })
    }
  },

  moveList: async (id, targetProjectId) => {
    const prev = get().items
    const childIds = prev.filter((i) => i.parent_id === id).map((i) => i.id)
    set((s) => ({
      items: s.items.filter((i) => i.id !== id && i.parent_id !== id),
      activeListId: s.activeListId === id ? null : s.activeListId,
    }))
    try { await svc.moveList(id, childIds, targetProjectId) }
    catch (e) {
      console.error('[checklist] move', e)
      set({ items: prev })
    }
  },
}))
