import { useEffect, useMemo, useState } from 'react'
import { Plus, Star, Trash2, Copy, ArrowRight } from 'lucide-react'
import clsx from 'clsx'
import { useNoteStore } from '@/stores/useNoteStore'
import { useProjectStore } from '@/stores/useProjectStore'
import { useUIStore } from '@/stores/useUIStore'
import { relativeLabel } from '@/components/shared/formatDate'
import EmptyTemplates from '@/components/shared/EmptyTemplates'
import { NoteListSkeleton } from '@/components/shared/Skeletons'
import { confirmDialog } from '@/components/shared/ConfirmDialog'
import { colorDot } from '@/components/shared/colors'
import StatusBadge from '@/components/shared/StatusBadge'
import { TagPills } from '@/components/shared/TagsEditor'
import { NOTE_TEMPLATES } from '@/data/templates'
import type { Note } from '@/types'

export default function NotesList() {
  const activeProjectId = useProjectStore((s) => s.activeProjectId)
  const projects = useProjectStore((s) => s.projects)
  const notes = useNoteStore((s) => s.notes)
  const activeNoteId = useNoteStore((s) => s.activeNoteId)
  const loading = useNoteStore((s) => s.loading)
  const fetchNotes = useNoteStore((s) => s.fetchNotes)
  const setActiveNote = useNoteStore((s) => s.setActiveNote)
  const createNote = useNoteStore((s) => s.createNote)
  const deleteNote = useNoteStore((s) => s.deleteNote)
  const togglePin = useNoteStore((s) => s.togglePin)
  const duplicateNote = useNoteStore((s) => s.duplicateNote)
  const moveNote = useNoteStore((s) => s.moveNote)
  const setMobileView = useUIStore((s) => s.setMobileView)

  const [tab, setTab] = useState<'all' | 'pinned'>('all')
  const [movingId, setMovingId] = useState<string | null>(null)

  useEffect(() => {
    if (activeProjectId) fetchNotes(activeProjectId)
  }, [activeProjectId, fetchNotes])

  const otherProjects = useMemo(
    () => projects.filter((p) => p.id !== activeProjectId),
    [projects, activeProjectId]
  )

  const filtered = useMemo(() => {
    if (tab === 'pinned') return notes.filter((n) => n.is_pinned)
    return notes
  }, [notes, tab])

  const grouped = useMemo((): { label: string; items: Note[] }[] | null => {
    if (tab !== 'all') return null
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const yesterdayStart = new Date(todayStart)
    yesterdayStart.setDate(yesterdayStart.getDate() - 1)

    const pinned = filtered.filter((n) => n.is_pinned)
    const unpinned = filtered.filter((n) => !n.is_pinned)

    const groups: { label: string; items: Note[] }[] = []
    if (pinned.length) groups.push({ label: 'Pinned', items: pinned })

    const todayItems = unpinned.filter((n) => new Date(n.updated_at) >= todayStart)
    const yesterdayItems = unpinned.filter((n) => {
      const d = new Date(n.updated_at)
      return d >= yesterdayStart && d < todayStart
    })
    const olderItems = unpinned.filter((n) => new Date(n.updated_at) < yesterdayStart)

    if (todayItems.length) groups.push({ label: 'Today', items: todayItems })
    if (yesterdayItems.length) groups.push({ label: 'Yesterday', items: yesterdayItems })
    if (olderItems.length) groups.push({ label: 'Older', items: olderItems })

    return groups.length ? groups : null
  }, [filtered, tab])

  const openNote = (id: string) => {
    setActiveNote(id)
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
    if (ok) await deleteNote(id)
  }

  const handleMove = async (noteId: string, targetProjectId: string) => {
    setMovingId(null)
    await moveNote(noteId, targetProjectId)
  }

  const handleNew = async () => {
    if (!activeProjectId) return
    await createNote(activeProjectId)
    setMobileView('editor')
  }

  const handlePickTemplate = async (id: string) => {
    if (!activeProjectId) return
    const template = NOTE_TEMPLATES.find((t) => t.id === id)
    if (!template) return
    await createNote(activeProjectId, template.build())
    setMobileView('editor')
  }

  const renderCard = (note: Note) => (
    <div
      key={note.id}
      className={clsx(
        'group cursor-pointer border-b border-l-2 border-gray-100 transition-colors dark:border-zinc-800',
        activeNoteId === note.id
          ? 'border-l-brand-500 bg-brand-50/50 dark:bg-brand-500/5'
          : 'border-l-transparent hover:bg-gray-50/80 dark:hover:bg-zinc-800/30'
      )}
    >
      <button
        onClick={() => openNote(note.id)}
        className="block w-full px-5 pt-3.5 pb-1 text-left"
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-zinc-100">
            {note.title || 'Untitled'}
          </h3>
          {note.is_pinned && (
            <Star className="h-3.5 w-3.5 shrink-0 fill-brand-500 text-brand-500" />
          )}
        </div>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500 dark:text-zinc-400">
          {note.content || 'No content'}
        </p>
        {(note.tags?.length > 0 || note.status !== 'draft') && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {note.status !== 'draft' && <StatusBadge status={note.status} />}
            <TagPills tags={note.tags ?? []} maxDisplay={3} />
          </div>
        )}
      </button>

      {/* Date + actions — always visible on mobile, hover-reveal on desktop */}
      <div className="flex items-center justify-between px-5 pb-3.5 pt-1">
        <span className="text-[11px] text-gray-400 dark:text-zinc-500">
          {relativeLabel(note.updated_at)}
        </span>
        <div className="flex items-center gap-0.5 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
          <button
            onClick={(e) => { e.stopPropagation(); togglePin(note.id) }}
            className="rounded p-1.5 text-gray-400 hover:bg-gray-200 hover:text-brand-500 dark:hover:bg-zinc-700"
            title={note.is_pinned ? 'Unpin' : 'Pin'}
          >
            <Star className={clsx('h-3.5 w-3.5', note.is_pinned && 'fill-brand-500 text-brand-500')} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); duplicateNote(note.id) }}
            className="rounded p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-zinc-700"
            title="Duplicate"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          {otherProjects.length > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setMovingId(movingId === note.id ? null : note.id) }}
              className={clsx(
                'rounded p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-zinc-700',
                movingId === note.id && 'bg-gray-200 text-gray-600 dark:bg-zinc-700'
              )}
              title="Move to project"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={(e) => handleDelete(e, note.id, note.title)}
            className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Move picker */}
      {movingId === note.id && (
        <div className="border-t border-gray-100 px-5 pb-3 pt-2 dark:border-zinc-800">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
            Move to project
          </p>
          <div className="space-y-0.5">
            {otherProjects.map((p) => (
              <button
                key={p.id}
                onClick={() => handleMove(note.id, p.id)}
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
      {/* Header */}
      <div className="px-5 pb-3 pt-5">
        <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100">Notes</h2>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-gray-200 px-5 dark:border-zinc-800">
        {(['all', 'pinned'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              'border-b-2 py-2 text-sm font-medium capitalize transition',
              tab === t
                ? 'border-brand-500 text-brand-600 dark:text-brand-300'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-zinc-400'
            )}
          >
            {t === 'all' ? 'All' : 'Pinned'}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <NoteListSkeleton />
        ) : filtered.length === 0 ? (
          notes.length === 0 ? (
            <EmptyTemplates
              heading="Start with a template"
              subheading="Or create a blank note"
              templates={NOTE_TEMPLATES}
              onPick={handlePickTemplate}
              onBlank={handleNew}
              blankLabel="Blank note"
              disabledMessage={
                !activeProjectId ? 'Create a project first.' : undefined
              }
            />
          ) : (
            <p className="px-5 py-8 text-center text-xs text-gray-400 dark:text-zinc-500">
              No pinned notes
            </p>
          )
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
          filtered.map(renderCard)
        )}
      </div>

      {/* New */}
      <button
        onClick={handleNew}
        disabled={!activeProjectId}
        className="flex min-h-[48px] items-center justify-center gap-2 border-t border-gray-200 px-5 py-3 text-sm font-medium text-brand-600 transition hover:bg-gray-50 disabled:opacity-40 dark:border-zinc-800 dark:text-brand-400 dark:hover:bg-zinc-800/50"
      >
        <Plus className="h-4 w-4" /> New Note
      </button>
    </>
  )
}
