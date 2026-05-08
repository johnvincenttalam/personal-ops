import type { SearchGateway } from '@/application/ports/SearchGateway'
import type { MentionType } from '@/domain/rules/parseMentions'

export interface SearchServiceDeps {
  gateway: SearchGateway
}

export function createSearchService({ gateway }: SearchServiceDeps) {
  return {
    getCorpus: () => gateway.getCorpus(),
    findBacklinksTo: (itemId: string) => gateway.findBacklinksTo(itemId),
    getProjectId: (type: MentionType, id: string) => gateway.getProjectId(type, id),
  }
}

export type SearchService = ReturnType<typeof createSearchService>
