/** True when running inside Electron (contextBridge is available) */
export const isElectron: boolean =
  typeof window !== 'undefined' && 'electronAPI' in window
