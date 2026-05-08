import { useEffect, useMemo, useState } from 'react'
import { Command } from 'cmdk'
import {
  Search,
  Plus,
  FileText,
  Sparkles,
  CheckSquare,
  Archive,
  Folder,
  Sun,
  Moon,
  Star,
} from 'lucide-react'
import { services } from '@/infrastructure/composition'
import { useUIStore } from '@/stores/useUIStore'
import { useProjectStore } from '@/stores/useProjectStore'
import { useNoteStore } from '@/stores/useNoteStore'
import { usePromptStore } from '@/stores/usePromptStore'
import { useChecklistStore } from '@/stores/useChecklistStore'
import { useStorageStore } from '@/stores/useStorageStore'
import type { CorpusItem } from '@/application/ports/SearchGateway'
import type { MentionType } from '@/domain/rules/parseMentions'

const TYPE_TO_TAB: Record<MentionType, 'notes' | 'prompts' | 'checklists' | 'storage'> = {
  note: 'notes',
  prompt: 'prompts',
  checklist: 'checklists',
  storage: 'storage',
}

const TYPE_ICON: Record<MentionType, typeof FileText> = {
  note: FileText,
  prompt: Sparkles,
  checklist: CheckSquare,
  storage: Archive,
}

const TYPE_HEADING: Record<MentionType, string> = {
  note: 'Notes',
  prompt: 'Prompts',
  checklist: 'Checklists',
  storage: 'Storage',
}

