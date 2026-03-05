import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { EditorTab } from '../types/editor.types'
import { ipc } from '../lib/ipc'

interface EditorStore {
  tabs: EditorTab[]
  activeTabId: string | null
  openFile: (filePath: string, content: string) => void
  closeTab: (id: string) => void
  setActiveTab: (id: string) => void
  updateContent: (id: string, content: string) => void
  saveFile: (id: string) => Promise<void>
  saveAllDirty: () => Promise<void>
  getActiveTab: () => EditorTab | null
  closeAllTabs: () => void
}

function getLanguage(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase()
  const map: Record<string, string> = {
    java: 'java',
    ts: 'typescript',
    tsx: 'typescriptreact',
    js: 'javascript',
    jsx: 'javascriptreact',
    json: 'json',
    xml: 'xml',
    md: 'markdown',
    txt: 'plaintext',
    html: 'html',
    css: 'css',
    yml: 'yaml',
    yaml: 'yaml',
  }
  return map[ext || ''] || 'plaintext'
}

const getName = (filePath: string) => filePath.split(/[\\/]/).pop() || filePath

export const useEditorStore = create<EditorStore>()(
  persist(
    (set, get) => ({
      tabs: [],
      activeTabId: null,

      openFile: (filePath, content) => {
        const existing = get().tabs.find(t => t.path === filePath)
        if (existing) {
          set({ activeTabId: existing.id })
          return
        }
        const tab: EditorTab = {
          id: filePath,
          path: filePath,
          name: getName(filePath),
          content,
          language: getLanguage(filePath),
          isDirty: false,
          isActive: true,
        }
        set(state => ({
          tabs: [...state.tabs.map(t => ({ ...t, isActive: false })), tab],
          activeTabId: tab.id,
        }))
      },

      closeTab: (id) => {
        set(state => {
          const idx = state.tabs.findIndex(t => t.id === id)
          const newTabs = state.tabs.filter(t => t.id !== id)
          let newActive = state.activeTabId
          if (state.activeTabId === id) {
            newActive = newTabs[Math.min(idx, newTabs.length - 1)]?.id || null
          }
          return { tabs: newTabs, activeTabId: newActive }
        })
      },

      setActiveTab: (id) => {
        set(state => ({
          tabs: state.tabs.map(t => ({ ...t, isActive: t.id === id })),
          activeTabId: id,
        }))
      },

      updateContent: (id, content) => {
        set(state => ({
          tabs: state.tabs.map(t =>
            t.id === id ? { ...t, content, isDirty: true } : t
          ),
        }))
      },

      saveFile: async (id) => {
        const tab = get().tabs.find(t => t.id === id)
        if (!tab) return
        await ipc.fs.writeFile(tab.path, tab.content)
        set(state => ({
          tabs: state.tabs.map(t => t.id === id ? { ...t, isDirty: false } : t),
        }))
      },

      saveAllDirty: async () => {
        const dirty = get().tabs.filter(t => t.isDirty)
        await Promise.all(dirty.map(t => ipc.fs.writeFile(t.path, t.content)))
        set(state => ({
          tabs: state.tabs.map(t => ({ ...t, isDirty: false })),
        }))
      },

      getActiveTab: () => {
        const { tabs, activeTabId } = get()
        return tabs.find(t => t.id === activeTabId) || null
      },

      closeAllTabs: () => set({ tabs: [], activeTabId: null }),
    }),
    {
      name: 'editor-store',
      partialize: (state) => ({
        // Only persist tab paths, not content (re-read from disk)
        tabs: state.tabs.map(t => ({ ...t, content: '' })),
        activeTabId: state.activeTabId,
      }),
    }
  )
)
