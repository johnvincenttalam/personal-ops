import { describe, it, expect } from 'vitest'
import { diffPatch } from './diffPatch'

describe('diffPatch', () => {
  it('returns empty when nothing changed', () => {
    expect(diffPatch({ a: 1, b: 'x' }, { a: 1, b: 'x' })).toEqual({})
  })

  it('returns only changed primitive fields', () => {
    expect(diffPatch({ a: 1, b: 'x' }, { a: 2, b: 'x' })).toEqual({ a: 2 })
  })

  it('uses deep equality for arrays (no patch when contents match)', () => {
    expect(diffPatch({ tags: ['a', 'b'] }, { tags: ['a', 'b'] })).toEqual({})
  })

  it('detects array content changes', () => {
    expect(diffPatch({ tags: ['a', 'b'] }, { tags: ['a', 'c'] })).toEqual({ tags: ['a', 'c'] })
  })

  it('detects array order changes', () => {
    expect(diffPatch({ tags: ['a', 'b'] }, { tags: ['b', 'a'] })).toEqual({ tags: ['b', 'a'] })
  })

  it('handles nested objects via JSON equality', () => {
    expect(diffPatch({ meta: { x: 1 } }, { meta: { x: 1 } })).toEqual({})
    expect(diffPatch({ meta: { x: 1 } }, { meta: { x: 2 } })).toEqual({ meta: { x: 2 } })
  })
})