export function CommandPalette() {
  const open = useUIStore((s) => s.searchOpen)
  const setOpen = useUIStore((s) => s.setSearchOpen)
  const setActiveTab = useUIStore((s) => s.setActiveTab)
  const setMobileView = useUIStore((s) => s.setMobileView)
  const theme = useUIStore((s) => s.theme)
  const toggleTheme = useUIStore((s) => s.toggleTheme)

  const projects = useProjectStore((s) => s.projects)
  const activeProjectId = useProjectStore((s) => s.activeProjectId)
  const setActiveProject = useProjectStore((s) => s.setActiveProject)

  const createNote = useNoteStore((s) => s.createNote)
  const createPrompt = usePromptStore((s) => s.createPrompt)
  const createList = useChecklistStore((s) => s.createList)
  const createStorage = useStorageStore((s) => s.createItem)
  const setActiveNote = useNoteStore((s) => s.setActiveNote)
  const setActivePrompt = usePromptStore((s) => s.setActivePrompt)
  const setActiveList = useChecklistStore((s) => s.setActiveList)
  const setActiveStorage = useStorageStore((s) => s.setActiveItem)

  const [corpus, setCorpus] = useState<CorpusItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    services.search.getCorpus()
      .then(setCorpus)
      .finally(() => setLoading(false))
  }, [open])

  const close = () => setOpen(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const grouped = useMemo(() => {
    const groups: Record<MentionType, CorpusItem[]> = { note: [], prompt: [], checklist: [], storage: [] }
    for (const item of corpus) groups[item.type].push(item)
    return groups
  }, [corpus])

  const runCreate = async (kind: 'notes' | 'prompts' | 'checklists' | 'storage') => {
    if (!activeProjectId) {
      close()
      return
    }
    setActiveTab(kind)
    if (kind === 'notes') await createNote(activeProjectId)
    else if (kind === 'prompts') await createPrompt(activeProjectId)
    else if (kind === 'checklists') await createList(activeProjectId)
    else await createStorage(activeProjectId)
    setMobileView('editor')
    close()
  }

  const jumpToProject = (id: string) => {
    setActiveProject(id)
    setMobileView('list')
    close()
  }

  const openItem = (item: CorpusItem) => {
    if (item.project_id && item.project_id !== activeProjectId) {
      setActiveProject(item.project_id)
    }
    setActiveTab(TYPE_TO_TAB[item.type])
    if (item.type === 'note') setActiveNote(item.id)
    else if (item.type === 'prompt') setActivePrompt(item.id)
    else if (item.type === 'checklist') setActiveList(item.id)
    else if (item.type === 'storage') setActiveStorage(item.id)
    setMobileView('editor')
    close()
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-2 pt-3 sm:p-4 sm:pt-[15vh]"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] dark:bg-black/60"
        onClick={close}
      />

      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <Command label="Command palette" loop>
          <div className="flex items-center gap-3 border-b border-gray-200 px-4 dark:border-zinc-800">
            <Search className="h-4 w-4 shrink-0 text-gray-400" />
            <Command.Input
              autoFocus
              placeholder="Search or type a command..."
              className="flex-1 bg-transparent py-4 text-sm outline-none placeholder:text-gray-400"
            />
            <kbd className="hidden rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500 dark:bg-zinc-800 dark:text-zinc-400 sm:block">
              ESC
            </kbd>
          </div>

          <Command.List className="px-2 py-2">
            {loading && (
              <Command.Loading>
                <p className="px-3 py-2 text-xs text-gray-400">Loading…</p>
              </Command.Loading>
            )}
            <Command.Empty>No results found.</Command.Empty>

            <Command.Group heading="Actions">
              <Item icon={<Plus className="h-4 w-4" />} label="Create note"
                hint={!activeProjectId ? 'Pick a project first' : undefined}
                onSelect={() => runCreate('notes')} disabled={!activeProjectId} />
              <Item icon={<Plus className="h-4 w-4" />} label="Create prompt"
                hint={!activeProjectId ? 'Pick a project first' : undefined}
                onSelect={() => runCreate('prompts')} disabled={!activeProjectId} />
              <Item icon={<Plus className="h-4 w-4" />} label="Create checklist"
                hint={!activeProjectId ? 'Pick a project first' : undefined}
                onSelect={() => runCreate('checklists')} disabled={!activeProjectId} />
              <Item icon={<Plus className="h-4 w-4" />} label="Create storage snippet"
                hint={!activeProjectId ? 'Pick a project first' : undefined}
                onSelect={() => runCreate('storage')} disabled={!activeProjectId} />
              <Item
                icon={theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                onSelect={() => { toggleTheme(); close() }}
              />
            </Command.Group>

            {projects.length > 0 && (
              <Command.Group heading="Projects">
                {projects.map((p) => (
                  <Item key={p.id} icon={<Folder className="h-4 w-4" />} label={p.name}
                    onSelect={() => jumpToProject(p.id)} />
                ))}
              </Command.Group>
            )}

            {(['note', 'prompt', 'checklist', 'storage'] as MentionType[]).map((type) => {
              const items = grouped[type]
              if (items.length === 0) return null
              const Icon = TYPE_ICON[type]
              return (
                <Command.Group key={type} heading={TYPE_HEADING[type]}>
                  {items.map((item) => (
                    <Item
                      key={`${type}-${item.id}`}
                      icon={<Icon className="h-4 w-4" />}
                      label={item.title}
                      hint={item.hint}
                      pinned={item.is_pinned}
                      onSelect={() => openItem(item)}
                    />
                  ))}
                </Command.Group>
              )
            })}
          </Command.List>
        </Command>
      </div>
    </div>
  )
}

interface ItemProps {
  icon: React.ReactNode
  label: string
  hint?: string
  pinned?: boolean
  disabled?: boolean
  onSelect: () => void
}

function Item({ icon, label, hint, pinned, disabled, onSelect }: ItemProps) {
  return (
    <Command.Item
      onSelect={onSelect}
      disabled={disabled}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm aria-disabled:opacity-50"
    >
      <span className="text-gray-400">{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {hint && (
        <span className="hidden truncate text-xs text-gray-400 sm:block">
          {hint}
        </span>
      )}
      {pinned && (
        <Star className="h-3.5 w-3.5 fill-brand-500 text-brand-500" />
      )}
    </Command.Item>
  )
}
