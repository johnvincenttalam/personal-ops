import { useEffect, useRef, useState } from 'react'
import { useNoteStore } from '@/stores/useNoteStore'
import { usePromptStore } from '@/stores/usePromptStore'
import { useChecklistStore } from '@/stores/useChecklistStore'
import { useStorageStore } from '@/stores/useStorageStore'
import { useUIStore } from '@/stores/useUIStore'
import Modal from '@/components/shared/Modal'
import type { Tab } from '@/types'

interface Props {
  tab: Tab
  projectId: string
  onClose: () => void
}

const CONFIG: Record<Tab, { title: string; label: string; placeholder: string; cta: string }> = {
  notes: { title: 'New Note', label: 'Title', placeholder: 'e.g. Sprint kickoff notes', cta: 'Create note' },
  prompts: { title: 'New Prompt', label: 'Title', placeholder: 'e.g. Code reviewer system prompt', cta: 'Create prompt' },
  checklists: { title: 'New Checklist', label: 'List name', placeholder: 'e.g. Release checklist', cta: 'Create checklist' },
  storage: { title: 'New Snippet', label: 'Name', placeholder: 'e.g. Postgres connection string', cta: 'Create snippet' },
}

export default function NewItemModal({ tab, projectId, onClose }: Props) {
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const createNote = useNoteStore((s) => s.createNote)
  const createPrompt = usePromptStore((s) => s.createPrompt)
  const createList = useChecklistStore((s) => s.createList)
  const createStorage = useStorageStore((s) => s.createItem)
  const setMobileView = useUIStore((s) => s.setMobileView)

  const cfg = CONFIG[tab]

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || submitting) return
    setSubmitting(true)
    try {
      if (tab === 'notes') await createNote(projectId, { title: trimmed })
      else if (tab === 'prompts') await createPrompt(projectId, { title: trimmed })
      else if (tab === 'checklists') await createList(projectId, trimmed)
      else await createStorage(projectId, { name: trimmed })
      setMobileView('editor')
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title={cfg.title}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={!name.trim() || submitting}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? 'Creating...' : cfg.cta}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
          {cfg.label}
        </label>
        <input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={cfg.placeholder}
          className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </form>
    </Modal>
  )
}
