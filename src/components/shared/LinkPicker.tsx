import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, FileText, Sparkles, CheckSquare, Archive, Link2 } from 'lucide-react'
import clsx from 'clsx'
import { services } from '@/infrastructure/composition'
import Modal from '@/components/shared/Modal'
import type { CorpusItem } from '@/application/ports/SearchGateway'
import type { Mention, MentionType } from '@/domain/rules/parseMentions'

interface Props {
  excludeId?: string
  onPick: (mention: Mention) => void
  onClose: () => void
}

const TYPE_META: Record<MentionType, { label: string; icon: typeof FileText }> = {
  note: { label: 'Note', icon: FileText },
  prompt: { label: 'Prompt', icon: Sparkles },
  checklist: { label: 'Checklist', icon: CheckSquare },
  storage: { label: 'Snippet', icon: Archive },
}

export default function LinkPicker({ excludeId, onPick, onClose }: Props) {
  const [items, setItems] = useState<CorpusItem[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [highlighted, setHighlighted] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    setLoading(true)
    services.search.getCorpus()
      .then(setItems)
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = excludeId ? items.filter((i) => i.id !== excludeId) : items
    if (!q) return base.slice(0, 50)
    return base.filter((i) => i.title.toLowerCase().includes(q)).slice(0, 50)
  }, [items, query, excludeId])

  useEffect(() => { setHighlighted(0) }, [query])

  const pick = (item: CorpusItem) => {
    onPick({ id: item.id, title: item.title, type: item.type })
    onClose()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted((h) => Math.max(h - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = filtered[highlighted]
      if (item) pick(item)
    }
  }

  return (
    <Modal title="Insert link" onClose={onClose} maxWidth="max-w-xl">
      <div className="space-y-3">
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500/30 dark:border-zinc-700">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search across all items..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
          />
        </div>

        <div className="max-h-[50vh] overflow-y-auto">
          {loading && (
            <p className="px-3 py-6 text-center text-xs text-gray-400 dark:text-zinc-500">Loading...</p>
          )}
          {!loading && filtered.length === 0 && (
            <p className="px-3 py-6 text-center text-xs text-gray-400 dark:text-zinc-500">
              No matches
            </p>
          )}
          {!loading && filtered.map((item, idx) => {
            const meta = TYPE_META[item.type]
            const Icon = meta.icon
            return (
              <button
                key={`${item.type}-${item.id}`}
                onClick={() => pick(item)}
                onMouseEnter={() => setHighlighted(idx)}
                className={clsx(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm',
                  highlighted === idx
                    ? 'bg-gray-100 dark:bg-zinc-800'
                    : 'hover:bg-gray-50 dark:hover:bg-zinc-800/60'
                )}
              >
                <Icon className="h-4 w-4 shrink-0 text-gray-400" />
                <span className="flex-1 truncate">{item.title}</span>
                <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-gray-500 dark:bg-zinc-800 dark:text-zinc-400">
                  {meta.label}
                </span>
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2 border-t border-gray-100 px-1 pt-3 text-[11px] text-gray-400 dark:border-zinc-800 dark:text-zinc-500">
          <Link2 className="h-3 w-3" />
          <span>↑↓ to navigate, Enter to insert, Esc to cancel</span>
        </div>
      </div>
    </Modal>
  )
}
