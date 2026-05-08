import { useEffect, useMemo, useState } from 'react'
import { Plus, Star, Trash2, Copy, ArrowRight } from 'lucide-react'
import clsx from 'clsx'
import { usePromptStore } from '@/stores/usePromptStore'
import { useProjectStore } from '@/stores/useProjectStore'
import { useUIStore } from '@/stores/useUIStore'
import { relativeLabel } from '@/components/shared/formatDate'
import EmptyTemplates from '@/components/shared/EmptyTemplates'
import { PromptListSkeleton } from '@/components/shared/Skeletons'
import { confirmDialog } from '@/components/shared/ConfirmDialog'
import { colorDot } from '@/components/shared/colors'
import StatusBadge from '@/components/shared/StatusBadge'
import { TagPills } from '@/components/shared/TagsEditor'
import { PROMPT_TEMPLATES } from '@/data/templates'
import type { Prompt } from '@/types'

export default function PromptsList() {
  const activeProjectId = useProjectStore((s) => s.activeProjectId)
  const projects = useProjectStore((s) => s.projects)
  const prompts = usePromptStore((s) => s.prompts)
  const activePromptId = usePromptStore((s) => s.activePromptId)
  const loading = usePromptStore((s) => s.loading)
  const fetchPrompts = usePromptStore((s) => s.fetchPrompts)
  const setActivePrompt = usePromptStore((s) => s.setActivePrompt)
  const createPrompt = usePromptStore((s) => s.createPrompt)
  const deletePrompt = usePromptStore((s) => s.deletePrompt)
  const togglePin = usePromptStore((s) => s.togglePin)
  const duplicatePrompt = usePromptStore((s) => s.duplicatePrompt)
  const movePrompt = usePromptStore((s) => s.movePrompt)
  const setMobileView = useUIStore((s) => s.setMobileView)

  const [movingId, setMovingId] = useState<string | null>(null)

  useEffect(() => {
    if (activeProjectId) fetchPrompts(activeProjectId)
  }, [activeProjectId, fetchPrompts])

  const otherProjects = useMemo(
    () => projects.filter((p) => p.id !== activeProjectId),
    [projects, activeProjectId]
  )

  const grouped = useMemo((): { label: string; items: Prompt[] }[] | null => {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const yesterdayStart = new Date(todayStart)
    yesterdayStart.setDate(yesterdayStart.getDate() - 1)

    const pinned = prompts.filter((p) => p.is_pinned)
    const unpinned = prompts.filter((p) => !p.is_pinned)

    const groups: { label: string; items: Prompt[] }[] = []
    if (pinned.length) groups.push({ label: 'Pinned', items: pinned })

    const todayItems = unpinned.filter((p) => new Date(p.updated_at) >= todayStart)
    const yesterdayItems = unpinned.filter((p) => {
      const d = new Date(p.updated_at)
      return d >= yesterdayStart && d < todayStart
    })
    const olderItems = unpinned.filter((p) => new Date(p.updated_at) < yesterdayStart)

    if (todayItems.length) groups.push({ label: 'Today', items: todayItems })
    if (yesterdayItems.length) groups.push({ label: 'Yesterday', items: yesterdayItems })
    if (olderItems.length) groups.push({ label: 'Older', items: olderItems })

    return groups.length ? groups : null
  }, [prompts])

  const openPrompt = (id: string) => {
    setActivePrompt(id)
    setMobileView('editor')
  }

  const handleDelete = async (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation()
    const ok = await confirmDialog({
      title: `Delete "${title || 'Untitled'}"?`,
      description: 'This action cannot be undone.',
      confirmText: 'Delete',
      variant: 'danger',
    })
    if (ok) await deletePrompt(id)
  }

  const handleMove = async (promptId: string, targetProjectId: string) => {
    setMovingId(null)
    await movePrompt(promptId, targetProjectId)
  }

  const handleNew = async () => {
    if (!activeProjectId) return
    await createPrompt(activeProjectId)
    setMobileView('editor')
  }

  const handlePickTemplate = async (id: string) => {
    if (!activeProjectId) return
    const template = PROMPT_TEMPLATES.find((t) => t.id === id)
    if (!template) return
    await createPrompt(activeProjectId, template.build())
    setMobileView('editor')
  }

  const renderCard = (prompt: Prompt) => (
    <div
      key={prompt.id}
      className={clsx(
        'group cursor-pointer border-b border-l-2 border-gray-100 transition-colors dark:border-zinc-800',
        activePromptId === prompt.id
          ? 'border-l-brand-500 bg-brand-50/50 dark:bg-brand-500/5'
          : 'border-l-transparent hover:bg-gray-50/80 dark:hover:bg-zinc-800/30'
      )}
    >
      <button
        onClick={() => openPrompt(prompt.id)}
        className="block w-full px-5 pt-3.5 pb-1 text-left"
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-zinc-100">
            {prompt.title || 'Untitled'}
          </h3>
          {prompt.is_pinned && (
            <Star className="h-3.5 w-3.5 shrink-0 fill-brand-500 text-brand-500" />
          )}
        </div>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500 dark:text-zinc-400">
          {prompt.content || 'No content'}
        </p>
        {(prompt.tags?.length > 0 || prompt.status !== 'draft') && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {prompt.status !== 'draft' && <StatusBadge status={prompt.status} />}
            <TagPills tags={prompt.tags ?? []} maxDisplay={3} />
          </div>
        )}
      </button>

      <div className="flex items-center justify-between px-5 pb-3.5 pt-1">
        <span className="text-[11px] text-gray-400 dark:text-zinc-500">
          {relativeLabel(prompt.updated_at)}
        </span>
        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={(e) => { e.stopPropagation(); togglePin(prompt.id) }}
            className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-brand-500 dark:hover:bg-zinc-700"
            title={prompt.is_pinned ? 'Unpin' : 'Pin'}
          >
            <Star className={clsx('h-3.5 w-3.5', prompt.is_pinned && 'fill-brand-500 text-brand-500')} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); duplicatePrompt(prompt.id) }}
            className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-zinc-700"
            title="Duplicate"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          {otherProjects.length > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setMovingId(movingId === prompt.id ? null : prompt.id) }}
              className={clsx(
                'rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-zinc-700',
                movingId === prompt.id && 'bg-gray-200 text-gray-600 dark:bg-zinc-700'
              )}
              title="Move to project"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={(e) => handleDelete(e, prompt.id, prompt.title)}
            className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {movingId === prompt.id && (
        <div className="border-t border-gray-100 px-5 pb-3 pt-2 dark:border-zinc-800">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
            Move to project
          </p>
          <div className="space-y-0.5">
            {otherProjects.map((p) => (
              <button
                key={p.id}
                onClick={() => handleMove(prompt.id, p.id)}
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

  return (
    <>
      <div className="px-5 pb-3 pt-5">
        <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100">Prompts</h2>
      </div>

      <div className="border-b border-gray-200 px-5 py-2 dark:border-zinc-800" />

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <PromptListSkeleton />
        ) : prompts.length === 0 ? (
          <EmptyTemplates
            heading="Start with a template"
            subheading="Or create a blank prompt"
            templates={PROMPT_TEMPLATES}
            onPick={handlePickTemplate}
            onBlank={handleNew}
            blankLabel="Blank prompt"
            disabledMessage={
              !activeProjectId ? 'Create a project first.' : undefined
            }
          />
        ) : grouped ? (
          grouped.map((group) => (
            <div key={group.label}>
              <p className="px-5 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                {group.label}
              </p>
              {group.items.map(renderCard)}
            </div>
          ))
        ) : (
          prompts.map(renderCard)
        )}
      </div>

      <button
        onClick={handleNew}
        disabled={!activeProjectId}
        className="flex items-center justify-center gap-2 border-t border-gray-200 px-5 py-3 text-sm font-medium text-brand-600 transition hover:bg-gray-50 disabled:opacity-40 dark:border-zinc-800 dark:text-brand-400 dark:hover:bg-zinc-800/50"
      >
        <Plus className="h-4 w-4" /> New Prompt
      </button>
    </>
  )
}
