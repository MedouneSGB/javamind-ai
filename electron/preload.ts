import { contextBridge, ipcRenderer } from 'electron'

const electronAPI = {
  // Generic invoke
  invoke: (channel: string, ...args: unknown[]) => ipcRenderer.invoke(channel, ...args),

  // Generic event listeners
  on: (channel: string, callback: (...args: unknown[]) => void) => {
    const subscription = (_event: Electron.IpcRendererEvent, ...args: unknown[]) => callback(...args)
    ipcRenderer.on(channel, subscription)
    return () => ipcRenderer.removeListener(channel, subscription)
  },

  // One-time listener
  once: (channel: string, callback: (...args: unknown[]) => void) => {
    ipcRenderer.once(channel, (_event, ...args) => callback(...args))
  },

  // Remove listener
  off: (channel: string, callback: (...args: unknown[]) => void) => {
    ipcRenderer.removeListener(channel, callback as any)
  },

  // Window controls
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
  },
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

// Type declaration for renderer
export type ElectronAPI = typeof electronAPI
