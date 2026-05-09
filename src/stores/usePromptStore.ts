import { create } from 'zustand'
import { services } from '@/infrastructure/composition'
import type { Prompt } from '@/domain/entities/Prompt'
import type { PromptSaveDraft } from '@/application/services/PromptService'

interface PromptState {
  prompts: Prompt[]
  activePromptId: string | null
  loading: boolean
  fetchPrompts: (projectId: string) => Promise<void>
  setActivePrompt: (id: string | null) => void
  createPrompt: (
    projectId: string,
    partial?: { title?: string; content?: string }
  ) => Promise<Prompt | null>
  updatePrompt: (id: string, patch: Partial<Prompt>) => Promise<void>
  save: (current: Prompt, next: PromptSaveDraft) => Promise<void>
  togglePin: (id: string) => Promise<void>
  deletePrompt: (id: string) => Promise<void>
  duplicatePrompt: (id: string) => Promise<void>
  movePrompt: (id: string, targetProjectId: string) => Promise<void>
}

const svc = services.prompts

export const usePromptStore = create<PromptState>((set, get) => ({
  prompts: [],
  activePromptId: null,
  loading: false,

  fetchPrompts: async (projectId) => {
    set({ loading: true })
    try {
      const prompts = await svc.list(projectId)
      const currentId = get().activePromptId
      const keepCurrent = currentId != null && prompts.some((p) => p.id === currentId)
      set({ prompts, loading: false, activePromptId: keepCurrent ? currentId : (prompts[0]?.id ?? null) })
    } catch (e) {
      console.error('[prompts] fetch', e)
      set({ loading: false })
    }
  },

  setActivePrompt: (id) => set({ activePromptId: id }),

  createPrompt: async (projectId, partial) => {
    try {
      const prompt = await svc.create(projectId, partial)
      set((s) => ({ prompts: [prompt, ...s.prompts], activePromptId: prompt.id }))
      return prompt
    } catch (e) {
      console.error('[prompts] create', e)
      return null
    }
  },

  updatePrompt: async (id, patch) => {
    set((s) => ({ prompts: s.prompts.map((p) => (p.id === id ? { ...p, ...patch } : p)) }))
    try { await svc.update(id, patch) }
    catch (e) { console.error('[prompts] update', e) }
  },

  save: async (current, next) => {
    set((s) => ({ prompts: s.prompts.map((p) => (p.id === current.id ? { ...p, ...next } : p)) }))
    try { await svc.save(current, next) }
    catch (e) { console.error('[prompts] save', e) }
  },

  togglePin: async (id) => {
    const prompt = get().prompts.find((p) => p.id === id)
    if (!prompt) return
    set((s) => ({ prompts: s.prompts.map((p) => (p.id === id ? { ...p, is_pinned: !p.is_pinned } : p)) }))
    try { await svc.togglePin(prompt) }
    catch (e) { console.error('[prompts] pin', e) }
  },

  deletePrompt: async (id) => {
    const prev = get().prompts
    set((s) => ({
      prompts: s.prompts.filter((p) => p.id !== id),
      activePromptId: s.activePromptId === id ? null : s.activePromptId,
    }))
    try { await svc.delete(id) }
    catch (e) {
      console.error('[prompts] delete', e)
      set({ prompts: prev })
    }
  },

  duplicatePrompt: async (id) => {
    const prompt = get().prompts.find((p) => p.id === id)
    if (!prompt) return
    try {
      const copy = await svc.duplicate(prompt)
      if (copy) set((s) => ({ prompts: [copy, ...s.prompts], activePromptId: copy.id }))
    } catch (e) {
      console.error('[prompts] duplicate', e)
    }
  },

  movePrompt: async (id, targetProjectId) => {
    const prev = get().prompts
    set((s) => {
      const remaining = s.prompts.filter((p) => p.id !== id)
      return {
        prompts: remaining,
        activePromptId: s.activePromptId === id ? (remaining[0]?.id ?? null) : s.activePromptId,
      }
    })
    try { await svc.move(id, targetProjectId) }
    catch (e) {
      console.error('[prompts] move', e)
      set({ prompts: prev })
    }
  },
}))
