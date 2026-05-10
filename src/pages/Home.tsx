import { useState } from 'react'
import clsx from 'clsx'
import { FileText, Sparkles, CheckSquare, Archive, Settings } from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import ListPanel from '@/components/layout/ListPanel'
import EditorPanel from '@/components/layout/EditorPanel'
import SettingsModal from '@/components/shared/SettingsModal'
import NewItemModal from '@/components/shared/NewItemModal'
import { useUIStore } from '@/stores/useUIStore'
import { useProjectStore } from '@/stores/useProjectStore'
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

  const [showSettings, setShowSettings] = useState(false)

  const handleTabPress = (tab: Tab) => {
    setActiveTab(tab)
    setMobileView('list')
  }

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 flex items-stretch border-t border-gray-200 bg-white/95 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/95 md:hidden"
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
        <button
          onClick={() => setShowSettings(true)}
          className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium text-gray-500 transition-colors dark:text-zinc-400"
          aria-label="Settings"
        >
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </button>
      </nav>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  )
}

export default function Home() {
  const mobileView = useUIStore((s) => s.mobileView)
  const setMobileView = useUIStore((s) => s.setMobileView)
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed)
  const newItemTab = useUIStore((s) => s.newItemTab)
  const closeNewItem = useUIStore((s) => s.closeNewItem)
  const activeProjectId = useProjectStore((s) => s.activeProjectId)

  const sidebarOpen = mobileView === 'sidebar'

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 dark:bg-zinc-950">

      {/* Backdrop — fades in behind the sidebar on mobile */}
      <div
        className={clsx(
          'fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden',
          'transition-opacity duration-300 ease-in-out',
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setMobileView('list')}
      />

      {/* Sidebar — fixed overlay on mobile, static column on desktop */}
      <div
        className={clsx(
          // Mobile: fixed drawer that slides in from the left
          'fixed inset-y-0 left-0 z-50 flex w-4/5 max-w-xs bg-white dark:bg-zinc-900',
          'transition-transform duration-300 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop: static layout column, transition on width collapse
          'md:relative md:inset-auto md:z-auto md:translate-x-0 md:flex md:shrink-0 md:transition-[width] md:duration-150',
          sidebarCollapsed ? 'md:w-16' : 'md:w-64',
        )}
      >
        <Sidebar />
      </div>

      {/* List panel — always rendered on mobile so it peeks behind the sidebar overlay */}
      <div
        className={clsx(
          'md:flex md:w-[340px] md:shrink-0 bg-white dark:bg-zinc-900',
          mobileView !== 'editor' ? 'flex w-full pb-[55px] md:pb-0' : 'hidden'
        )}
      >
        <ListPanel />
      </div>

      {/* Editor panel */}
      <div
        className={clsx(
          'md:flex md:flex-1 bg-white dark:bg-zinc-950',
          mobileView === 'editor' ? 'flex w-full flex-1 pb-[55px] md:pb-0' : 'hidden'
        )}
      >
        <EditorPanel />
      </div>

      {/* Bottom navigation — mobile only */}
      <MobileBottomNav />

      {/* Global new-item modal */}
      {newItemTab && activeProjectId && (
        <NewItemModal
          tab={newItemTab}
          projectId={activeProjectId}
          onClose={closeNewItem}
        />
      )}
    </div>
  )
}
