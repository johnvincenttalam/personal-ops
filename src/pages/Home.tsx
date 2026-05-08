import clsx from 'clsx'
import { FileText, Sparkles, CheckSquare, Archive } from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import ListPanel from '@/components/layout/ListPanel'
import EditorPanel from '@/components/layout/EditorPanel'
import { useUIStore } from '@/stores/useUIStore'
import type { Tab } from '@/types'

const BOTTOM_TABS: { id: Tab; icon: typeof FileText; label: string }[] = [
  { id: 'prompts', icon: Sparkles, label: 'Prompts' },
  { id: 'notes', icon: FileText, label: 'Notes' },
  { id: 'checklists', icon: CheckSquare, label: 'Lists' },
  { id: 'storage', icon: Archive, label: 'Storage' },
]

function MobileBottomNav() {
  const activeTab = useUIStore((s) => s.activeTab)
  const setActiveTab = useUIStore((s) => s.setActiveTab)
  const mobileView = useUIStore((s) => s.mobileView)
  const setMobileView = useUIStore((s) => s.setMobileView)

  const handleTabPress = (tab: Tab) => {
    setActiveTab(tab)
    setMobileView('list')
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex items-stretch border-t border-gray-200 bg-white/95 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/95 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {BOTTOM_TABS.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => handleTabPress(id)}
          className={clsx(
            'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors',
            activeTab === id && mobileView !== 'sidebar'
              ? 'text-brand-600 dark:text-brand-400'
              : 'text-gray-500 dark:text-zinc-400'
          )}
        >
          <Icon className="h-5 w-5" />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}

export default function Home() {
  const mobileView = useUIStore((s) => s.mobileView)
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed)

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 dark:bg-zinc-950">
      {/* Each panel gets pb-[60px] on mobile to clear the bottom nav */}
      <div
        className={clsx(
          'md:flex md:shrink-0 transition-[width] duration-150',
          sidebarCollapsed ? 'md:w-16' : 'md:w-64',
          mobileView === 'sidebar' ? 'flex w-full pb-[60px] md:pb-0' : 'hidden'
        )}
      >
        <Sidebar />
      </div>
      <div
        className={clsx(
          'md:flex md:w-[340px] md:shrink-0',
          mobileView === 'list' ? 'flex w-full pb-[60px] md:pb-0' : 'hidden'
        )}
      >
        <ListPanel />
      </div>
      <div
        className={clsx(
          'md:flex md:flex-1',
          mobileView === 'editor' ? 'flex w-full flex-1 pb-[60px] md:pb-0' : 'hidden'
        )}
      >
        <EditorPanel />
      </div>

      {/* Bottom navigation — mobile only */}
      <MobileBottomNav />
    </div>
  )
}
