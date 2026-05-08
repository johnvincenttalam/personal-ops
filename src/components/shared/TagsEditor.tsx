import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import clsx from 'clsx'

interface Props {
  tags: string[]
  onChange?: (next: string[]) => void
  size?: 'sm' | 'md'
  maxDisplay?: number
}

export function TagPills({ tags, size = 'sm', maxDisplay }: Props) {
  if (tags.length === 0) return null
  const visible = maxDisplay ? tags.slice(0, maxDisplay) : tags
  const overflow = maxDisplay ? tags.length - visible.length : 0
  const padding = size === 'md' ? 'px-2 py-0.5 text-xs' : 'px-1.5 py-0.5 text-[10px]'

  return (
    <div className="flex flex-wrap items-center gap-1">
      {visible.map((t) => (
        <span
          key={t}
          className={clsx(
            'rounded-full bg-gray-100 font-medium text-gray-600 dark:bg-zinc-800 dark:text-zinc-400',
            padding
          )}
        >
          #{t}
        </span>
      ))}
      {overflow > 0 && (
        <span className={clsx('text-gray-400 dark:text-zinc-500', size === 'md' ? 'text-xs' : 'text-[10px]')}>
          +{overflow}
        </span>
      )}
    </div>
  )
}

export default function TagsEditor({ tags, onChange }: Props) {
  const [input, setInput] = useState('')
  const editable = !!onChange

  const addTag = () => {
    const t = input.trim().replace(/^#+/, '')
    if (t && !tags.includes(t)) onChange?.([...tags, t])
    setInput('')
  }

  const removeTag = (t: string) => onChange?.(tags.filter((x) => x !== t))

  if (!editable) return <TagPills tags={tags} />

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tags.map((t) => (
        <span
          key={t}
          className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
        >
          #{t}
          <button
            onClick={() => removeTag(t)}
            className="text-brand-400 hover:text-brand-600 dark:text-brand-400/70 dark:hover:text-brand-300"
            aria-label={`Remove tag ${t}`}
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </span>
      ))}
      <div className="inline-flex items-center gap-1 rounded-full border border-dashed border-gray-300 px-2 py-0.5 text-[11px] text-gray-500 focus-within:border-brand-500 dark:border-zinc-700 dark:text-zinc-500">
        <Plus className="h-2.5 w-2.5" />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag() }
            else if (e.key === 'Backspace' && !input && tags.length > 0) {
              onChange?.(tags.slice(0, -1))
            }
          }}
          onBlur={addTag}
          placeholder="add tag"
          className="w-16 bg-transparent outline-none placeholder:text-gray-400 dark:placeholder:text-zinc-600"
        />
      </div>
    </div>
  )
}
