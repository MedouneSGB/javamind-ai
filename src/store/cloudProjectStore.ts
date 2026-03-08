import { create } from 'zustand'
import { useAuthStore } from './authStore'
import { useProjectStore } from './projectStore'
import { ipc } from '../lib/ipc'
import {
  fetchCloudProjects,
  saveCloudProject,
  updateCloudProject,
  deleteCloudProject,
  isTextFile,
} from '../lib/cloudProjects'
import type { CloudProject, FileTreeNode } from '../types/editor.types'

interface CloudProjectStore {
  projects: CloudProject[]
  isLoading: boolean
  isSaving: boolean
  error: string | null

  fetchProjects: () => Promise<void>
  uploadCurrentProject: (name: string, description?: string) => Promise<CloudProject>
  pushToCloud: (id: string) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  clearError: () => void
}

// Recursively collect all text files from a file tree, reading their content
async function collectFiles(
  nodes: FileTreeNode[],
  projectPath: string
): Promise<Record<string, string>> {
  const result: Record<string, string> = {}

  async function walk(node: FileTreeNode) {
    if (node.isDirectory) {
      for (const child of node.children) await walk(child)
    } else {
      if (!isTextFile(node.name)) return
      try {
        const content = await ipc.fs.readFile(node.path)
        // Store as relative path from project root
        const relative = node.path.replace(projectPath, '').replace(/^[\\/]/, '')
        result[relative] = content
      } catch {
        // Skip unreadable files
      }
    }
  }

  for (const node of nodes) await walk(node)
  return result
}

export const useCloudProjectStore = create<CloudProjectStore>()((set, get) => ({
  projects: [],
  isLoading: false,
  isSaving: false,
  error: null,

  fetchProjects: async () => {
    const { user } = useAuthStore.getState()
    if (!user) return
    set({ isLoading: true, error: null })
    try {
      const projects = await fetchCloudProjects(user.id)
      set({ projects })
    } catch (err) {
      set({ error: String(err) })
    } finally {
      set({ isLoading: false })
    }
  },

  uploadCurrentProject: async (name: string, description?: string) => {
    const { user } = useAuthStore.getState()
    if (!user) throw new Error('Not authenticated')
    const { projectPath, fileTree } = useProjectStore.getState()
    if (!projectPath || !fileTree) throw new Error('No project open')

    set({ isSaving: true, error: null })
    try {
      const files = await collectFiles(fileTree.children, projectPath)
      const project = await saveCloudProject(user.id, name, files, description)
      set(state => ({ projects: [project, ...state.projects] }))
      return project
    } catch (err) {
      set({ error: String(err) })
      throw err
    } finally {
      set({ isSaving: false })
    }
  },

  pushToCloud: async (id: string) => {
    const { projectPath, fileTree } = useProjectStore.getState()
    if (!projectPath || !fileTree) throw new Error('No project open')

    set({ isSaving: true, error: null })
    try {
      const files = await collectFiles(fileTree.children, projectPath)
      await updateCloudProject(id, files)
      const now = new Date().toISOString()
      set(state => ({
        projects: state.projects.map(p =>
          p.id === id ? { ...p, files, updatedAt: now } : p
        ),
      }))
    } catch (err) {
      set({ error: String(err) })
      throw err
    } finally {
      set({ isSaving: false })
    }
  },

  deleteProject: async (id: string) => {
    set({ error: null })
    try {
      await deleteCloudProject(id)
      set(state => ({ projects: state.projects.filter(p => p.id !== id) }))
    } catch (err) {
      set({ error: String(err) })
      throw err
    }
  },

  clearError: () => set({ error: null }),
}))
