/**
 * Returns only the keys whose values changed. Uses JSON.stringify for deep equality
 * (sufficient for primitives + plain arrays/objects, which is what entities hold).
 */
export function diffPatch<T extends object>(prev: T, next: T): Partial<T> {
  const patch: Partial<T> = {}
  for (const key of Object.keys(next) as (keyof T)[]) {
    const a = prev[key]
    const b = next[key]
    if (a === b) continue
    if (JSON.stringify(a) === JSON.stringify(b)) continue
    patch[key] = b
  }
  return patch
}
