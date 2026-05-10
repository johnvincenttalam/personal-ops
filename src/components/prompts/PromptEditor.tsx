import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Star, Copy, Check, Trash2, Loader2, Eye, Pencil, Circle, Archive, Link2, MoreVertical, Download } from 'lucide-react'
import CodeMirror, { type ReactCodeMirrorRef } from '@uiw/react-codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'
import clsx from 'clsx'
import { usePromptStore } from '@/stores/usePromptStore'
import { useProjectStore } from '@/stores/useProjectStore'
import { useUIStore } from '@/stores/useUIStore'
import { useAutoSave } from '@/hooks/useAutoSave'
import WelcomePanel from '@/components/shared/WelcomePanel'
import { confirmDialog } from '@/components/shared/ConfirmDialog'
import { EditorSkeleton } from '@/components/shared/Skeletons'
import StatusBadge from '@/components/shared/StatusBadge'
import TagsEditor from '@/components/shared/TagsEditor'
import SaveToStorageModal from '@/components/shared/SaveToStorageModal'
import ExportMenu from '@/components/shared/ExportMenu'
import { downloadTextFile, slugifyFilename } from '@/lib/download'
import LinkPicker from '@/components/shared/LinkPicker'
import MentionMarkdown from '@/components/shared/MentionMarkdown'
import Backlinks from '@/components/shared/Backlinks'
import { formatMention } from '@/domain/rules/parseMentions'
import type { Mention } from '@/domain/rules/parseMentions'
import type { ItemStatus } from '@/types'

