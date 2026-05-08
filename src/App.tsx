import { useEffect } from 'react'
import Home from '@/pages/Home'
import { useUIStore } from '@/stores/useUIStore'
import { useProjectStore } from '@/stores/useProjectStore'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { CommandPalette } from '@/components/shared/CommandPalette'
import type { AccentColor } from '@/stores/useUIStore'

const ACCENT_VARS: Record<AccentColor, {
  '50': string; '100': string; '500': string; '600': string; '700': string
  hex: string; hexLight: string
}> = {
  violet:  { '50': '245 243 255', '100': '237 233 254', '500': '124 58 237',  '600': '109 40 217', '700': '91 33 182',  hex: '#7c3aed', hexLight: '#a78bfa' },
  blue:    { '50': '239 246 255', '100': '219 234 254', '500': '59 130 246',  '600': '37 99 235',  '700': '29 78 216',  hex: '#3b82f6', hexLight: '#93c5fd' },
  emerald: { '50': '236 253 245', '100': '209 250 229', '500': '16 185 129',  '600': '5 150 105',  '700': '4 120 87',   hex: '#10b981', hexLight: '#6ee7b7' },
  orange:  { '50': '255 247 237', '100': '255 237 213', '500': '249 115 22',  '600': '234 88 12',  '700': '194 65 12',  hex: '#f97316', hexLight: '#fdba74' },
  rose:    { '50': '255 241 242', '100': '255 228 230', '500': '244 63 94',   '600': '225 29 72',  '700': '190 18 60',  hex: '#f43f5e', hexLight: '#fda4af' },
  cyan:    { '50': '236 254 255', '100': '207 250 254', '500': '6 182 212',   '600': '8 145 178',  '700': '14 116 144', hex: '#06b6d4', hexLight: '#67e8f9' },
}

function applyAccentVars(accent: AccentColor) {
  const vars = ACCENT_VARS[accent]
  const el = document.documentElement
  el.style.setProperty('--brand-50',        vars['50'])
  el.style.setProperty('--brand-100',       vars['100'])
  el.style.setProperty('--brand-500',       vars['500'])
  el.style.setProperty('--brand-600',       vars['600'])
  el.style.setProperty('--brand-700',       vars['700'])
  el.style.setProperty('--brand-hex',       vars.hex)
  el.style.setProperty('--brand-hex-light', vars.hexLight)
}

export default function App() {
  const theme = useUIStore((s) => s.theme)
  const fetchProjects = useProjectStore((s) => s.fetchProjects)
  const setSearchOpen = useUIStore((s) => s.setSearchOpen)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    // Apply persisted accent immediately, then keep in sync via store subscription.
    // Using subscribe (not useEffect([accent])) so updates fire synchronously
    // on every setAccent call, bypassing React's batching/scheduling.
    applyAccentVars(useUIStore.getState().accent)
    return useUIStore.subscribe((s) => applyAccentVars(s.accent))
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setSearchOpen])

  return (
    <>
      <Home />
      <CommandPalette />
      <ConfirmDialog />
    </>
  )
}
