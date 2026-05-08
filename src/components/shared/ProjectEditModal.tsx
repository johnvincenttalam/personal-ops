import { useEffect, useRef, useState } from 'react'
import { X, Plus } from 'lucide-react'
import clsx from 'clsx'
import Modal from '@/components/shared/Modal'
import { colorSwatch, COLOR_OPTIONS } from '@/components/shared/colors'
import type { Project, ProjectColor } from '@/types'

interface ProjectData {
  name: string
  color: ProjectColor
  description: string
  tags: string[]
}

interface Props {
  project?: Project
  onSave: (data: ProjectData) => void
  onClose: () => void
}

export default function ProjectEditModal({ project, onSave, onClose }: Props) {
  const [name, setName] = useState(project?.name ?? '')
  const [color, setColor] = useState<ProjectColor>(project?.color ?? 'violet')
  const [description, setDescription] = useState(project?.description ?? '')
  const [tags, setTags] = useState<string[]>(project?.tags ?? [])
  const [tagInput, setTagInput] = useState('')
  const nameRef = useRef<HTMLInputElement>(null)

  const isCreating = !project

  useEffect(() => { nameRef.current?.focus() }, [])

  const addTag = () => {
    const t = tagInput.trim().replace(/^#+/, '')
    if (t && !tags.includes(t)) setTags([...tags, t])
    setTagInput('')
  }

  const removeTag = (t: string) => setTags(tags.filter((x) => x !== t))

  const handleSave = () => {
    if (!name.trim()) return
    onSave({ name: name.trim(), color, description, tags })
    onClose()
  }

  const footer = (
    <>
      <button
        onClick={onClose}
        className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
      >
        Cancel
      </button>
      <button
        onClick={handleSave}
        disabled={!name.trim()}
        className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-40"
      >
        {isCreating ? 'Create project' : 'Save'}
      </button>
    </>
  )

  return (
    <Modal
      title={isCreating ? 'New project' : 'Edit project'}
      onClose={onClose}
      footer={footer}
    >
      <div className="space-y-5">
        {/* Name */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-zinc-400">
            Name
          </label>
          <input
            ref={nameRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
            placeholder="Project name"
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>

        {/* Color */}
        <div>
          <label className="mb-2 block text-xs font-medium text-gray-500 dark:text-zinc-400">
            Color
          </label>
          <div className="flex gap-2">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={clsx(
                  'h-7 w-7 rounded-full transition-transform',
                  colorSwatch[c],
                  color === c
                    ? 'scale-110 ring-2 ring-brand-500 ring-offset-2 dark:ring-offset-zinc-900'
                    : 'scale-100'
                )}
                title={c}
              />
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-zinc-400">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this project about?"
            rows={3}
            className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-600"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-zinc-400">
            Tags
          </label>
          {tags.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                >
                  #{t}
                  <button onClick={() => removeTag(t)} className="text-brand-400 hover:text-brand-600">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag() }
              }}
              placeholder="Add a tag and press Enter..."
              className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-600"
            />
            <button
              onClick={addTag}
              disabled={!tagInput.trim()}
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
