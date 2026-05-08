export type MentionType = 'note' | 'prompt' | 'checklist' | 'storage'

export interface Mention {
  type: MentionType
  id: string
  title: string
}

const MENTION_RE = /@\[([^\]]+)\]\((note|prompt|checklist|storage):([0-9a-f-]+)\)/gi

/** Parse all mentions out of a markdown source. */
export function extractMentions(source: string): Mention[] {
  const out: Mention[] = []
  if (!source) return out
  for (const match of source.matchAll(MENTION_RE)) {
    out.push({
      title: match[1],
      type: match[2].toLowerCase() as MentionType,
      id: match[3],
    })
  }
  return out
}

/** Build the canonical mention literal a picker should insert. */
export function formatMention(m: Mention): string {
  return `@[${m.title}](${m.type}:${m.id})`
}

/**
 * Pre-process markdown so that mentions render as standard markdown links with a custom
 * `mention:` scheme. A click handler can intercept clicks on these and route accordingly.
 *
 *   @[RESPONDER_SPECS](note:abc-123)
 * becomes
 *   [@RESPONDER_SPECS](mention:note:abc-123)
 */
export function transformMentionsForPreview(source: string): string {
  if (!source) return source
  return source.replace(MENTION_RE, (_m, title: string, type: string, id: string) => {
    return `[@${title}](mention:${type}:${id})`
  })
}

/** Parse a `mention:type:id` URL produced by the transform above. */
export function parseMentionUrl(url: string): { type: MentionType; id: string } | null {
  if (!url.startsWith('mention:')) return null
  const rest = url.slice('mention:'.length)
  const [type, id] = rest.split(':')
  if (!type || !id) return null
  if (!['note', 'prompt', 'checklist', 'storage'].includes(type)) return null
  return { type: type as MentionType, id }
}

/** Build the substring needle used to find any inbound link to an item. */
export function backlinkNeedle(itemId: string): string {
  return `:${itemId})`
}
