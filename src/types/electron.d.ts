export interface ElectronAPI {
  invoke: (channel: string, ...args: unknown[]) => Promise<unknown>
  on: (channel: string, callback: (...args: unknown[]) => void) => () => void
  once: (channel: string, callback: (...args: unknown[]) => void) => void
  off: (channel: string, callback: (...args: unknown[]) => void) => void
  window: {
    minimize: () => void
    maximize: () => void
    close: () => void
  }
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
