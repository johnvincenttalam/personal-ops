import { useEffect, useRef, useState } from 'react'
import Modal from '@/components/shared/Modal'
import TagsEditor from '@/components/shared/TagsEditor'
import { useStorageStore } from '@/stores/useStorageStore'
import type { StorageSourceType } from '@/types'

interface Props {
  projectId: string
  defaultName?: string
  defaultContent?: string
  defaultTags?: string[]
  sourceType: StorageSourceType
  sourceId?: string | null
  onClose: () => void
  onSaved?: () => void
}

export default function SaveToStorageModal({
  projectId,
  defaultName = '',
  defaultContent = '',
  defaultTags = [],
  sourceType,
  sourceId = null,
  onClose,
  onSaved,
}: Props) {
  const createItem = useStorageStore((s) => s.createItem)

  const [name, setName] = useState(defaultName)
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>(defaultTags)
  const [saving, setSaving] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => { nameRef.current?.focus(); nameRef.current?.select() }, [])

  const handleSave = async () => {
    if (!name.trim() || saving) return
    setSaving(true)
    await createItem(projectId, {
      name: name.trim(),
      description: description.trim(),
      content: defaultContent,
      tags,
      source_type: sourceType,
      source_id: sourceId,
    })
    setSaving(false)
    onSaved?.()
    onClose()
  }

  const footer = (
    <>
      <button
        onClick={onClose}
        className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
      >
        Cancel
      </button>
      <button
        onClick={handleSave}
        disabled={!name.trim() || saving}
        className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-40"
      >
        {saving ? 'Saving...' : 'Save to Storage'}
      </button>
    </>
  )

  return (
    <Modal title="Save to Storage" onClose={onClose} footer={footer}>
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-zinc-400">
            Name
          </label>
          <input
            ref={nameRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleSave() }}
            placeholder="Snippet name"
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-zinc-400">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="When and how to use this..."
            rows={2}
            className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-600"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-zinc-400">
            Tags
          </label>
          <TagsEditor tags={tags} onChange={setTags} />
        </div>
        <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-500 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-400">
          A copy of the current content will be saved. Future edits to the source won't affect this snippet.
        </div>
      </div>
    </Modal>
  )
}
