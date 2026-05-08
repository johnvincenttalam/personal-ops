import { useEffect, useRef, useState } from 'react'
import { Star, Trash2, Calendar, Folder, Check, Loader2, Eye, Pencil, Circle, Archive, Link2, MoreVertical } from 'lucide-react'
import MDEditor from '@uiw/react-md-editor'
import clsx from 'clsx'
import { useNoteStore } from '@/stores/useNoteStore'
import { useProjectStore } from '@/stores/useProjectStore'
import { useUIStore } from '@/stores/useUIStore'
import { useAutoSave } from '@/hooks/useAutoSave'
import { fullDate } from '@/components/shared/formatDate'
import WelcomePanel from '@/components/shared/WelcomePanel'
import { confirmDialog } from '@/components/shared/ConfirmDialog'
import { EditorSkeleton } from '@/components/shared/Skeletons'
import StatusBadge from '@/components/shared/StatusBadge'
import TagsEditor from '@/components/shared/TagsEditor'
import SaveToStorageModal from '@/components/shared/SaveToStorageModal'
import LinkPicker from '@/components/shared/LinkPicker'
import MentionMarkdown from '@/components/shared/MentionMarkdown'
import Backlinks from '@/components/shared/Backlinks'
import { formatMention } from '@/domain/rules/parseMentions'
import type { Mention } from '@/domain/rules/parseMentions'
import type { ItemStatus } from '@/types'

