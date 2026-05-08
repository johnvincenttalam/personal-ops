import { describe, it, expect } from 'vitest'
import { normalizeTag, dedupeTags } from './Tag'

describe('normalizeTag', () => {
  it('lowercases and trims', () => {
    expect(normalizeTag('  Foo  ')).toBe('foo')
  })

  it('strips leading hashes', () => {
    expect(normalizeTag('#tag')).toBe('tag')
    expect(normalizeTag('##tag')).toBe('tag')
  })

  it('returns null for empty / whitespace only', () => {
    expect(normalizeTag('')).toBeNull()
    expect(normalizeTag('   ')).toBeNull()
    expect(normalizeTag('#')).toBeNull()
  })
})

describe('dedupeTags', () => {
  it('removes case-insensitive duplicates', () => {
    expect(dedupeTags(['Foo', 'foo', 'FOO'])).toEqual(['foo'])
  })

  it('treats #tag and tag as the same', () => {
    expect(dedupeTags(['#flutter', 'flutter'])).toEqual(['flutter'])
  })

  it('preserves order of first occurrence', () => {
    expect(dedupeTags(['b', 'a', 'B', 'a'])).toEqual(['b', 'a'])
  })

  it('drops empty values', () => {
    expect(dedupeTags(['foo', '', '   ', 'bar'])).toEqual(['foo', 'bar'])
  })

  it('returns empty array for empty input', () => {
    expect(dedupeTags([])).toEqual([])
  })
})
