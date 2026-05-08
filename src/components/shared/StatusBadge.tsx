import { useEffect, useRef, useState } from 'react'
import { ChevronDown, FileText, CheckCircle2, Archive } from 'lucide-react'
import clsx from 'clsx'
import type { ItemStatus } from '@/types'

const STATUS_META: Record<ItemStatus, {
  label: string
  icon: typeof FileText
  pillClass: string
}> = {
  draft: {
    label: 'Draft',
    icon: FileText,
    pillClass:
      'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400',
  },
  final: {
    label: 'Final',
    icon: CheckCircle2,
    pillClass:
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  },
  archived: {
    label: 'Archived',
    icon: Archive,
    pillClass:
      'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  },
}

const STATUS_ORDER: ItemStatus[] = ['draft', 'final', 'archived']

interface Props {
  status: ItemStatus
  onChange?: (next: ItemStatus) => void
  size?: 'sm' | 'md'
}

export default function StatusBadge({ status, onChange, size = 'sm' }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const meta = STATUS_META[status]
  const Icon = meta.icon
  const editable = !!onChange

  useEffect(() => {
    if (!open) return
    const onClickAway = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('mousedown', onClickAway)
    return () => window.removeEventListener('mousedown', onClickAway)
  }, [open])

  const padding = size === 'md' ? 'px-2.5 py-1 text-xs' : 'px-2 py-0.5 text-[11px]'
  const iconSize = size === 'md' ? 'h-3.5 w-3.5' : 'h-3 w-3'

  if (!editable) {
    return (
      <span className={clsx('inline-flex items-center gap-1 rounded-full font-medium', padding, meta.pillClass)}>
        <Icon className={iconSize} />
        {meta.label}
      </span>
    )
  }

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
        className={clsx(
          'inline-flex items-center gap-1 rounded-full font-medium transition hover:brightness-95 dark:hover:brightness-110',
          padding,
          meta.pillClass
        )}
      >
        <Icon className={iconSize} />
        {meta.label}
        <ChevronDown className={iconSize} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 min-w-[140px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
          {STATUS_ORDER.map((s) => {
            const sMeta = STATUS_META[s]
            const SIcon = sMeta.icon
            return (
              <button
                key={s}
                onClick={(e) => {
                  e.stopPropagation()
                  onChange?.(s)
                  setOpen(false)
                }}
                className={clsx(
                  'flex w-full items-center gap-2 px-3 py-1.5 text-xs transition-colors',
                  s === status
                    ? 'bg-gray-50 font-medium text-gray-900 dark:bg-zinc-700/50 dark:text-zinc-100'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-zinc-300 dark:hover:bg-zinc-700/50'
                )}
              >
                <SIcon className="h-3.5 w-3.5" />
                {sMeta.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