export default function NoteEditor() {
  const note = useNoteStore((s) =>
    s.notes.find((n) => n.id === s.activeNoteId) ?? null
  )
  const notes = useNoteStore((s) => s.notes)
  const loading = useNoteStore((s) => s.loading)
  const save = useNoteStore((s) => s.save)
  const togglePin = useNoteStore((s) => s.togglePin)
  const deleteNote = useNoteStore((s) => s.deleteNote)
  const createNote = useNoteStore((s) => s.createNote)
  const setActiveNote = useNoteStore((s) => s.setActiveNote)
  const activeProjectId = useProjectStore((s) => s.activeProjectId)
  const project = useProjectStore((s) =>
    s.projects.find((p) => p.id === note?.project_id) ?? null
  )
  const theme = useUIStore((s) => s.theme)
  const setMobileView = useUIStore((s) => s.setMobileView)

  const [title, setTitle] = useState(note?.title ?? '')
  const [content, setContent] = useState(note?.content ?? '')
  const [noteStatus, setNoteStatus] = useState<ItemStatus>(note?.status ?? 'draft')
  const [tags, setTags] = useState<string[]>(note?.tags ?? [])
  const [mode, setMode] = useState<'edit' | 'preview'>('edit')
  const [showStorageModal, setShowStorageModal] = useState(false)
  const [showLinkPicker, setShowLinkPicker] = useState(false)
  const [showKebab, setShowKebab] = useState(false)
  const kebabRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 })

  useEffect(() => {
    if (!showKebab) return
    const handler = (e: MouseEvent) => {
      if (kebabRef.current && !kebabRef.current.contains(e.target as Node)) setShowKebab(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showKebab])

  useEffect(() => {
    setTitle(note?.title ?? '')
    setContent(note?.content ?? '')
    setNoteStatus(note?.status ?? 'draft')
    setTags(note?.tags ?? [])
    setMode('edit')
  }, [note?.id])

  const { status, flush } = useAutoSave(
    { title, content, status: noteStatus, tags },
    (next) => (note ? save(note, next) : Promise.resolve())
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        flush()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [flush])

  if (loading && !note) return <EditorSkeleton />

  if (!note) {
    return (
      <WelcomePanel
        heading="No note selected"
        hint="Pick one from the list or start fresh"
        recent={notes.slice(0, 4).map((n) => ({
          id: n.id,
          title: n.title,
          updated_at: n.updated_at,
        }))}
        onSelect={(id) => {
          setActiveNote(id)
          setMobileView('editor')
        }}
        onCreate={async () => {
          if (!activeProjectId) return
          await createNote(activeProjectId)
          setMobileView('editor')
        }}
        createLabel="New Note"
        disabled={!activeProjectId}
      />
    )
  }

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length

  const handleDelete = async () => {
    const ok = await confirmDialog({
      title: 'Delete this note?',
      description: 'This action cannot be undone.',
      confirmText: 'Delete',
      variant: 'danger',
    })
    if (ok) await deleteNote(note.id)
  }

  const insertMention = (m: Mention) => {
    const literal = formatMention(m)
    const { start, end } = cursorRef.current
    if (start <= 0 && end <= 0) {
      setContent((c) => `${c}${c.endsWith('\n') || c === '' ? '' : ' '}${literal} `)
      return
    }
    setContent((c) => c.slice(0, start) + literal + c.slice(end))
  }

  return (
    <>
      <header className="bg-white dark:bg-zinc-900">
        <div className="flex w-full items-start justify-between gap-3 px-4 pb-3 pt-4 md:px-6 md:pb-4 md:pt-6">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled"
            className="w-full bg-transparent text-xl font-semibold outline-none placeholder:text-gray-300 dark:placeholder:text-zinc-700 md:text-2xl"
          />
          {/* Mobile: kebab menu */}
          <div className="relative shrink-0 sm:hidden" ref={kebabRef}>
            <button
              onClick={() => setShowKebab((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
              aria-label="More actions"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
            {showKebab && (
              <div className="absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                <button
                  onClick={() => { setShowLinkPicker(true); setShowKebab(false) }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  <Link2 className="h-4 w-4 shrink-0 text-gray-400" /> Insert link
                </button>
                <button
                  onClick={() => { setShowStorageModal(true); setShowKebab(false) }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  <Archive className="h-4 w-4 shrink-0 text-gray-400" /> Save to Storage
                </button>
                <button
                  onClick={() => { togglePin(note.id); setShowKebab(false) }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  <Star className={clsx('h-4 w-4 shrink-0', note.is_pinned ? 'fill-brand-500 text-brand-500' : 'text-gray-400')} />
                  {note.is_pinned ? 'Unpin' : 'Pin'}
                </button>
                <div className="border-t border-gray-100 dark:border-zinc-800" />
                <button
                  onClick={() => { handleDelete(); setShowKebab(false) }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4 shrink-0" /> Delete note
                </button>
              </div>
            )}
          </div>

          {/* Desktop: individual icon buttons */}
          <div className="hidden shrink-0 items-center gap-0.5 sm:flex">
            <button
              onClick={() => setShowLinkPicker(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-zinc-800"
              title="Insert link"
            >
              <Link2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowStorageModal(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-zinc-800"
              title="Save to Storage"
            >
              <Archive className="h-4 w-4" />
            </button>
            <button
              onClick={() => togglePin(note.id)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-zinc-800"
              aria-label="Pin note"
            >
              <Star className={clsx('h-4 w-4', note.is_pinned && 'fill-brand-500 text-brand-500')} />
            </button>
            <button
              onClick={handleDelete}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
              aria-label="Delete note"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 border-b border-gray-200 bg-white px-4 pb-3 pt-2 text-xs text-gray-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 md:px-6 md:pt-3">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" /> {fullDate(note.updated_at)}
        </span>
        {project && (
          <span className="flex items-center gap-1.5">
            <Folder className="h-3.5 w-3.5" /> {project.name}
          </span>
        )}
        <StatusBadge status={noteStatus} onChange={setNoteStatus} />
        <TagsEditor tags={tags} onChange={setTags} />
      </div>

      <div className="flex-1 overflow-y-auto" data-color-mode={theme}>
        <div className="px-4 py-3 md:px-6">
          {mode === 'edit' ? (
            <MDEditor
              value={content}
              onChange={(v) => setContent(v ?? '')}
              height="100%"
              visibleDragbar={false}
              preview="edit"
              hideToolbar={false}
              textareaProps={{
                placeholder: 'Start writing...',
                onSelect: (e) => {
                  const t = e.currentTarget
                  cursorRef.current = { start: t.selectionStart, end: t.selectionEnd }
                },
                onKeyUp: (e) => {
                  const t = e.currentTarget
                  cursorRef.current = { start: t.selectionStart, end: t.selectionEnd }
                },
                onClick: (e) => {
                  const t = e.currentTarget
                  cursorRef.current = { start: t.selectionStart, end: t.selectionEnd }
                },
              }}
            />
          ) : (
            <MentionMarkdown source={content} className="wmde-markdown" />
          )}
        </div>
      </div>
      <Backlinks itemId={note.id} selfId={note.id} />

      <div className="border-t border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex w-full items-center justify-between px-4 py-2 text-xs text-gray-500 dark:text-zinc-400 md:px-6">
          <span className="flex items-center gap-1.5">
            {status === 'saving' ? (
              <><Loader2 className="h-3 w-3 animate-spin" />Saving...</>
            ) : status === 'unsaved' ? (
              <><Circle className="h-2 w-2 fill-amber-400 text-amber-400" />Unsaved</>
            ) : (
              <><Check className="h-3 w-3 text-emerald-500" />Saved</>
            )}
          </span>
          <div className="flex items-center gap-3">
            {wordCount > 0 && <span>{wordCount} words</span>}
            <button
              onClick={() => setMode(mode === 'edit' ? 'preview' : 'edit')}
              className="flex items-center gap-1 rounded px-2 py-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
              title={mode === 'edit' ? 'Preview' : 'Edit'}
            >
              {mode === 'edit' ? <Eye className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
              <span>{mode === 'edit' ? 'Preview' : 'Edit'}</span>
            </button>
          </div>
        </div>
      </div>
      {showStorageModal && note.project_id && (
        <SaveToStorageModal
          projectId={note.project_id}
          defaultName={title || 'Untitled note'}
          defaultContent={content}
          defaultTags={tags}
          sourceType="note"
          sourceId={note.id}
          onClose={() => setShowStorageModal(false)}
        />
      )}
      {showLinkPicker && (
        <LinkPicker
          excludeId={note.id}
          onPick={insertMention}
          onClose={() => setShowLinkPicker(false)}
        />
      )}
    </>
  )
}
