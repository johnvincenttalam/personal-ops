import type { MentionType } from '@/domain/rules/parseMentions'

export interface CorpusItem {
  id: string
  type: MentionType
  /** Unified label: title for note/prompt, content for checklist parent, name for storage. */
  title: string
  /** Optional preview/description shown in command palette. */
  hint?: string
  /** Whether the item is pinned (notes/prompts only). */
  is_pinned?: boolean
  /** For navigation — switch to this project before activating the item. */
  project_id: string | null
}

export interface BacklinkRef {
  id: string
  type: MentionType
  title: string
}

export interface SearchGateway {
  /** Returns all items across types (limited per type). Used by command palette + link picker. */
  getCorpus(): Promise<CorpusItem[]>

  /** Find items whose content references the given itemId. */
  findBacklinksTo(itemId: string): Promise<BacklinkRef[]>

  /** Look up an item's project_id by (type, id). Used by the mention router. */
  getProjectId(type: MentionType, id: string): Promise<string | null>
}
