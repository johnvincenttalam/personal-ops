import { Menu } from 'lucide-react'
import { useUIStore } from '@/stores/useUIStore'
import { useProjectStore } from '@/stores/useProjectStore'
import NotesList from '@/components/notes/NotesList'
import PromptsList from '@/components/prompts/PromptsList'
import ChecklistsList from '@/components/checklists/ChecklistsList'
import StorageList from '@/components/storage/StorageList'

export default function ListPanel() {
  const activeTab = useUIStore((s) => s.activeTab)
  const setMobileView = useUIStore((s) => s.setMobileView)
  const activeProject = useProjectStore((s) =>
    s.projects.find((p) => p.id === s.activeProjectId) ?? null
  )

  return (
    <section className="flex w-full flex-col border-r border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {/* Mobile header */}
      <header className="flex items-center gap-2 border-b border-gray-200 px-3 py-2 md:hidden dark:border-zinc-800">
        <button
          onClick={() => setMobileView('sidebar')}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="truncate text-sm font-medium">
          {activeProject?.name ?? 'No project'}
        </span>
      </header>

      {activeTab === 'notes' && <NotesList />}
      {activeTab === 'prompts' && <PromptsList />}
      {activeTab === 'checklists' && <ChecklistsList />}
      {activeTab === 'storage' && <StorageList />}
    </section>
  )
}
