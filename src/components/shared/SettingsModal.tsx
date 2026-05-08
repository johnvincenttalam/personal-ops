import { Sun, Moon } from 'lucide-react'
import clsx from 'clsx'
import Modal from '@/components/shared/Modal'
import { useUIStore } from '@/stores/useUIStore'
import type { AccentColor } from '@/stores/useUIStore'

interface Props {
  onClose: () => void
}

const ACCENTS: { value: AccentColor; label: string; bg: string; ring: string }[] = [
  { value: 'violet',  label: 'Violet',  bg: 'bg-violet-500',  ring: 'ring-violet-500' },
  { value: 'blue',    label: 'Blue',    bg: 'bg-blue-500',    ring: 'ring-blue-500'   },
  { value: 'emerald', label: 'Emerald', bg: 'bg-emerald-500', ring: 'ring-emerald-500'},
  { value: 'orange',  label: 'Orange',  bg: 'bg-orange-500',  ring: 'ring-orange-500' },
  { value: 'rose',    label: 'Rose',    bg: 'bg-rose-500',    ring: 'ring-rose-500'   },
  { value: 'cyan',    label: 'Cyan',    bg: 'bg-cyan-500',    ring: 'ring-cyan-500'   },
]

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
      {children}
    </p>
  )
}

export default function SettingsModal({ onClose }: Props) {
  const theme = useUIStore((s) => s.theme)
  const toggleTheme = useUIStore((s) => s.toggleTheme)
  const accent = useUIStore((s) => s.accent)
  const setAccent = useUIStore((s) => s.setAccent)

  return (
    <Modal
      title="Settings"
      onClose={onClose}
      footer={
        <button
          onClick={onClose}
          className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          Close
        </button>
      }
    >
      <div className="space-y-6">
        {/* Theme */}
        <div>
          <SectionLabel>Appearance</SectionLabel>
          <div className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3 dark:border-zinc-800">
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-zinc-200">Theme</p>
              <p className="text-xs text-gray-400 dark:text-zinc-500">
                Currently {theme === 'dark' ? 'dark' : 'light'} mode
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {theme === 'dark' ? (
                <><Sun className="h-4 w-4" />Light</>
              ) : (
                <><Moon className="h-4 w-4" />Dark</>
              )}
            </button>
          </div>
        </div>

        {/* Accent color */}
        <div>
          <SectionLabel>Accent color</SectionLabel>
          <div className="grid grid-cols-6 gap-3">
            {ACCENTS.map((a) => (
              <button
                key={a.value}
                onClick={() => setAccent(a.value)}
                title={a.label}
                className="flex flex-col items-center gap-1.5"
              >
                <span
                  className={clsx(
                    'h-8 w-8 rounded-full transition-transform',
                    a.bg,
                    accent === a.value
                      ? `scale-110 ring-2 ring-offset-2 ${a.ring} dark:ring-offset-zinc-900`
                      : 'scale-100 opacity-70 hover:opacity-100'
                  )}
                />
                <span className={clsx(
                  'text-[10px]',
                  accent === a.value
                    ? 'font-semibold text-gray-800 dark:text-zinc-100'
                    : 'text-gray-400 dark:text-zinc-500'
                )}>
                  {a.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}
