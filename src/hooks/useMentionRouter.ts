import { useCallback } from 'react'
import { services } from '@/infrastructure/composition'
import { useUIStore } from '@/stores/useUIStore'
import { useProjectStore } from '@/stores/useProjectStore'
import { useNoteStore } from '@/stores/useNoteStore'
import { usePromptStore } from '@/stores/usePromptStore'
import { useChecklistStore } from '@/stores/useChecklistStore'
import { useStorageStore } from '@/stores/useStorageStore'
import { parseMentionUrl } from '@/domain/rules/parseMentions'
import type { MentionType } from '@/domain/rules/parseMentions'

const TAB_FOR_TYPE: Record<MentionType, 'notes' | 'prompts' | 'checklists' | 'storage'> = {
  note: 'notes',
  prompt: 'prompts',
  checklist: 'checklists',
  storage: 'storage',
}

/**
 * Returns a click handler that, when given a mention URL, navigates to the referenced item
 * (switching project/tab as needed). Use it on any container rendering mention links.
 */
export function useMentionRouter() {
  const setActiveProject = useProjectStore((s) => s.setActiveProject)
  const activeProjectId = useProjectStore((s) => s.activeProjectId)
  const setActiveTab = useUIStore((s) => s.setActiveTab)
  const setMobileView = useUIStore((s) => s.setMobileView)
  const setActiveNote = useNoteStore((s) => s.setActiveNote)
  const setActivePrompt = usePromptStore((s) => s.setActivePrompt)
  const setActiveList = useChecklistStore((s) => s.setActiveList)
  const setActiveStorage = useStorageStore((s) => s.setActiveItem)

  return useCallback(async (url: string) => {
    const parsed = parseMentionUrl(url)
    if (!parsed) return false
    const { type, id } = parsed

    const projectId = await services.search.getProjectId(type, id)
    if (projectId == null) return false

    if (projectId !== activeProjectId) setActiveProject(projectId)
    setActiveTab(TAB_FOR_TYPE[type])
    if (type === 'note') setActiveNote(id)
    else if (type === 'prompt') setActivePrompt(id)
    else if (type === 'checklist') setActiveList(id)
    else if (type === 'storage') setActiveStorage(id)
    setMobileView('editor')
    return true
  }, [
    activeProjectId,
    setActiveProject,
    setActiveTab,
    setActiveNote,
    setActivePrompt,
    setActiveList,
    setActiveStorage,
    setMobileView,
  ])
}
