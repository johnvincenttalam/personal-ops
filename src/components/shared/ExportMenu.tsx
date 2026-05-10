import { useEffect, useRef, useState } from 'react'
import { Download } from 'lucide-react'
import { downloadTextFile, slugifyFilename } from '@/lib/download'

type Props = {
  filename: string
  content: string
  className?: string
}

export default function ExportMenu({ filename, content, className }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const base = slugifyFilename(filename)

  const handle = (ext: 'md' | 'txt') => {
    const mime = ext === 'md' ? 'text/markdown' : 'text/plain'
    downloadTextFile(`${base}.${ext}`, content, mime)
    setOpen(false)
  }

  return (
    <div className={`relative ${className ?? ''}`} ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-zinc-800"
        title="Download"
        aria-label="Download"
      >
        <Download className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          <button
            onClick={() => handle('md')}
            className="block w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Markdown (.md)
          </button>
          <button
            onClick={() => handle('txt')}
            className="block w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Plain text (.txt)
          </button>
        </div>
      )}
    </div>
  )
}
