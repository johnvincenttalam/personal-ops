import { useState } from 'react'
import {
  Plus,
  Search,
  FileText,
  Sparkles,
  CheckSquare,
  Archive,
  Shield,
  Settings,
  Trash2,
  Pencil,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react'
import clsx from 'clsx'
import { useProjectStore } from '@/stores/useProjectStore'
import { useNoteStore } from '@/stores/useNoteStore'
import { usePromptStore } from '@/stores/usePromptStore'
import { useChecklistStore } from '@/stores/useChecklistStore'
import { useStorageStore } from '@/stores/useStorageStore'
import { useUIStore } from '@/stores/useUIStore'
import { colorDot } from '@/components/shared/colors'
import { confirmDialog } from '@/components/shared/ConfirmDialog'
import ProjectEditModal from '@/components/shared/ProjectEditModal'
import SettingsModal from '@/components/shared/SettingsModal'
import { SidebarProjectsSkeleton } from '@/components/shared/Skeletons'
import type { Tab, Project } from '@/types'

const TABS: { id: Tab; label: string; icon: typeof FileText }[] = [
  { id: 'prompts', label: 'Prompts', icon: Sparkles },
  { id: 'notes', label: 'Notes', icon: FileText },
  { id: 'checklists', label: 'Checklists', icon: CheckSquare },
  { id: 'storage', label: 'Storage', icon: Archive },
]

export default function Sidebar() {
  const projects = useProjectStore((s) => s.projects)
  const projectsLoading = useProjectStore((s) => s.loading)
  const activeProjectId = useProjectStore((s) => s.activeProjectId)
  const setActiveProject = useProjectStore((s) => s.setActiveProject)
  const createProject = useProjectStore((s) => s.createProject)
  const deleteProject = useProjectStore((s) => s.deleteProject)

  const activeTab = useUIStore((s) => s.activeTab)
  const setActiveTab = useUIStore((s) => s.setActiveTab)
  const setMobileView = useUIStore((s) => s.setMobileView)
  const setSearchOpen = useUIStore((s) => s.setSearchOpen)
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)

  const createNote = useNoteStore((s) => s.createNote)
  const createPrompt = usePromptStore((s) => s.createPrompt)
  const createList = useChecklistStore((s) => s.createList)
  const createStorage = useStorageStore((s) => s.createItem)

  const updateProject = useProjectStore((s) => s.updateProject)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [showSettings, setShowSettings] = useState(false)

  const collapsed = sidebarCollapsed

  const handleNew = async () => {
    if (!activeProjectId) {
      if (collapsed) toggleSidebar()
      setShowCreateModal(true)
      return
    }
    if (activeTab === 'notes') await createNote(activeProjectId)
    else if (activeTab === 'prompts') await createPrompt(activeProjectId)
    else if (activeTab === 'checklists') await createList(activeProjectId)
    else if (activeTab === 'storage') await createStorage(activeProjectId)
    setMobileView('editor')
  }

  const handleStartCreating = () => {
    if (collapsed) toggleSidebar()
    setShowCreateModal(true)
  }

  const handlePickProject = (id: string) => {
    setActiveProject(id)
    setMobileView('list')
  }

  const handlePickTab = (tab: Tab) => {
    setActiveTab(tab)
    setMobileView('list')
  }

  const handleDeleteProject = async (e: React.MouseEvent, project: Project) => {
    e.stopPropagation()
    const ok = await confirmDialog({
      title: `Delete "${project.name}"?`,
      description:
        'This will permanently delete the project and all of its notes, prompts, and checklists. This cannot be undone.',
      confirmText: 'Delete project',
      variant: 'danger',
    })
    if (ok) await deleteProject(project.id)
  }

  const newLabel = !activeProjectId
    ? 'New Project'
    : activeTab === 'notes'
      ? 'New Note'
      : activeTab === 'prompts'
        ? 'New Prompt'
        : activeTab === 'checklists'
          ? 'New Checklist'
          : 'New Snippet'

  if (collapsed) {
    return (
      <aside className="flex w-full flex-col items-center border-r border-gray-200 bg-white py-3 dark:border-zinc-800 dark:bg-zinc-900">
        {/* Logo */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-white">
          <Shield className="h-4 w-4" />
        </div>

        {/* New */}
        <button
          onClick={handleNew}
          title={newLabel}
          className="mt-3 flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white transition hover:bg-brand-600 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
        </button>

        {/* Search */}
        <button
          onClick={() => setSearchOpen(true)}
          title="Search (⌘K)"
          className="mt-1 flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <Search className="h-4 w-4" />
        </button>

        {/* Projects */}
        {projects.length > 0 && (
          <>
            <div className="my-3 w-8 border-t border-gray-200 dark:border-zinc-700" />
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => handlePickProject(p.id)}
                title={p.name}
                className={clsx(
                  'mb-1 flex h-8 w-8 items-center justify-center rounded-lg transition',
                  activeProjectId === p.id
                    ? 'bg-brand-50 dark:bg-brand-500/10'
                    : 'hover:bg-gray-100 dark:hover:bg-zinc-800'
                )}
              >
                <span className={clsx('h-2.5 w-2.5 rounded-full', colorDot[p.color])} />
              </button>
            ))}
          </>
        )}

        {/* Tabs */}
        <div className="my-3 w-8 border-t border-gray-200 dark:border-zinc-700" />
        {TABS.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => handlePickTab(t.id)}
              title={t.label}
              className={clsx(
                'mb-1 flex h-8 w-8 items-center justify-center rounded-lg transition',
                activeTab === t.id
                  ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300'
                  : 'text-gray-500 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
              )}
            >
              <Icon className="h-4 w-4" />
            </button>
          )
        })}

        {/* Footer */}
        <div className="mt-auto flex flex-col items-center gap-1">
          <button
            onClick={() => setShowSettings(true)}
          title="Settings"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <Settings className="h-4 w-4" />
          </button>
          <button
            onClick={toggleSidebar}
            title="Expand sidebar"
            className="hidden h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 md:flex"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </aside>
    )
  }

  return (
    <aside className="flex w-full flex-col border-r border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {/* Brand */}
      <div className="flex items-center gap-2 px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-white">
          <Shield className="h-4 w-4" />
        </div>
        <span className="truncate font-semibold">Personal OPS</span>
        {/* Mobile close */}
        <button
          onClick={() => setMobileView('list')}
          className="ml-auto rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 md:hidden"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* New */}
      <div className="px-3">
        <button
          onClick={handleNew}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-600 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4 shrink-0" />
          {newLabel}
        </button>
      </div>

      {/* Search */}
      <div className="px-3 pt-3">
        <button
          onClick={() => setSearchOpen(true)}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <Search className="h-4 w-4" />
          <span>Search</span>
          <kbd className="ml-auto rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500 dark:bg-zinc-800 dark:text-zinc-400">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Projects */}
      <div className="mt-5 flex items-center justify-between px-4 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
        <span>Projects</span>
        <button
          onClick={handleStartCreating}
          className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-zinc-800"
          aria-label="New project"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <nav className="mt-2 flex-1 overflow-y-auto pb-4">
        {projectsLoading ? (
          <SidebarProjectsSkeleton />
        ) : null}
        {!projectsLoading && projects.map((p) => {
          const isActive = activeProjectId === p.id
          return (
            <div key={p.id}>
              {/* Project row */}
              <div
                className={clsx(
                  'group flex items-center border-l-2 py-1.5 pl-3 pr-3 transition-colors',
                  isActive
                    ? 'border-l-brand-500 bg-brand-50/60 font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-200'
                    : 'border-l-transparent text-gray-600 hover:bg-gray-50 dark:text-zinc-400 dark:hover:bg-zinc-800/50'
                )}
              >
                <button
                  onClick={() => handlePickProject(p.id)}
                  className="flex flex-1 items-center gap-1.5 truncate text-left text-sm"
                >
                  {isActive ? (
                    <ChevronDown className="h-3 w-3 shrink-0 text-gray-400 dark:text-zinc-500" />
                  ) : (
                    <ChevronRight className="h-3 w-3 shrink-0 text-gray-400 dark:text-zinc-500" />
                  )}
                  <span className={clsx('h-2 w-2 shrink-0 rounded-full', colorDot[p.color])} />
                  <span className="truncate text-sm">{p.name}</span>
                </button>
                <div className="flex items-center gap-0.5 opacity-100 md:opacity-0 md:group-hover:opacity-100">
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditingProject(p) }}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-zinc-700"
                    aria-label={`Edit ${p.name}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteProject(e, p)}
                    className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                    aria-label={`Delete ${p.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Content type sub-items, only under active project */}
              {isActive && (
                <div className="mb-1">
                  {TABS.map((t) => {
                    const Icon = t.icon
                    const tabActive = activeTab === t.id
                    return (
                      <button
                        key={t.id}
                        onClick={() => handlePickTab(t.id)}
                        className={clsx(
                          'flex w-full items-center gap-2 border-l-2 py-1.5 pl-9 pr-3 text-[13px] transition-colors',
                          tabActive
                            ? 'border-l-brand-500 bg-brand-50/40 font-medium text-brand-700 dark:bg-brand-500/5 dark:text-brand-200'
                            : 'border-l-transparent text-gray-500 hover:bg-gray-50 dark:text-zinc-500 dark:hover:bg-zinc-800/50'
                        )}
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        <span>{t.label}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {!projectsLoading && projects.length === 0 && (
          <p className="px-3 py-2 text-xs text-gray-400 dark:text-zinc-500">
            No projects yet
          </p>
        )}
      </nav>

      {/* Footer */}
      <div className="mt-auto border-t border-gray-200 px-2 py-3 dark:border-zinc-800">
        <button
          onClick={() => setShowSettings(true)}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <Settings className="h-4 w-4 shrink-0" />
          <span>Settings</span>
        </button>
        <button
          onClick={toggleSidebar}
          title="Collapse sidebar"
          className="hidden w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 dark:text-zinc-400 dark:hover:bg-zinc-800 md:flex"
        >
          <ChevronLeft className="h-4 w-4 shrink-0" />
          <span>Collapse</span>
        </button>
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

      {showCreateModal && (
        <ProjectEditModal
          onSave={(data) => createProject(data.name, data.color, data.description, data.tags)}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {editingProject && (
        <ProjectEditModal
          project={editingProject}
          onSave={(data) => updateProject(editingProject.id, data)}
          onClose={() => setEditingProject(null)}
        />
      )}
    </aside>
  )
}
