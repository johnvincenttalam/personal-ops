import { ArrowLeft } from 'lucide-react'
import { useUIStore } from '@/stores/useUIStore'
import NoteEditor from '@/components/notes/NoteEditor'
import PromptEditor from '@/components/prompts/PromptEditor'
import ChecklistView from '@/components/checklists/ChecklistView'
import StorageView from '@/components/storage/StorageView'

export default function EditorPanel() {
  const activeTab = useUIStore((s) => s.activeTab)
  const setMobileView = useUIStore((s) => s.setMobileView)

  return (
    <section className="flex w-full flex-1 flex-col bg-white dark:bg-zinc-950">
      {/* Mobile back header */}
      <header className="flex min-h-[48px] items-center border-b border-gray-200 bg-white px-2 dark:border-zinc-800 dark:bg-zinc-900 md:hidden">
        <button
          onClick={() => setMobileView('list')}
          className="flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          aria-label="Back to list"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
      </header>

      {activeTab === 'notes' && <NoteEditor />}
      {activeTab === 'prompts' && <PromptEditor />}
      {activeTab === 'checklists' && <ChecklistView />}
      {activeTab === 'storage' && <StorageView />}
    </section>
  )
}
