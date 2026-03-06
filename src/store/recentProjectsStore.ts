import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface RecentProject {
  path: string
  name: string
  lastOpenedAt: number
}

const MAX_RECENT = 5

interface RecentProjectsStore {
  projects: RecentProject[]
  addRecentProject: (path: string, name: string) => void
  removeRecentProject: (path: string) => void
  setProjects: (projects: RecentProject[]) => void
}

export const useRecentProjectsStore = create<RecentProjectsStore>()(
  persist(
    (set) => ({
      projects: [],

      addRecentProject: (path, name) =>
        set((state) => {
          const filtered = state.projects.filter((p) => p.path !== path)
          const updated = [{ path, name, lastOpenedAt: Date.now() }, ...filtered].slice(0, MAX_RECENT)
          return { projects: updated }
        }),

      removeRecentProject: (path) =>
        set((state) => ({ projects: state.projects.filter((p) => p.path !== path) })),

      setProjects: (projects) => set({ projects }),
    }),
    { name: 'javamind:recentProjects' }
  )
)
