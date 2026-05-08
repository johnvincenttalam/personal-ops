import { Plus } from 'lucide-react'
import clsx from 'clsx'
import { relativeLabel } from '@/components/shared/formatDate'

interface RecentItem {
  id: string
  title: string
  updated_at: string
}

interface Props {
  heading: string
  hint: string
  recent: RecentItem[]
  onSelect: (id: string) => void
  onCreate: () => void
  createLabel: string
  disabled?: boolean
}

export default function WelcomePanel({
  heading,
  hint,
  recent,
  onSelect,
  onCreate,
  createLabel,
  disabled,
}: Props) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 px-8">
      <div className="text-center">
        <h2 className="text-base font-semibold text-gray-900 dark:text-zinc-100">{heading}</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">{hint}</p>
      </div>

      {recent.length > 0 && (
        <div className="w-full max-w-xs">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
            Recent
          </p>
          <div className="space-y-0.5">
            {recent.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className="flex w-full items-baseline justify-between gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-gray-100 dark:hover:bg-zinc-800"
              >
                <span className="truncate text-sm text-gray-800 dark:text-zinc-200">
                  {item.title || 'Untitled'}
                </span>
                <span className="shrink-0 text-[11px] text-gray-400 dark:text-zinc-500">
                  {relativeLabel(item.updated_at)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onCreate}
        disabled={disabled}
        className={clsx(
          'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition',
          disabled
            ? 'cursor-not-allowed bg-brand-500 opacity-40'
            : 'bg-brand-500 hover:bg-brand-600 active:scale-[0.98]'
        )}
      >
        <Plus className="h-4 w-4" />
        {createLabel}
      </button>
    </div>
  )
}
