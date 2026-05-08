import type { LucideIcon } from 'lucide-react'
import { Plus, FolderPlus } from 'lucide-react'

export interface TemplateCard {
  id: string
  label: string
  description: string
  icon: LucideIcon
}

interface Props {
  heading: string
  subheading?: string
  templates: TemplateCard[]
  onPick: (id: string) => void
  onBlank: () => void
  blankLabel: string
  /** When set, disables all template/blank actions and shows this hint instead. */
  disabledMessage?: string
}

export default function EmptyTemplates({
  heading,
  subheading,
  templates,
  onPick,
  onBlank,
  blankLabel,
  disabledMessage,
}: Props) {
  if (disabledMessage) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-zinc-800 dark:text-zinc-500">
          <FolderPlus className="h-5 w-5" />
        </div>
        <p className="mt-3 max-w-xs text-sm text-gray-500 dark:text-zinc-400">
          {disabledMessage}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col px-3 py-4">
      <h3 className="px-2 text-sm font-semibold text-gray-700 dark:text-zinc-200">
        {heading}
      </h3>
      {subheading && (
        <p className="mt-0.5 px-2 text-xs text-gray-400 dark:text-zinc-500">
          {subheading}
        </p>
      )}

      <div className="mt-3 space-y-2">
        {templates.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => onPick(t.id)}
              className="group flex w-full items-start gap-3 rounded-xl border border-dashed border-gray-300 bg-white p-3 text-left transition hover:border-brand-400 hover:bg-brand-50/40 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-brand-500/40 dark:hover:bg-brand-500/5"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition group-hover:bg-brand-100 group-hover:text-brand-600 dark:bg-zinc-800 dark:text-zinc-400 dark:group-hover:bg-brand-500/20 dark:group-hover:text-brand-300">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-zinc-100">
                  {t.label}
                </p>
                <p className="mt-0.5 line-clamp-2 text-xs text-gray-500 dark:text-zinc-400">
                  {t.description}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      <button
        onClick={onBlank}
        className="mt-3 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
      >
        <Plus className="h-3.5 w-3.5" /> {blankLabel}
      </button>
    </div>
  )
}
