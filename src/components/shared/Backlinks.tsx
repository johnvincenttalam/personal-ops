import { useEffect, useState } from 'react'
import { ChevronDown, ChevronRight, FileText, Sparkles, CheckSquare, Archive, ArrowUpRight } from 'lucide-react'
import clsx from 'clsx'
import { services } from '@/infrastructure/composition'
import { useMentionRouter } from '@/hooks/useMentionRouter'
import type { BacklinkRef } from '@/application/ports/SearchGateway'
import type { MentionType } from '@/domain/rules/parseMentions'

interface Props {
  itemId: string
  /** Don't include the current item's own occurrences as a backlink. */
  selfId?: string
}

const TYPE_ICON: Record<MentionType, typeof FileText> = {
  note: FileText,
  prompt: Sparkles,
  checklist: CheckSquare,
  storage: Archive,
}

const TYPE_LABEL: Record<MentionType, string> = {
  note: 'Note',
  prompt: 'Prompt',
  checklist: 'Checklist',
  storage: 'Snippet',
}

export default function Backlinks({ itemId, selfId }: Props) {
  const [items, setItems] = useState<BacklinkRef[] | null>(null)
  const [open, setOpen] = useState(true)
  const route = useMentionRouter()

  useEffect(() => {
    if (!itemId) return
    let cancelled = false
    services.search.findBacklinksTo(itemId).then((refs) => {
      if (cancelled) return
      setItems(selfId ? refs.filter((r) => r.id !== selfId) : refs)
    })
    return () => { cancelled = true }
  }, [itemId, selfId])

  if (items === null) return null
  if (items.length === 0) return null

  return (
    <div className="border-t border-gray-200 bg-white px-6 py-3 dark:border-zinc-800 dark:bg-zinc-900">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200"
      >
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        Backlinks
        <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500 dark:bg-zinc-800 dark:text-zinc-400">
          {items.length}
        </span>
      </button>
      {open && (
        <div className="mt-2 space-y-1">
          {items.map((b) => {
            const Icon = TYPE_ICON[b.type]
            return (
              <button
                key={`${b.type}-${b.id}`}
                onClick={() => route(`mention:${b.type}:${b.id}`)}
                className={clsx(
                  'group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm',
                  'text-gray-700 hover:bg-gray-50 dark:text-zinc-300 dark:hover:bg-zinc-800/60'
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                <span className="flex-1 truncate">{b.title}</span>
                <span className="shrink-0 text-[10px] uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                  {TYPE_LABEL[b.type]}
                </span>
                <ArrowUpRight className="h-3 w-3 shrink-0 text-gray-300 opacity-0 transition group-hover:opacity-100 dark:text-zinc-600" />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
