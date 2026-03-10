/**
 * Gestion des clés API sur web (stockées dans localStorage).
 * Non utilisé en Electron (les clés sont dans .env côté main process).
 */

import type { AiProvider } from '../store/aiStore'

const KEY_MAP: Record<AiProvider, string> = {
  gemini:    'javamind:web:gemini_key',
  anthropic: 'javamind:web:anthropic_key',
  openai:    'javamind:web:openai_key',
  // Pour Ollama, on stocke l'URL du serveur (pas une clé API)
  ollama:    'javamind:web:ollama_url',
}

// Clés injectées par Vite depuis .env (fallback quand localStorage est vide)
const ENV_KEYS: Record<AiProvider, string> = {
  anthropic: import.meta.env.VITE_ANTHROPIC_API_KEY ?? '',
  gemini:    import.meta.env.VITE_GEMINI_API_KEY    ?? '',
  openai:    import.meta.env.VITE_OPENAI_API_KEY    ?? '',
  // URL Ollama — fallback sur le serveur déployé si aucune config
  ollama:    import.meta.env.VITE_OLLAMA_URL || 'https://ollama-java-424719194394.europe-west1.run.app',
}

export function getWebKey(provider: AiProvider): string {
  try {
    return localStorage.getItem(KEY_MAP[provider]) || ENV_KEYS[provider] || ''
  } catch { return ENV_KEYS[provider] || '' }
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
