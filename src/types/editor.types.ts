export interface EditorTab {
  id: string
  path: string
  name: string
  content: string
  language: string
  isDirty: boolean
  isActive: boolean
  /** 'lesson' tabs render the LessonView; 'challenge' tabs show Monaco with a challenge header */
  kind?: 'file' | 'lesson' | 'challenge'
  lessonId?: string
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

export interface CloudProject {
  id: string
  name: string
  description?: string
  /** Relative path → file content, e.g. { "src/Main.java": "..." } */
  files: Record<string, string>
  createdAt: string
  updatedAt: string
}
