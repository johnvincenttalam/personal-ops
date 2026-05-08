import { Menu, FileText, Sparkles, CheckSquare, Archive } from 'lucide-react'
import { useUIStore } from '@/stores/useUIStore'
import { useProjectStore } from '@/stores/useProjectStore'
import NotesList from '@/components/notes/NotesList'
import PromptsList from '@/components/prompts/PromptsList'
import ChecklistsList from '@/components/checklists/ChecklistsList'
import StorageList from '@/components/storage/StorageList'
import type { Tab } from '@/types'

const TAB_ICONS: Record<Tab, typeof FileText> = {
  notes: FileText,
  prompts: Sparkles,
  checklists: CheckSquare,
  storage: Archive,
}

const TAB_LABELS: Record<Tab, string> = {
  notes: 'Notes',
  prompts: 'Prompts',
  checklists: 'Checklists',
  storage: 'Storage',
}

export default function ListPanel() {
  const activeTab = useUIStore((s) => s.activeTab)
  const setMobileView = useUIStore((s) => s.setMobileView)
  const activeProject = useProjectStore((s) =>
    s.projects.find((p) => p.id === s.activeProjectId) ?? null
  )

  const TabIcon = TAB_ICONS[activeTab]

  return (
    <section className="flex w-full flex-col border-r border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {/* Mobile header */}
      <header className="flex min-h-[48px] items-center gap-2 border-b border-gray-200 px-2 dark:border-zinc-800 md:hidden">
        <button
          onClick={() => setMobileView('sidebar')}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <TabIcon className="h-4 w-4 shrink-0 text-brand-500" />
          <span className="truncate text-sm font-semibold text-gray-900 dark:text-zinc-100">
            {TAB_LABELS[activeTab]}
          </span>
          {activeProject && (
            <span className="truncate text-xs text-gray-400 dark:text-zinc-500">
              · {activeProject.name}
            </span>
          )}
        </div>
      </header>

      {activeTab === 'notes' && <NotesList />}
      {activeTab === 'prompts' && <PromptsList />}
      {activeTab === 'checklists' && <ChecklistsList />}
      {activeTab === 'storage' && <StorageList />}
    </section>
  )
}
