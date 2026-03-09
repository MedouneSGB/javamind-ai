/**
 * Gestion des clés API sur web (stockées dans localStorage).
 * Non utilisé en Electron (les clés sont dans .env côté main process).
 */

import type { AiProvider } from '../store/aiStore'

const KEY_MAP: Record<AiProvider, string> = {
  gemini:    'javamind:web:gemini_key',
  anthropic: 'javamind:web:anthropic_key',
  openai:    'javamind:web:openai_key',
}

export function getWebKey(provider: AiProvider): string {
  try { return localStorage.getItem(KEY_MAP[provider]) || '' } catch { return '' }
}

export function setWebKey(provider: AiProvider, key: string): void {
  try {
    if (key.trim()) localStorage.setItem(KEY_MAP[provider], key.trim())
    else localStorage.removeItem(KEY_MAP[provider])
  } catch { /* ignore */ }
}

export function hasWebKey(provider: AiProvider): boolean {
  return !!getWebKey(provider)
}
