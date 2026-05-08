import { describe, it, expect } from 'vitest'
import { canTransition } from './ItemStatus'

describe('canTransition', () => {
  it('allows draft → final and draft → archived', () => {
    expect(canTransition('draft', 'final')).toBe(true)
    expect(canTransition('draft', 'archived')).toBe(true)
  })

  it('allows final → draft and final → archived', () => {
    expect(canTransition('final', 'draft')).toBe(true)
    expect(canTransition('final', 'archived')).toBe(true)
  })

  it('allows archived → draft (recover) but not archived → final', () => {
    expect(canTransition('archived', 'draft')).toBe(true)
    expect(canTransition('archived', 'final')).toBe(false)
  })

  it('always allows the same-state no-op transition', () => {
    expect(canTransition('draft', 'draft')).toBe(true)
    expect(canTransition('final', 'final')).toBe(true)
    expect(canTransition('archived', 'archived')).toBe(true)
  })
})
