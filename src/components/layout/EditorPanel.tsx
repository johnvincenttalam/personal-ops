import { useUIStore } from '@/stores/useUIStore'
import NoteEditor from '@/components/notes/NoteEditor'
import PromptEditor from '@/components/prompts/PromptEditor'
import ChecklistView from '@/components/checklists/ChecklistView'
import StorageView from '@/components/storage/StorageView'

export default function EditorPanel() {
  const activeTab = useUIStore((s) => s.activeTab)

  return (
    <section className="flex w-full flex-1 flex-col bg-white dark:bg-zinc-950">
      {activeTab === 'notes' && <NoteEditor />}
      {activeTab === 'prompts' && <PromptEditor />}
      {activeTab === 'checklists' && <ChecklistView />}
      {activeTab === 'storage' && <StorageView />}
    </section>
  )
}
