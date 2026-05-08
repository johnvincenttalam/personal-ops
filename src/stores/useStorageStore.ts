import { create } from 'zustand'
import { services } from '@/infrastructure/composition'
import type { StorageItem } from '@/domain/entities/StorageItem'
import type { StorageCreatePartial, StorageSaveDraft } from '@/application/services/StorageService'

interface StorageState {
  items: StorageItem[]
  activeItemId: string | null
  loading: boolean
  fetchItems: (projectId: string) => Promise<void>
  setActiveItem: (id: string | null) => void
  createItem: (projectId: string, partial?: StorageCreatePartial) => Promise<StorageItem | null>
  updateItem: (id: string, patch: Partial<StorageItem>) => Promise<void>
  save: (current: StorageItem, next: StorageSaveDraft) => Promise<void>
  deleteItem: (id: string) => Promise<void>
}

const svc = services.storage

export const useStorageStore = create<StorageState>((set, get) => ({
  items: [],
  activeItemId: null,
  loading: false,

  fetchItems: async (projectId) => {
    set({ loading: true })
    try {
      const items = await svc.list(projectId)
      set({ items, loading: false, activeItemId: items[0]?.id ?? null })
    } catch (e) {
      console.error('[storage] fetch', e)
      set({ loading: false })
    }
  },

  setActiveItem: (id) => set({ activeItemId: id }),

  createItem: async (projectId, partial) => {
    try {
      const item = await svc.create(projectId, partial)
      set((s) => ({ items: [item, ...s.items], activeItemId: item.id }))
      return item
    } catch (e) {
      console.error('[storage] create', e)
      return null
    }
  },

  updateItem: async (id, patch) => {
    set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) }))
    try { await svc.update(id, patch) }
    catch (e) { console.error('[storage] update', e) }
  },

  save: async (current, next) => {
    set((s) => ({ items: s.items.map((i) => (i.id === current.id ? { ...i, ...next } : i)) }))
    try { await svc.save(current, next) }
    catch (e) { console.error('[storage] save', e) }
  },

  deleteItem: async (id) => {
    const prev = get().items
    set((s) => ({
      items: s.items.filter((i) => i.id !== id),
      activeItemId: s.activeItemId === id ? null : s.activeItemId,
    }))
    try { await svc.delete(id) }
    catch (e) {
      console.error('[storage] delete', e)
      set({ items: prev })
    }
  },
}))
