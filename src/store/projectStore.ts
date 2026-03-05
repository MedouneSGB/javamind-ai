import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FileTreeNode, JavaError, OutputLine } from '../types/editor.types'

interface ProjectStore {
  projectPath: string | null
  fileTree: FileTreeNode | null
  isCompiling: boolean
  isRunning: boolean
  runningPid: number | null
  output: OutputLine[]
  errors: JavaError[]
  setProjectPath: (path: string | null) => void
  setFileTree: (tree: FileTreeNode | null) => void
  setCompiling: (val: boolean) => void
  setRunning: (val: boolean, pid?: number) => void
  appendOutput: (line: Omit<OutputLine, 'timestamp'>) => void
  clearOutput: () => void
  setErrors: (errors: JavaError[]) => void
  clearErrors: () => void
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      projectPath: null,
      fileTree: null,
      isCompiling: false,
      isRunning: false,
      runningPid: null,
      output: [],
      errors: [],

      setProjectPath: (path) => set({ projectPath: path }),
      setFileTree: (tree) => set({ fileTree: tree }),
      setCompiling: (val) => set({ isCompiling: val }),
      setRunning: (val, pid) => set({ isRunning: val, runningPid: pid || null }),
      appendOutput: (line) =>
        set(state => ({
          output: [...state.output.slice(-500), { ...line, timestamp: Date.now() }],
        })),
      clearOutput: () => set({ output: [] }),
      setErrors: (errors) => set({ errors }),
      clearErrors: () => set({ errors: [] }),
    }),
    {
      name: 'project-store',
      partialize: (state) => ({ projectPath: state.projectPath }),
    }
  )
)
