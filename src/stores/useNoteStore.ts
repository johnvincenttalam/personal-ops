import { create } from 'zustand'
import { services } from '@/infrastructure/composition'
import type { Note } from '@/domain/entities/Note'
import type { SaveDraft } from '@/application/services/NoteService'

interface NoteState {
  notes: Note[]
  activeNoteId: string | null
  loading: boolean
  fetchNotes: (projectId: string) => Promise<void>
  setActiveNote: (id: string | null) => void
  createNote: (
    projectId: string,
    partial?: { title?: string; content?: string }
  ) => Promise<Note | null>
  updateNote: (id: string, patch: Partial<Note>) => Promise<void>
  /** Diffed autosave — pass current entity + full draft; service decides what to write. */
  save: (current: Note, next: SaveDraft) => Promise<void>
  togglePin: (id: string) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  duplicateNote: (id: string) => Promise<void>
  moveNote: (id: string, targetProjectId: string) => Promise<void>
}

const svc = services.notes

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  activeNoteId: null,
  loading: false,

  fetchNotes: async (projectId) => {
    set({ loading: true })
    try {
      const notes = await svc.list(projectId)
      set({ notes, loading: false, activeNoteId: notes[0]?.id ?? null })
    } catch (e) {
      console.error('[notes] fetch', e)
      set({ loading: false })
    }
  },

  setActiveNote: (id) => set({ activeNoteId: id }),

  createNote: async (projectId, partial) => {
    try {
      const note = await svc.create(projectId, partial)
      set((s) => ({ notes: [note, ...s.notes], activeNoteId: note.id }))
      return note
    } catch (e) {
      console.error('[notes] create', e)
      return null
    }
  },

  updateNote: async (id, patch) => {
    set((s) => ({ notes: s.notes.map((n) => (n.id === id ? { ...n, ...patch } : n)) }))
    try { await svc.update(id, patch) }
    catch (e) { console.error('[notes] update', e) }
  },

  save: async (current, next) => {
    set((s) => ({ notes: s.notes.map((n) => (n.id === current.id ? { ...n, ...next } : n)) }))
    try { await svc.save(current, next) }
    catch (e) { console.error('[notes] save', e) }
  },

  togglePin: async (id) => {
    const note = get().notes.find((n) => n.id === id)
    if (!note) return
    set((s) => ({ notes: s.notes.map((n) => (n.id === id ? { ...n, is_pinned: !n.is_pinned } : n)) }))
    try { await svc.togglePin(note) }
    catch (e) { console.error('[notes] pin', e) }
  },

  deleteNote: async (id) => {
    const prev = get().notes
    set((s) => ({
      notes: s.notes.filter((n) => n.id !== id),
      activeNoteId: s.activeNoteId === id ? null : s.activeNoteId,
    }))
    try { await svc.delete(id) }
    catch (e) {
      console.error('[notes] delete', e)
      set({ notes: prev })
    }
  },

  duplicateNote: async (id) => {
    const note = get().notes.find((n) => n.id === id)
    if (!note) return
    try {
      const copy = await svc.duplicate(note)
      if (copy) set((s) => ({ notes: [copy, ...s.notes], activeNoteId: copy.id }))
    } catch (e) {
      console.error('[notes] duplicate', e)
    }
  },

  moveNote: async (id, targetProjectId) => {
    const prev = get().notes
    set((s) => {
      const remaining = s.notes.filter((n) => n.id !== id)
      return {
        notes: remaining,
        activeNoteId: s.activeNoteId === id ? (remaining[0]?.id ?? null) : s.activeNoteId,
      }
    })
    try { await svc.move(id, targetProjectId) }
    catch (e) {
      console.error('[notes] move', e)
      set({ notes: prev })
    }
  },
}))
