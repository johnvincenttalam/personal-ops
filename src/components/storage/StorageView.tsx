import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Copy, Check, Trash2, Loader2, Calendar, Folder, Sparkles, FileText, Hand, Circle, Link2 } from 'lucide-react'
import CodeMirror, { type ReactCodeMirrorRef } from '@uiw/react-codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'
import { useStorageStore } from '@/stores/useStorageStore'
import { useProjectStore } from '@/stores/useProjectStore'
import { useUIStore } from '@/stores/useUIStore'
import { useAutoSave } from '@/hooks/useAutoSave'
import { fullDate } from '@/components/shared/formatDate'
import { confirmDialog } from '@/components/shared/ConfirmDialog'
import { EditorSkeleton } from '@/components/shared/Skeletons'
import TagsEditor from '@/components/shared/TagsEditor'
import LinkPicker from '@/components/shared/LinkPicker'
import Backlinks from '@/components/shared/Backlinks'
import { formatMention } from '@/domain/rules/parseMentions'
import type { Mention } from '@/domain/rules/parseMentions'
import type { StorageSourceType } from '@/types'

const SOURCE_ICON: Record<StorageSourceType, typeof FileText> = {
  prompt: Sparkles,
  note: FileText,
  manual: Hand,
}

const lightTheme = EditorView.theme({
  '&': { background: 'transparent' },
  '.cm-gutters': { background: 'transparent', borderRight: '1px solid #e5e7eb', color: '#9ca3af' },
  '.cm-activeLineGutter': { background: 'transparent' },
  '.cm-content': { padding: '0' },
  '.cm-scroller': { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' },
})

const darkTheme = EditorView.theme({
  '&': { background: 'transparent' },
  '.cm-gutters': { background: 'transparent', borderRight: '1px solid #27272a', color: '#52525b' },
  '.cm-activeLineGutter': { background: 'transparent' },
  '.cm-content': { padding: '0' },
  '.cm-scroller': { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' },
})

export default function StorageView() {
  const item = useStorageStore((s) =>
    s.items.find((i) => i.id === s.activeItemId) ?? null
  )
  const items = useStorageStore((s) => s.items)
  const loading = useStorageStore((s) => s.loading)
  const save = useStorageStore((s) => s.save)
  const deleteItem = useStorageStore((s) => s.deleteItem)
  const createItem = useStorageStore((s) => s.createItem)
  const setActiveItem = useStorageStore((s) => s.setActiveItem)
  const activeProjectId = useProjectStore((s) => s.activeProjectId)
  const project = useProjectStore((s) =>
    s.projects.find((p) => p.id === item?.project_id) ?? null
  )
  const theme = useUIStore((s) => s.theme)
  const setMobileView = useUIStore((s) => s.setMobileView)

  const [name, setName] = useState(item?.name ?? '')
  const [description, setDescription] = useState(item?.description ?? '')
  const [content, setContent] = useState(item?.content ?? '')
  const [tags, setTags] = useState<string[]>(item?.tags ?? [])
  const [copied, setCopied] = useState(false)
  const [showLinkPicker, setShowLinkPicker] = useState(false)
  const cmRef = useRef<ReactCodeMirrorRef>(null)

  useEffect(() => {
    setName(item?.name ?? '')
    setDescription(item?.description ?? '')
    setContent(item?.content ?? '')
    setTags(item?.tags ?? [])
  }, [item?.id])

  const { status, flush } = useAutoSave(
    { name, description, content, tags },
    (next) => (item ? save(item, next) : Promise.resolve())
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

  if (loading && !item) return <EditorSkeleton />

  if (!item) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-8">
        <div className="text-center">
          <h2 className="text-base font-semibold text-gray-900 dark:text-zinc-100">
            No storage item selected
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
            Pick one from the list or save a new snippet
          </p>
        </div>
        {items.length > 0 && (
          <div className="w-full max-w-xs space-y-0.5">
            {items.slice(0, 4).map((i) => (
              <button
                key={i.id}
                onClick={() => { setActiveItem(i.id); setMobileView('editor') }}
                className="flex w-full items-baseline justify-between gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-gray-100 dark:hover:bg-zinc-800"
              >
                <span className="truncate text-sm text-gray-800 dark:text-zinc-200">
                  {i.name || 'Untitled'}
                </span>
              </button>
            ))}
          </div>
        )}
        <button
          onClick={async () => {
            if (!activeProjectId) return
            await createItem(activeProjectId)
            setMobileView('editor')
          }}
          disabled={!activeProjectId}
          className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          New snippet
        </button>
      </div>
    )
  }

  const SourceIcon = SOURCE_ICON[item.source_type] ?? Hand

  const handleDelete = async () => {
    const ok = await confirmDialog({
      title: 'Delete this snippet?',
      description: 'This action cannot be undone.',
      confirmText: 'Delete',
      variant: 'danger',
    })
    if (ok) await deleteItem(item.id)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const insertMention = (m: Mention) => {
    const literal = formatMention(m)
    const view = cmRef.current?.view
    if (view) {
      const { from, to } = view.state.selection.main
      view.dispatch({
        changes: { from, to, insert: literal },
        selection: { anchor: from + literal.length },
      })
      view.focus()
      return
    }
    setContent((c) => `${c}${c.endsWith('\n') || c === '' ? '' : ' '}${literal} `)
  }

  return (
    <>
      <header className="border-b border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {/* Mobile nav row: back + actions */}
        <div className="flex items-center justify-between px-2 pb-1 pt-2 sm:hidden">
          <button
            onClick={() => setMobileView('list')}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-0.5">
            <button onClick={handleCopy} className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-zinc-800" title={copied ? 'Copied!' : 'Copy content'}>
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            </button>
            <button onClick={() => setShowLinkPicker(true)} className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-zinc-800" title="Insert link">
              <Link2 className="h-4 w-4" />
            </button>
            <button onClick={handleDelete} className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex w-full items-start justify-between gap-4 px-4 pb-2 pt-2 sm:pt-6 md:px-6">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Snippet name"
            className="w-full bg-transparent text-xl font-semibold outline-none placeholder:text-gray-300 dark:placeholder:text-zinc-700 sm:text-2xl"
          />
          <div className="hidden items-center gap-1 sm:flex">
            <button onClick={handleCopy} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-zinc-800" title={copied ? 'Copied!' : 'Copy content'}>
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            </button>
            <button onClick={() => setShowLinkPicker(true)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-zinc-800" title="Insert link">
              <Link2 className="h-4 w-4" />
            </button>
            <button onClick={handleDelete} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="px-6 pb-3">
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description (optional)"
            className="w-full bg-transparent text-sm text-gray-600 outline-none placeholder:text-gray-300 dark:text-zinc-400 dark:placeholder:text-zinc-700"
          />
        </div>
        <div className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 px-6 pb-3 text-xs text-gray-500 dark:text-zinc-400">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" /> {fullDate(item.updated_at)}
          </span>
          {project && (
            <span className="flex items-center gap-1.5">
              <Folder className="h-3.5 w-3.5" /> {project.name}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <SourceIcon className="h-3.5 w-3.5" />
            {item.source_type === 'prompt' && 'From prompt'}
            {item.source_type === 'note' && 'From note'}
            {item.source_type === 'manual' && 'Manual entry'}
          </span>
          <TagsEditor tags={tags} onChange={setTags} />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <CodeMirror
          ref={cmRef}
          value={content}
          onChange={(val) => setContent(val)}
          extensions={[
            markdown(),
            EditorView.lineWrapping,
            theme === 'dark' ? darkTheme : lightTheme,
          ]}
          theme={theme === 'dark' ? oneDark : 'light'}
          basicSetup={{ lineNumbers: true, foldGutter: false, highlightActiveLine: true, highlightActiveLineGutter: true }}
          className="min-h-full text-[13px]"
          style={{ minHeight: 'calc(100vh - 260px)' }}
        />
      </div>
      <Backlinks itemId={item.id} selfId={item.id} />

      <div className="border-t border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex w-full items-center justify-between px-6 py-2 text-xs text-gray-500 dark:text-zinc-400">
          <span className="flex items-center gap-1.5">
            {status === 'saving' ? (
              <><Loader2 className="h-3 w-3 animate-spin" />Saving...</>
            ) : status === 'unsaved' ? (
              <><Circle className="h-2 w-2 fill-amber-400 text-amber-400" />Unsaved</>
            ) : (
              <><Check className="h-3 w-3 text-emerald-500" />Saved</>
            )}
          </span>
          <span>{content.length} chars</span>
        </div>
      </div>
      {showLinkPicker && (
        <LinkPicker
          excludeId={item.id}
          onPick={insertMention}
          onClose={() => setShowLinkPicker(false)}
        />
      )}
    </>
  )
}
