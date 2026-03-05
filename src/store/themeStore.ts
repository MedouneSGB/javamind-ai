import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'dark' | 'light'

interface ThemeStore {
  theme: Theme
  toggleTheme: () => void
  setTheme: (t: Theme) => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark'
        set({ theme: next })
        document.documentElement.setAttribute('data-theme', next)
      },
      setTheme: (t) => {
        set({ theme: t })
        document.documentElement.setAttribute('data-theme', t)
      },
    }),
    { name: 'theme-store' }
  )
)

// Apply persisted theme on load
export function applyStoredTheme() {
  try {
    const stored = localStorage.getItem('theme-store')
    if (stored) {
      const { state } = JSON.parse(stored)
      if (state?.theme) {
        document.documentElement.setAttribute('data-theme', state.theme)
      }
    }
  } catch {}
}
