import type { AiStreamPayload } from '../types/ai.types'

// Type-safe IPC wrapper
export const ipc = {
  window: {
    minimize: () => window.electronAPI.window.minimize(),
    maximize: () => window.electronAPI.window.maximize(),
    close: () => window.electronAPI.window.close(),
  },

  fs: {
    openProject: (): Promise<string | null> =>
      window.electronAPI.invoke('fs:openProject') as Promise<string | null>,
    openFile: (): Promise<string | null> =>
      window.electronAPI.invoke('fs:openFile') as Promise<string | null>,
    readFile: (path: string): Promise<string> =>
      window.electronAPI.invoke('fs:readFile', path) as Promise<string>,
    writeFile: (path: string, content: string): Promise<boolean> =>
      window.electronAPI.invoke('fs:writeFile', path, content) as Promise<boolean>,
    readDir: (path: string): Promise<import('../types/editor.types').FileTreeNode> =>
      window.electronAPI.invoke('fs:readDir', path) as Promise<import('../types/editor.types').FileTreeNode>,
    createFile: (path: string): Promise<boolean> =>
      window.electronAPI.invoke('fs:createFile', path) as Promise<boolean>,
    createDir: (path: string): Promise<boolean> =>
      window.electronAPI.invoke('fs:createDir', path) as Promise<boolean>,
    deleteFile: (path: string): Promise<boolean> =>
      window.electronAPI.invoke('fs:deleteFile', path) as Promise<boolean>,
    rename: (oldPath: string, newPath: string): Promise<boolean> =>
      window.electronAPI.invoke('fs:rename', oldPath, newPath) as Promise<boolean>,
    exists: (path: string): Promise<boolean> =>
      window.electronAPI.invoke('fs:exists', path) as Promise<boolean>,
  },

  java: {
    compile: (payload: { projectPath: string }): Promise<{
      success: boolean
      errors: import('../types/editor.types').JavaError[]
    }> => window.electronAPI.invoke('java:compile', payload) as Promise<any>,
    run: (payload: { projectPath: string; className: string }): Promise<number> =>
      window.electronAPI.invoke('java:run', payload) as Promise<number>,
    stop: (pid: number): Promise<boolean> =>
      window.electronAPI.invoke('java:stop', pid) as Promise<boolean>,
    onStdout: (cb: (data: string) => void) =>
      window.electronAPI.on('java:stdout', (data) => cb(data as string)),
    onStderr: (cb: (data: string) => void) =>
      window.electronAPI.on('java:stderr', (data) => cb(data as string)),
    onExit: (cb: (code: number) => void) =>
      window.electronAPI.on('java:exit', (code) => cb(code as number)),
  },

  ai: {
    stream: (payload: AiStreamPayload): Promise<void> =>
      window.electronAPI.invoke('ai:stream', payload) as Promise<void>,
    onChunk: (cb: (chunk: string) => void) =>
      window.electronAPI.on('ai:stream-chunk', (chunk) => cb(chunk as string)),
    onDone: (cb: () => void) =>
      window.electronAPI.on('ai:stream-done', () => cb()),
    onError: (cb: (error: string) => void) =>
      window.electronAPI.on('ai:stream-error', (error) => cb(error as string)),
    getModels: (provider: 'anthropic' | 'gemini' | 'openai'): Promise<{ id: string; label: string }[]> =>
      window.electronAPI.invoke('ai:getModels', provider) as Promise<{ id: string; label: string }[]>,
    testModels: (provider: 'anthropic' | 'gemini' | 'openai', models: string[]): Promise<Record<string, boolean>> =>
      window.electronAPI.invoke('ai:testModels', { provider, models }) as Promise<Record<string, boolean>>,
    getProviders: (): Promise<{ anthropic: boolean; gemini: boolean; openai: boolean }> =>
      window.electronAPI.invoke('ai:getProviders') as Promise<{ anthropic: boolean; gemini: boolean; openai: boolean }>,
  },

  settings: {
    getApiKey: (): Promise<string | null> =>
      window.electronAPI.invoke('settings:getApiKey') as Promise<string | null>,
    setApiKey: (key: string): Promise<boolean> =>
      window.electronAPI.invoke('settings:setApiKey', key) as Promise<boolean>,
  },

  shell: {
    openExternal: (url: string): Promise<void> =>
      window.electronAPI.invoke('shell:openExternal', url) as Promise<void>,
  },

  auth: {
    onDeepLink: (cb: (url: string) => void) =>
      window.electronAPI.on('auth:deeplink', (url) => cb(url as string)),
  },
}
