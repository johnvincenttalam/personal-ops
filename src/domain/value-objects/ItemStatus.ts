export type ItemStatus = 'draft' | 'final' | 'archived'

const ALLOWED: Record<ItemStatus, ItemStatus[]> = {
  draft:    ['final', 'archived'],
  final:    ['draft', 'archived'],
  archived: ['draft'],
}

export function canTransition(from: ItemStatus, to: ItemStatus): boolean {
  return from === to || ALLOWED[from].includes(to)
}
