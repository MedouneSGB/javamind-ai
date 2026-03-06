import { create } from 'zustand'
import type { AiMode, AiMessage, Challenge, InterviewSession } from '../types/ai.types'

export type AiProvider = 'anthropic' | 'gemini' | 'openai'

export interface ModelEntry {
  id: string
  label: string
}

interface ModelCache {
  models: ModelEntry[]
  status: Record<string, boolean | null>
  fetchedAt: number // timestamp
}

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes before refreshing

// localStorage keys
const LS_PROVIDER = 'javamind:aiProvider'
const LS_MODEL = 'javamind:aiModel'
const LS_MODEL_CACHE = 'javamind:modelCache'

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw) as T
  } catch { /* ignore */ }
  return fallback
}

function saveToStorage(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* ignore */ }
}

interface AiStore {
  activeMode: AiMode
  isPanelOpen: boolean
  isStreaming: boolean
  chatHistory: AiMessage[]
  currentStreamContent: string
  currentChallenge: Challenge | null
  challengeStartTime: number | null
  interviewSession: InterviewSession | null

  // Persisted
  aiModel: string
  aiProvider: AiProvider

  // Model cache per provider (not persisted between restarts — refreshes after TTL)
  modelCache: Partial<Record<AiProvider, ModelCache>>

  setMode: (mode: AiMode) => void
  togglePanel: () => void
  setPanelOpen: (open: boolean) => void
  addMessage: (msg: Omit<AiMessage, 'id' | 'timestamp'>) => void
  startStream: () => void
  appendStreamChunk: (chunk: string) => void
  endStream: () => string
  setChallenge: (challenge: Challenge | null) => void
  startChallenge: (challenge: Challenge) => void
  setInterviewSession: (session: InterviewSession | null) => void
  setAiModel: (model: string) => void
  setAiProvider: (provider: AiProvider) => void
  clearChatHistory: () => void

  // Cache helpers
  getModelCache: (provider: AiProvider) => ModelCache | null
  setModelCache: (provider: AiProvider, models: ModelEntry[], status?: Record<string, boolean | null>) => void
  updateModelStatus: (provider: AiProvider, status: Record<string, boolean>) => void
  isCacheValid: (provider: AiProvider) => boolean
}

export const useAiStore = create<AiStore>()((set, get) => ({
  activeMode: 'chat',
  isPanelOpen: true,
  isStreaming: false,
  chatHistory: [],
  currentStreamContent: '',
  currentChallenge: null,
  challengeStartTime: null,
  interviewSession: null,

  // Restore from localStorage
  aiProvider: loadFromStorage<AiProvider>(LS_PROVIDER, 'gemini'),
  aiModel: loadFromStorage<string>(LS_MODEL, 'gemini-2.0-flash'),

  // Restore model cache from localStorage (survives page reload, not app restart)
  modelCache: loadFromStorage<Partial<Record<AiProvider, ModelCache>>>(LS_MODEL_CACHE, {}),

  setMode: (mode) => set({ activeMode: mode }),
  togglePanel: () => set(state => ({ isPanelOpen: !state.isPanelOpen })),
  setPanelOpen: (open) => set({ isPanelOpen: open }),

  addMessage: (msg) => {
    const message: AiMessage = {
      ...msg,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    }
    set(state => ({ chatHistory: [...state.chatHistory, message] }))
  },

  startStream: () => set({ isStreaming: true, currentStreamContent: '' }),

  appendStreamChunk: (chunk) =>
    set(state => ({ currentStreamContent: state.currentStreamContent + chunk })),

  endStream: () => {
    const content = get().currentStreamContent
    set({ isStreaming: false, currentStreamContent: '' })
    return content
  },

  setChallenge: (challenge) => set({ currentChallenge: challenge }),

  startChallenge: (challenge) =>
    set({ currentChallenge: challenge, challengeStartTime: Date.now() }),

  setInterviewSession: (session) => set({ interviewSession: session }),

  setAiModel: (model) => {
    saveToStorage(LS_MODEL, model)
    set({ aiModel: model })
  },

  setAiProvider: (provider) => {
    saveToStorage(LS_PROVIDER, provider)
    set({ aiProvider: provider })
  },

  clearChatHistory: () => set({ chatHistory: [] }),

  // Cache helpers
  getModelCache: (provider) => get().modelCache[provider] ?? null,

  setModelCache: (provider, models, status = {}) => {
    const pending: Record<string, boolean | null> = {}
    models.forEach(m => { pending[m.id] = status[m.id] ?? null })
    const cache: ModelCache = { models, status: pending, fetchedAt: Date.now() }
    const modelCache = { ...get().modelCache, [provider]: cache }
    saveToStorage(LS_MODEL_CACHE, modelCache)
    set({ modelCache })
  },

  updateModelStatus: (provider, status) => {
    const existing = get().modelCache[provider]
    if (!existing) return
    const updated: ModelCache = { ...existing, status: { ...existing.status, ...status } }
    const modelCache = { ...get().modelCache, [provider]: updated }
    saveToStorage(LS_MODEL_CACHE, modelCache)
    set({ modelCache })
  },

  isCacheValid: (provider) => {
    const cache = get().modelCache[provider]
    if (!cache || cache.models.length === 0) return false
    return Date.now() - cache.fetchedAt < CACHE_TTL
  },
}))
