import { useEffect } from 'react'
import { Plus, Trash2, Copy, Sparkles, FileText, Hand } from 'lucide-react'
import clsx from 'clsx'
import { useStorageStore } from '@/stores/useStorageStore'
import { useProjectStore } from '@/stores/useProjectStore'
import { useUIStore } from '@/stores/useUIStore'
import { relativeLabel } from '@/components/shared/formatDate'
import { confirmDialog } from '@/components/shared/ConfirmDialog'
import { TagPills } from '@/components/shared/TagsEditor'
import type { StorageItem, StorageSourceType } from '@/types'

const SOURCE_ICON: Record<StorageSourceType, typeof FileText> = {
  prompt: Sparkles,
  note: FileText,
  manual: Hand,
}

const SOURCE_LABEL: Record<StorageSourceType, string> = {
  prompt: 'From prompt',
  note: 'From note',
  manual: 'Manual',
}

export default function StorageList() {
  const activeProjectId = useProjectStore((s) => s.activeProjectId)
  const items = useStorageStore((s) => s.items)
  const activeItemId = useStorageStore((s) => s.activeItemId)
  const loading = useStorageStore((s) => s.loading)
  const fetchItems = useStorageStore((s) => s.fetchItems)
  const setActiveItem = useStorageStore((s) => s.setActiveItem)
  const createItem = useStorageStore((s) => s.createItem)
  const deleteItem = useStorageStore((s) => s.deleteItem)
  const setMobileView = useUIStore((s) => s.setMobileView)

  useEffect(() => {
    if (activeProjectId) fetchItems(activeProjectId)
  }, [activeProjectId, fetchItems])

  const openItem = (id: string) => {
    setActiveItem(id)
    setMobileView('editor')
  }

  const handleNew = async () => {
    if (!activeProjectId) return
    await createItem(activeProjectId)
    setMobileView('editor')
  }

  const handleDelete = async (e: React.MouseEvent, item: StorageItem) => {
    e.stopPropagation()
    const ok = await confirmDialog({
      title: `Delete "${item.name || 'Untitled'}"?`,
      description: 'This will permanently remove this storage item.',
      confirmText: 'Delete',
      variant: 'danger',
    })
    if (ok) await deleteItem(item.id)
  }

  const handleCopy = async (e: React.MouseEvent, content: string) => {
    e.stopPropagation()
    await navigator.clipboard.writeText(content)
  }

  const renderCard = (item: StorageItem) => {
    const SourceIcon = SOURCE_ICON[item.source_type] ?? Hand
    return (
      <div
        key={item.id}
        className={clsx(
          'group cursor-pointer border-b border-l-2 border-gray-100 transition-colors dark:border-zinc-800',
          activeItemId === item.id
            ? 'border-l-brand-500 bg-brand-50/50 dark:bg-brand-500/5'
            : 'border-l-transparent hover:bg-gray-50/80 dark:hover:bg-zinc-800/30'
        )}
      >
        <button
          onClick={() => openItem(item.id)}
          className="block w-full px-5 pt-3.5 pb-1 text-left"
        >
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-zinc-100">
              {item.name || 'Untitled'}
            </h3>
          </div>
          {item.description && (
            <p className="mt-1 line-clamp-1 text-xs text-gray-500 dark:text-zinc-400">
              {item.description}
            </p>
          )}
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-400 dark:text-zinc-500">
            {item.content || 'No content'}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-zinc-800 dark:text-zinc-400">
              <SourceIcon className="h-2.5 w-2.5" />
              {SOURCE_LABEL[item.source_type] ?? 'Manual'}
            </span>
            <TagPills tags={item.tags ?? []} maxDisplay={3} />
          </div>
        </button>

        <div className="flex items-center justify-between px-5 pb-3.5 pt-1">
          <span className="text-[11px] text-gray-400 dark:text-zinc-500">
            {relativeLabel(item.updated_at)}
          </span>
          <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={(e) => handleCopy(e, item.content)}
              className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-zinc-700"
              title="Copy content"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={(e) => handleDelete(e, item)}
              className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="px-5 pb-3 pt-5">
        <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100">Storage</h2>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-zinc-500">
          Reusable snippets, drafts, and references
        </p>
      </div>

      <div className="border-b border-gray-200 px-5 py-2 dark:border-zinc-800" />

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="px-5 py-8 text-center text-xs text-gray-400 dark:text-zinc-500">
            Loading...
          </div>
        ) : items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
            <p className="text-sm font-medium text-gray-700 dark:text-zinc-300">
              Nothing in storage yet
            </p>
            <p className="max-w-xs text-xs text-gray-500 dark:text-zinc-500">
              Save reusable snippets here, or use "Add to Storage" from a prompt or note.
            </p>
            <button
              onClick={handleNew}
              disabled={!activeProjectId}
              className="mt-2 flex items-center gap-2 rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-40"
            >
              <Plus className="h-4 w-4" /> New snippet
            </button>
          </div>
        ) : (
          items.map(renderCard)
        )}
      </div>

      <button
        onClick={handleNew}
        disabled={!activeProjectId}
        className="hidden md:flex items-center justify-center gap-2 border-t border-gray-200 px-5 py-3 text-sm font-medium text-brand-600 transition hover:bg-gray-50 disabled:opacity-40 dark:border-zinc-800 dark:text-brand-400 dark:hover:bg-zinc-800/50"
      >
        <Plus className="h-4 w-4" /> New snippet
      </button>
    </>
  )
}
