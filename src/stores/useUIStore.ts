import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Tab } from '@/types'

export type MobileView = 'sidebar' | 'list' | 'editor'
export type AccentColor = 'violet' | 'blue' | 'emerald' | 'orange' | 'rose' | 'cyan'

interface UIState {
  activeTab: Tab
  theme: 'light' | 'dark'
  accent: AccentColor
  searchOpen: boolean
  mobileView: MobileView
  sidebarCollapsed: boolean
  setActiveTab: (tab: Tab) => void
  toggleTheme: () => void
  setAccent: (accent: AccentColor) => void
  setSearchOpen: (open: boolean) => void
  setMobileView: (view: MobileView) => void
  toggleSidebar: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      activeTab: 'notes',
      theme: 'light',
      accent: 'violet',
      searchOpen: false,
      mobileView: 'list',
      sidebarCollapsed: false,
      setActiveTab: (tab) => set({ activeTab: tab }),
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
      setAccent: (accent) => set({ accent }),
      setSearchOpen: (open) => set({ searchOpen: open }),
      setMobileView: (view) => set({ mobileView: view }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    }),
    {
      name: 'personal-ops-ui',
      partialize: (s) => ({
        activeTab: s.activeTab,
        theme: s.theme,
        accent: s.accent,
        sidebarCollapsed: s.sidebarCollapsed,
      }),
    }
  )
)
