export function normalizeTag(raw: string): string | null {
  const t = raw.trim().replace(/^#+/, '').toLowerCase()
  return t.length > 0 ? t : null
}

export function dedupeTags(tags: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const t of tags) {
    const n = normalizeTag(t)
    if (n && !seen.has(n)) {
      seen.add(n)
      out.push(n)
    }
  }
  return out
}
