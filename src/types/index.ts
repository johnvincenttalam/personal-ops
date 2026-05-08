/**
 * Compatibility barrel — re-exports domain entities so existing
 * `import { ... } from '@/types'` paths keep working. New code should
 * import from `@/domain/entities/*` or `@/domain/value-objects/*` directly.
 *
 * The only type defined here is `Tab`, which is purely UI/presentation state.
 */

export type { Note } from '@/domain/entities/Note'
export type { Prompt } from '@/domain/entities/Prompt'
export type { Project, ProjectColor } from '@/domain/entities/Project'
export type { StorageItem, StorageSourceType } from '@/domain/entities/StorageItem'
export type { ChecklistItem } from '@/domain/entities/ChecklistItem'
export type { ItemStatus } from '@/domain/value-objects/ItemStatus'

/** UI tab — which content type is currently visible. Pure presentation state. */
export type Tab = 'notes' | 'prompts' | 'checklists' | 'storage'
