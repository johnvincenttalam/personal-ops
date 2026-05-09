import { useMemo, useState } from 'react'
import { ArrowLeft, Plus, Trash2, Check } from 'lucide-react'
import clsx from 'clsx'
import { useChecklistStore } from '@/stores/useChecklistStore'
import { useProjectStore } from '@/stores/useProjectStore'
import { useUIStore } from '@/stores/useUIStore'
import WelcomePanel from '@/components/shared/WelcomePanel'
import { confirmDialog } from '@/components/shared/ConfirmDialog'
import { EditorSkeleton } from '@/components/shared/Skeletons'

export default function ChecklistView() {
  const allItems = useChecklistStore((s) => s.items)
  const activeListId = useChecklistStore((s) => s.activeListId)
  const loading = useChecklistStore((s) => s.loading)
  const updateItem = useChecklistStore((s) => s.updateItem)
  const toggleComplete = useChecklistStore((s) => s.toggleComplete)
  const deleteItem = useChecklistStore((s) => s.deleteItem)
  const createItem = useChecklistStore((s) => s.createItem)
  const createList = useChecklistStore((s) => s.createList)
  const setActiveList = useChecklistStore((s) => s.setActiveList)
  const activeProjectId = useProjectStore((s) => s.activeProjectId)
  const setMobileView = useUIStore((s) => s.setMobileView)

  const list = useMemo(
    () => allItems.find((i) => i.id === activeListId) ?? null,
    [allItems, activeListId]
  )
  const items = useMemo(
    () => (list ? allItems.filter((i) => i.parent_id === list.id) : []),
    [allItems, list]
  )

  const lists = useMemo(() => allItems.filter((i) => i.parent_id === null), [allItems])

  const [draft, setDraft] = useState('')

  if (loading && !list) return <EditorSkeleton />

  if (!list) {
    return (
      <WelcomePanel
        heading="No checklist selected"
        hint="Create or pick a checklist from the list"
        recent={lists.slice(0, 4).map((l) => ({
          id: l.id,
          title: l.content,
          updated_at: l.updated_at,
        }))}
        onSelect={(id) => {
          setActiveList(id)
          setMobileView('editor')
        }}
        onCreate={async () => {
          if (!activeProjectId) return
          await createList(activeProjectId)
          setMobileView('editor')
        }}
        createLabel="New Checklist"
        disabled={!activeProjectId}
      />
    )
  }

  const completed = items.filter((i) => i.is_completed).length
  const total = items.length

  const handleAdd = async () => {
    const content = draft.trim()
    if (!content || !activeProjectId) return
    await createItem(activeProjectId, list.id, content)
    setDraft('')
  }

  const handleDeleteList = async () => {
    const ok = await confirmDialog({
      title: 'Delete this checklist?',
      description:
        items.length > 0
          ? `This will delete the list and all ${items.length} item${items.length === 1 ? '' : 's'}. This cannot be undone.`
          : 'This action cannot be undone.',
      confirmText: 'Delete',
      variant: 'danger',
    })
    if (ok) await deleteItem(list.id)
  }

  return (
    <>
      <header className="border-b border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {/* Mobile nav row: back + delete */}
        <div className="flex items-center justify-between px-2 pb-1 pt-2 sm:hidden">
          <button
            onClick={() => setMobileView('list')}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            onClick={handleDeleteList}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
            aria-label="Delete checklist"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="w-full px-4 pb-4 pt-2 sm:pt-5 md:px-6 md:pt-6">
          <div className="flex items-start justify-between gap-3">
            <input
              value={list.content}
              onChange={(e) => updateItem(list.id, { content: e.target.value })}
              placeholder="Untitled list"
              className="w-full bg-transparent text-xl font-semibold outline-none placeholder:text-gray-300 dark:placeholder:text-zinc-700 md:text-2xl"
            />
            <button
              onClick={handleDeleteList}
              className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 sm:flex"
              aria-label="Delete checklist"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs text-gray-500 dark:text-zinc-400">
            <span>
              {completed} / {total} completed
            </span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-zinc-800 md:max-w-[8rem]">
              <div
                className="h-full bg-brand-500 transition-all duration-300"
                style={{ width: `${total ? (completed / total) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className=" px-6 py-4">
          <ul className="space-y-0.5">
            {items.map((item) => (
              <li
                key={item.id}
                className="group flex min-h-[44px] items-center gap-3 rounded-lg px-2 py-2 hover:bg-gray-50 dark:hover:bg-zinc-900"
              >
                <button
                  onClick={() => toggleComplete(item.id)}
                  className={clsx(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition md:h-5 md:w-5',
                    item.is_completed
                      ? 'border-brand-500 bg-brand-500 text-white'
                      : 'border-gray-300 hover:border-brand-400 dark:border-zinc-600'
                  )}
                >
                  {item.is_completed && <Check className="h-3.5 w-3.5" />}
                </button>
                <input
                  value={item.content}
                  onChange={(e) => updateItem(item.id, { content: e.target.value })}
                  className={clsx(
                    'flex-1 bg-transparent text-sm outline-none',
                    item.is_completed &&
                      'text-gray-400 line-through dark:text-zinc-500'
                  )}
                />
                {/* Always visible on mobile, hover-reveal on desktop */}
                <button
                  onClick={() => deleteItem(item.id)}
                  className="p-1 sm:opacity-0 sm:transition sm:group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5 text-gray-400 hover:text-red-500" />
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-2 flex min-h-[44px] items-center gap-3 rounded-lg px-2 py-2 focus-within:bg-gray-50 dark:focus-within:bg-zinc-900/50">
            <Plus className="h-4 w-4 shrink-0 text-gray-400" />
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd()
              }}
              placeholder="Add an item..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>
    </>
  )
}
