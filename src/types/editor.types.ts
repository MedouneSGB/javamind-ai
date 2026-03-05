export interface EditorTab {
  id: string
  path: string
  name: string
  content: string
  language: string
  isDirty: boolean
  isActive: boolean
}

export interface FileTreeNode {
  name: string
  path: string
  isDirectory: boolean
  children: FileTreeNode[]
}

export interface JavaError {
  filePath?: string
  line?: number
  column?: number
  message: string
  severity: 'error' | 'warning'
}

export interface OutputLine {
  content: string
  type: 'stdout' | 'stderr' | 'info' | 'success' | 'error'
  timestamp: number
}
