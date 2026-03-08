import type { AiStreamPayload } from '../types/ai.types'
import { isElectron } from './platform'

// Helpers
function invoke(channel: string, ...args: unknown[]): Promise<unknown> {
  if (!isElectron) return Promise.reject(new Error(`web:not-available:${channel}`))
  return window.electronAPI!.invoke(channel, ...args)
}

function listen(channel: string, cb: (...args: unknown[]) => void): () => void {
  if (!isElectron) return () => {}
  return window.electronAPI!.on(channel, cb)
}

// Type-safe IPC wrapper — gracefully stubs when running in a browser (no Electron)
export const ipc = {
  window: {
    minimize: () => { if (isElectron) window.electronAPI!.window.minimize() },
    maximize: () => { if (isElectron) window.electronAPI!.window.maximize() },
    close:    () => { if (isElectron) window.electronAPI!.window.close() },
  },

  fs: {
    openProject: (): Promise<string | null> =>
      isElectron ? invoke('fs:openProject') as Promise<string | null> : Promise.resolve(null),
    openFile: (): Promise<string | null> =>
      isElectron ? invoke('fs:openFile') as Promise<string | null> : Promise.resolve(null),
    readFile:  (path: string): Promise<string> =>
      invoke('fs:readFile', path) as Promise<string>,
    writeFile: (path: string, content: string): Promise<boolean> =>
      invoke('fs:writeFile', path, content) as Promise<boolean>,
    readDir:   (path: string): Promise<import('../types/editor.types').FileTreeNode> =>
      invoke('fs:readDir', path) as Promise<import('../types/editor.types').FileTreeNode>,
    createFile: (path: string): Promise<boolean> =>
      invoke('fs:createFile', path) as Promise<boolean>,
    createDir: (path: string): Promise<boolean> =>
      invoke('fs:createDir', path) as Promise<boolean>,
    deleteFile: (path: string): Promise<boolean> =>
      invoke('fs:deleteFile', path) as Promise<boolean>,
    rename: (oldPath: string, newPath: string): Promise<boolean> =>
      invoke('fs:rename', oldPath, newPath) as Promise<boolean>,
    exists: (path: string): Promise<boolean> =>
      isElectron ? invoke('fs:exists', path) as Promise<boolean> : Promise.resolve(false),
  },

  java: {
    compile: (payload: { projectPath: string }): Promise<{
      success: boolean
      errors: import('../types/editor.types').JavaError[]
    }> =>
      isElectron
        ? invoke('java:compile', payload) as Promise<any>
        : Promise.resolve({ success: false, errors: [] }),
    run: (payload: { projectPath: string; className: string }): Promise<number> =>
      isElectron ? invoke('java:run', payload) as Promise<number> : Promise.resolve(-1),
    stop: (pid: number): Promise<boolean> =>
      isElectron ? invoke('java:stop', pid) as Promise<boolean> : Promise.resolve(false),
    onStdout: (cb: (data: string) => void) => listen('java:stdout', (d) => cb(d as string)),
    onStderr: (cb: (data: string) => void) => listen('java:stderr', (d) => cb(d as string)),
    onExit:   (cb: (code: number) => void) => listen('java:exit',   (c) => cb(c as number)),
  },

  ai: {
    stream: (payload: AiStreamPayload): Promise<void> =>
      invoke('ai:stream', payload) as Promise<void>,
    onChunk: (cb: (chunk: string) => void) =>
      listen('ai:stream-chunk', (c) => cb(c as string)),
    onDone:  (cb: () => void) =>
      listen('ai:stream-done', () => cb()),
    onError: (cb: (error: string) => void) =>
      listen('ai:stream-error', (e) => cb(e as string)),
    getModels: (provider: 'anthropic' | 'gemini' | 'openai'): Promise<{ id: string; label: string }[]> =>
      isElectron
        ? invoke('ai:getModels', provider) as Promise<{ id: string; label: string }[]>
        : Promise.resolve([]),
    testModels: (provider: 'anthropic' | 'gemini' | 'openai', models: string[]): Promise<Record<string, boolean>> =>
      isElectron
        ? invoke('ai:testModels', { provider, models }) as Promise<Record<string, boolean>>
        : Promise.resolve({}),
    getProviders: (): Promise<{ anthropic: boolean; gemini: boolean; openai: boolean }> =>
      isElectron
        ? invoke('ai:getProviders') as Promise<{ anthropic: boolean; gemini: boolean; openai: boolean }>
        : Promise.resolve({ anthropic: false, gemini: false, openai: false }),
  },

  settings: {
    getApiKey: (): Promise<string | null> =>
      isElectron ? invoke('settings:getApiKey') as Promise<string | null> : Promise.resolve(null),
    setApiKey: (key: string): Promise<boolean> =>
      isElectron ? invoke('settings:setApiKey', key) as Promise<boolean> : Promise.resolve(false),
  },

  shell: {
    openExternal: (url: string): Promise<void> => {
      if (!isElectron) { window.open(url, '_blank'); return Promise.resolve() }
      return invoke('shell:openExternal', url) as Promise<void>
    },
  },

  auth: {
    onDeepLink: (cb: (url: string) => void) =>
      listen('auth:deeplink', (url) => cb(url as string)),
    openOAuthWindow: async (url: string): Promise<void> => {
      if (!isElectron) { window.location.href = url; return }
      return invoke('auth:openOAuthWindow', url) as Promise<void>
    },
  },
}
