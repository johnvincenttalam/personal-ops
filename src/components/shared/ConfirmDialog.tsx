import { create } from 'zustand'
import { AlertTriangle } from 'lucide-react'
import clsx from 'clsx'
import Modal from '@/components/shared/Modal'

export interface ConfirmOptions {
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'danger'
}

interface ConfirmState {
  open: boolean
  options: ConfirmOptions | null
  resolve: ((value: boolean) => void) | null
  show: (options: ConfirmOptions) => Promise<boolean>
  resolveWith: (value: boolean) => void
}

const useConfirmStore = create<ConfirmState>((set, get) => ({
  open: false,
  options: null,
  resolve: null,
  show: (options) =>
    new Promise<boolean>((resolve) => {
      set({ open: true, options, resolve })
    }),
  resolveWith: (value) => {
    get().resolve?.(value)
    set({ open: false, options: null, resolve: null })
  },
}))

export const confirmDialog = (options: ConfirmOptions) =>
  useConfirmStore.getState().show(options)

export function ConfirmDialog() {
  const open = useConfirmStore((s) => s.open)
  const options = useConfirmStore((s) => s.options)
  const resolveWith = useConfirmStore((s) => s.resolveWith)

  if (!open || !options) return null

  const isDanger = options.variant === 'danger'

  const footer = (
    <>
      <button
        onClick={() => resolveWith(false)}
        className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
        autoFocus={!isDanger}
      >
        {options.cancelText ?? 'Cancel'}
      </button>
      <button
        onClick={() => resolveWith(true)}
        className={clsx(
          'rounded-lg px-4 py-2 text-sm font-medium text-white transition',
          isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-500 hover:bg-brand-600'
        )}
        autoFocus={isDanger}
      >
        {options.confirmText ?? 'Confirm'}
      </button>
    </>
  )

  return (
    <Modal title={options.title} onClose={() => resolveWith(false)} footer={footer}>
      <div className="flex gap-4">
        {isDanger && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
        )}
        {options.description && (
          <p className="text-sm text-gray-500 dark:text-zinc-400">{options.description}</p>
        )}
      </div>
    </Modal>
  )
}
