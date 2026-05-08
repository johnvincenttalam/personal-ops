import { describe, it, expect } from 'vitest'
import {
  extractMentions,
  formatMention,
  transformMentionsForPreview,
  parseMentionUrl,
  backlinkNeedle,
} from './parseMentions'

describe('extractMentions', () => {
  it('returns empty for source with no mentions', () => {
    expect(extractMentions('hello world')).toEqual([])
    expect(extractMentions('')).toEqual([])
  })

  it('extracts a single mention', () => {
    const out = extractMentions('see @[Specs](note:abc-123-def) for details')
    expect(out).toEqual([{ type: 'note', id: 'abc-123-def', title: 'Specs' }])
  })

  it('extracts multiple mentions of varying types', () => {
    const src = 'a @[X](note:11) and b @[Y](prompt:22) and c @[Z](storage:33)'
    expect(extractMentions(src)).toEqual([
      { type: 'note', id: '11', title: 'X' },
      { type: 'prompt', id: '22', title: 'Y' },
      { type: 'storage', id: '33', title: 'Z' },
    ])
  })

  it('ignores malformed mentions', () => {
    expect(extractMentions('@[X](unknown:1)')).toEqual([])
    expect(extractMentions('@X(note:1)')).toEqual([])
  })
})

describe('formatMention', () => {
  it('produces the canonical literal', () => {
    expect(formatMention({ type: 'note', id: 'abc', title: 'Hello' }))
      .toBe('@[Hello](note:abc)')
  })
})

describe('transformMentionsForPreview', () => {
  it('rewrites mentions to mention:-scheme markdown links', () => {
    expect(transformMentionsForPreview('see @[Specs](note:abc) here'))
      .toBe('see [@Specs](mention:note:abc) here')
  })

  it('passes through text with no mentions', () => {
    expect(transformMentionsForPreview('plain content')).toBe('plain content')
    expect(transformMentionsForPreview('')).toBe('')
  })
})

describe('parseMentionUrl', () => {
  it('parses valid URLs', () => {
    expect(parseMentionUrl('mention:note:abc')).toEqual({ type: 'note', id: 'abc' })
    expect(parseMentionUrl('mention:storage:xyz-1')).toEqual({ type: 'storage', id: 'xyz-1' })
  })

  it('rejects non-mention URLs', () => {
    expect(parseMentionUrl('https://example.com')).toBeNull()
    expect(parseMentionUrl('mention:')).toBeNull()
    expect(parseMentionUrl('mention:unknown:abc')).toBeNull()
  })
})

describe('backlinkNeedle', () => {
  it('produces a substring that matches the canonical mention closing', () => {
    const id = 'abc-123'
    const literal = formatMention({ type: 'note', id, title: 'X' })
    expect(literal).toContain(backlinkNeedle(id))
  })
})
