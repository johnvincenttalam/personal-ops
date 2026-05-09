import { useEffect, useMemo, useState } from 'react'
import { Plus, ListChecks, Trash2, ArrowRight } from 'lucide-react'
import clsx from 'clsx'
import { useChecklistStore } from '@/stores/useChecklistStore'
import { useProjectStore } from '@/stores/useProjectStore'
import { useUIStore } from '@/stores/useUIStore'
import EmptyTemplates from '@/components/shared/EmptyTemplates'
import { ChecklistListSkeleton } from '@/components/shared/Skeletons'
import { confirmDialog } from '@/components/shared/ConfirmDialog'
import { colorDot } from '@/components/shared/colors'
import { CHECKLIST_TEMPLATES } from '@/data/templates'

export default function ChecklistsList() {
  const activeProjectId = useProjectStore((s) => s.activeProjectId)
  const projects = useProjectStore((s) => s.projects)
  const items = useChecklistStore((s) => s.items)
  const activeListId = useChecklistStore((s) => s.activeListId)
  const loading = useChecklistStore((s) => s.loading)
  const fetchAll = useChecklistStore((s) => s.fetchAll)
  const setActiveList = useChecklistStore((s) => s.setActiveList)
  const createList = useChecklistStore((s) => s.createList)
  const deleteItem = useChecklistStore((s) => s.deleteItem)
  const moveList = useChecklistStore((s) => s.moveList)
  const setMobileView = useUIStore((s) => s.setMobileView)

  const [movingId, setMovingId] = useState<string | null>(null)

  useEffect(() => {
    if (activeProjectId) fetchAll(activeProjectId)
  }, [activeProjectId, fetchAll])

  const otherProjects = useMemo(
    () => projects.filter((p) => p.id !== activeProjectId),
    [projects, activeProjectId]
  )

  const lists = items.filter((i) => i.parent_id === null)

  const handleDelete = async (e: React.MouseEvent, id: string, title: string, childCount: number) => {
    e.stopPropagation()
    const ok = await confirmDialog({
      title: `Delete "${title || 'Untitled list'}"?`,
      description:
        childCount > 0
          ? `This will delete the list and all ${childCount} item${childCount === 1 ? '' : 's'}. This cannot be undone.`
          : 'This action cannot be undone.',
      confirmText: 'Delete',
      variant: 'danger',
    })
    if (ok) await deleteItem(id)
  }

  const handleMove = async (listId: string, targetProjectId: string) => {
    setMovingId(null)
    await moveList(listId, targetProjectId)
  }

  const openList = (id: string) => {
    setActiveList(id)
    setMobileView('editor')
  }

  const handleNew = async () => {
    if (!activeProjectId) return
    await createList(activeProjectId)
    setMobileView('editor')
  }

  const handlePickTemplate = async (id: string) => {
    if (!activeProjectId) return
    const template = CHECKLIST_TEMPLATES.find((t) => t.id === id)
    if (!template) return
    const built = template.build()
    await createList(activeProjectId, built.content, built.items)
    setMobileView('editor')
  }

  return (
    <>
      <div className="px-5 pb-3 pt-5">
        <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100">Checklists</h2>
      </div>

      <div className="border-b border-gray-200 dark:border-zinc-800" />

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <ChecklistListSkeleton />
        ) : lists.map((list) => {
          const completed = items.filter((i) => i.parent_id === list.id && i.is_completed).length
          const total = items.filter((i) => i.parent_id === list.id).length
          return (
            <div
              key={list.id}
              className={clsx(
                'group cursor-pointer border-b border-l-2 border-gray-100 transition-colors dark:border-zinc-800',
                activeListId === list.id
                  ? 'border-l-brand-500 bg-brand-50/50 dark:bg-brand-500/5'
                  : 'border-l-transparent hover:bg-gray-50/80 dark:hover:bg-zinc-800/30'
              )}
            >
              <button
                onClick={() => openList(list.id)}
                className="block w-full px-5 pt-3.5 pb-1 text-left"
              >
                <div className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4 shrink-0 text-brand-500" />
                  <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-zinc-100">
                    {list.content || 'Untitled list'}
                  </h3>
                </div>
              </button>

              <div className="flex items-center justify-between px-5 pb-3.5 pt-1">
                <span className="text-[11px] text-gray-400 dark:text-zinc-500">
                  {completed} / {total} done
                </span>
                <div className="flex items-center gap-0.5 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                  {otherProjects.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setMovingId(movingId === list.id ? null : list.id)
                      }}
                      className={clsx(
                        'rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-zinc-700',
                        movingId === list.id && 'bg-gray-200 text-gray-600 dark:bg-zinc-700'
                      )}
                      title="Move to project"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    onClick={(e) => handleDelete(e, list.id, list.content, total)}
                    className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {movingId === list.id && (
                <div className="border-t border-gray-100 px-5 pb-3 pt-2 dark:border-zinc-800">
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                    Move to project
                  </p>
                  <div className="space-y-0.5">
                    {otherProjects.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleMove(list.id, p.id)}
                        className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs hover:bg-gray-100 dark:hover:bg-zinc-800"
                      >
                        <span className={clsx('h-2 w-2 shrink-0 rounded-full', colorDot[p.color])} />
                        <span className="truncate text-gray-700 dark:text-zinc-300">{p.name}</span>
                      </button>
                    ))}
                    <button
                      onClick={() => setMovingId(null)}
                      className="w-full rounded px-2 py-1.5 text-left text-xs text-gray-400 hover:bg-gray-100 dark:text-zinc-500 dark:hover:bg-zinc-800"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {!loading && lists.length === 0 && (
          <EmptyTemplates
            heading="Start with a template"
            subheading="Or create a blank checklist"
            templates={CHECKLIST_TEMPLATES}
            onPick={handlePickTemplate}
            onBlank={handleNew}
            blankLabel="Blank checklist"
            disabledMessage={
              !activeProjectId ? 'Create a project first.' : undefined
            }
          />
        )}
      </div>

      <button
        onClick={handleNew}
        disabled={!activeProjectId}
        className="hidden md:flex items-center justify-center gap-2 border-t border-gray-200 px-5 py-3 text-sm font-medium text-brand-600 transition hover:bg-gray-50 disabled:opacity-40 dark:border-zinc-800 dark:text-brand-400 dark:hover:bg-zinc-800/50"
      >
        <Plus className="h-4 w-4" /> New Checklist
      </button>
    </>
  )
}