const lightTheme = EditorView.theme({
  '&': { background: 'transparent' },
  '.cm-gutters': {
    background: 'transparent',
    borderRight: '1px solid #e5e7eb',
    color: '#9ca3af',
  },
  '.cm-activeLineGutter': { background: 'transparent' },
  '.cm-content': { padding: '0' },
  '.cm-scroller': { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' },
})

const darkTheme = EditorView.theme({
  '&': { background: 'transparent' },
  '.cm-gutters': {
    background: 'transparent',
    borderRight: '1px solid #27272a',
    color: '#52525b',
  },
  '.cm-activeLineGutter': { background: 'transparent' },
  '.cm-content': { padding: '0' },
  '.cm-scroller': { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' },
})

export default function PromptEditor() {
  const prompt = usePromptStore((s) =>
    s.prompts.find((p) => p.id === s.activePromptId) ?? null
  )
  const prompts = usePromptStore((s) => s.prompts)
  const loading = usePromptStore((s) => s.loading)
  const save = usePromptStore((s) => s.save)
  const togglePin = usePromptStore((s) => s.togglePin)
  const deletePrompt = usePromptStore((s) => s.deletePrompt)
  const setActivePrompt = usePromptStore((s) => s.setActivePrompt)
  const activeProjectId = useProjectStore((s) => s.activeProjectId)
  const theme = useUIStore((s) => s.theme)
  const setMobileView = useUIStore((s) => s.setMobileView)

  const [title, setTitle] = useState(prompt?.title ?? '')
  const [content, setContent] = useState(prompt?.content ?? '')
  const [promptStatus, setPromptStatus] = useState<ItemStatus>(prompt?.status ?? 'draft')
  const [tags, setTags] = useState<string[]>(prompt?.tags ?? [])
  const [copied, setCopied] = useState(false)
  const [mode, setMode] = useState<'edit' | 'preview'>('edit')
  const [showStorageModal, setShowStorageModal] = useState(false)
  const [showLinkPicker, setShowLinkPicker] = useState(false)
  const [showKebab, setShowKebab] = useState(false)
  const kebabRef = useRef<HTMLDivElement>(null)
  const cmRef = useRef<ReactCodeMirrorRef>(null)

  useEffect(() => {
    if (!showKebab) return
    const handler = (e: MouseEvent) => {
      if (kebabRef.current && !kebabRef.current.contains(e.target as Node)) setShowKebab(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showKebab])

  useEffect(() => {
    setTitle(prompt?.title ?? '')
    setContent(prompt?.content ?? '')
    setPromptStatus(prompt?.status ?? 'draft')
    setTags(prompt?.tags ?? [])
    setMode('edit')
  }, [prompt?.id])

  const { status, flush } = useAutoSave(
    { title, content, status: promptStatus, tags },
    (next) => (prompt ? save(prompt, next) : Promise.resolve())
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

  if (loading && !prompt) return <EditorSkeleton />

  if (!prompt) {
    return (
      <WelcomePanel
        heading="No prompt selected"
        hint="Pick one from the list or start fresh"
        recent={prompts.slice(0, 4).map((p) => ({
          id: p.id,
          title: p.title,
          updated_at: p.updated_at,
        }))}
        onSelect={(id) => {
          setActivePrompt(id)
          setMobileView('editor')
        }}
        onCreate={() => {
          if (!activeProjectId) return
          useUIStore.getState().openNewItem('prompts')
        }}
        createLabel="New Prompt"
        disabled={!activeProjectId}
      />
    )
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleDelete = async () => {
    const ok = await confirmDialog({
      title: 'Delete this prompt?',
      description: 'This action cannot be undone.',
      confirmText: 'Delete',
      variant: 'danger',
    })
    if (ok) await deletePrompt(prompt.id)
  }

  const handleDownload = (ext: 'md' | 'txt') => {
    const base = slugifyFilename(title || 'untitled-prompt')
    const mime = ext === 'md' ? 'text/markdown' : 'text/plain'
    downloadTextFile(`${base}.${ext}`, content, mime)
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
        {/* Mobile nav row: back + kebab */}
        <div className="flex items-center justify-between px-2 pb-1 pt-2 sm:hidden">
          <button
            onClick={() => setMobileView('list')}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="relative" ref={kebabRef}>
            <button
              onClick={() => setShowKebab((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
              aria-label="More actions"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
            {showKebab && (
              <div className="absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                <button onClick={() => { handleCopy(); setShowKebab(false) }} className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 dark:text-zinc-200 dark:hover:bg-zinc-800">
                  {copied ? <Check className="h-4 w-4 shrink-0 text-emerald-500" /> : <Copy className="h-4 w-4 shrink-0 text-gray-400" />}
                  {copied ? 'Copied!' : 'Copy content'}
                </button>
                <button onClick={() => { setShowLinkPicker(true); setShowKebab(false) }} className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 dark:text-zinc-200 dark:hover:bg-zinc-800">
                  <Link2 className="h-4 w-4 shrink-0 text-gray-400" /> Insert link
                </button>
                <button onClick={() => { setShowStorageModal(true); setShowKebab(false) }} className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 dark:text-zinc-200 dark:hover:bg-zinc-800">
                  <Archive className="h-4 w-4 shrink-0 text-gray-400" /> Save to Storage
                </button>
                <button onClick={() => { togglePin(prompt.id); setShowKebab(false) }} className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 dark:text-zinc-200 dark:hover:bg-zinc-800">
                  <Star className={clsx('h-4 w-4 shrink-0', prompt.is_pinned ? 'fill-brand-500 text-brand-500' : 'text-gray-400')} />
                  {prompt.is_pinned ? 'Unpin' : 'Pin'}
                </button>
                <div className="border-t border-gray-100 dark:border-zinc-800" />
                <button onClick={() => { handleDownload('md'); setShowKebab(false) }} className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 dark:text-zinc-200 dark:hover:bg-zinc-800">
                  <Download className="h-4 w-4 shrink-0 text-gray-400" /> Download as .md
                </button>
                <button onClick={() => { handleDownload('txt'); setShowKebab(false) }} className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 dark:text-zinc-200 dark:hover:bg-zinc-800">
                  <Download className="h-4 w-4 shrink-0 text-gray-400" /> Download as .txt
                </button>
                <div className="border-t border-gray-100 dark:border-zinc-800" />
                <button onClick={() => { handleDelete(); setShowKebab(false) }} className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10">
                  <Trash2 className="h-4 w-4 shrink-0" /> Delete prompt
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Title + desktop actions */}
        <div className="flex w-full items-start justify-between gap-3 px-4 pb-3 pt-2 sm:pt-4 md:px-6 md:pb-4 md:pt-6">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled prompt"
            className="w-full bg-transparent text-xl font-semibold outline-none placeholder:text-gray-300 dark:placeholder:text-zinc-700 md:text-2xl"
          />
          <div className="hidden shrink-0 items-center gap-0.5 sm:flex">
            <button onClick={handleCopy} className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-zinc-800" title={copied ? 'Copied!' : 'Copy'}>
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            </button>
            <button onClick={() => setShowLinkPicker(true)} className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-zinc-800" title="Insert link">
              <Link2 className="h-4 w-4" />
            </button>
            <button onClick={() => setShowStorageModal(true)} className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-zinc-800" title="Save to Storage">
              <Archive className="h-4 w-4" />
            </button>
            <button onClick={() => togglePin(prompt.id)} className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-zinc-800">
              <Star className={clsx('h-4 w-4', prompt.is_pinned && 'fill-brand-500 text-brand-500')} />
            </button>
            <ExportMenu filename={title || 'untitled-prompt'} content={content} />
            <button onClick={handleDelete} className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center gap-x-3 gap-y-2 px-4 pb-3 text-xs text-gray-500 dark:text-zinc-400 md:px-6">
          <StatusBadge status={promptStatus} onChange={setPromptStatus} />
          <TagsEditor tags={tags} onChange={setTags} />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {mode === 'edit' ? (
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
            basicSetup={{
              lineNumbers: true,
              foldGutter: false,
              highlightActiveLine: true,
              highlightActiveLineGutter: true,
            }}
            className="min-h-full text-[13px]"
            style={{ minHeight: 'calc(100vh - 200px)' }}
          />
        ) : (
          <div data-color-mode={theme} className="px-6 py-4">
            <MentionMarkdown source={content} className="wmde-markdown" />
          </div>
        )}
      </div>
      <Backlinks itemId={prompt.id} selfId={prompt.id} />

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
            {content.length > 0 && <span>{content.length} chars</span>}
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
      {showStorageModal && prompt.project_id && (
        <SaveToStorageModal
          projectId={prompt.project_id}
          defaultName={title || 'Untitled prompt'}
          defaultContent={content}
          defaultTags={tags}
          sourceType="prompt"
          sourceId={prompt.id}
          onClose={() => setShowStorageModal(false)}
        />
      )}
      {showLinkPicker && (
        <LinkPicker
          excludeId={prompt.id}
          onPick={insertMention}
          onClose={() => setShowLinkPicker(false)}
        />
      )}
    </>
  )
}
