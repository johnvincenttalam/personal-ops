import clsx from 'clsx'
import Sidebar from '@/components/layout/Sidebar'
import ListPanel from '@/components/layout/ListPanel'
import EditorPanel from '@/components/layout/EditorPanel'
import { useUIStore } from '@/stores/useUIStore'

export default function Home() {
  const mobileView = useUIStore((s) => s.mobileView)
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed)

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 dark:bg-zinc-950">
      <div
        className={clsx(
          'md:flex md:shrink-0 transition-[width] duration-150',
          sidebarCollapsed ? 'md:w-16' : 'md:w-64',
          mobileView === 'sidebar' ? 'flex w-full' : 'hidden'
        )}
      >
        <Sidebar />
      </div>
      <div
        className={clsx(
          'md:flex md:w-[340px] md:shrink-0',
          mobileView === 'list' ? 'flex w-full' : 'hidden'
        )}
      >
        <ListPanel />
      </div>
      <div
        className={clsx(
          'md:flex md:flex-1',
          mobileView === 'editor' ? 'flex w-full flex-1' : 'hidden'
        )}
      >
        <EditorPanel />
      </div>
    </div>
  )
}
