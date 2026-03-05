import { create } from 'zustand'
import type { AiMode, AiMessage, Challenge, InterviewSession } from '../types/ai.types'

interface AiStore {
  activeMode: AiMode
  isPanelOpen: boolean
  isStreaming: boolean
  chatHistory: AiMessage[]
  currentStreamContent: string
  currentChallenge: Challenge | null
  challengeStartTime: number | null
  interviewSession: InterviewSession | null
  aiModel: 'claude-sonnet-4-6' | 'claude-opus-4-6'

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
  setAiModel: (model: 'claude-sonnet-4-6' | 'claude-opus-4-6') => void
  clearChatHistory: () => void
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
  aiModel: 'claude-sonnet-4-6',

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

  setAiModel: (model) => set({ aiModel: model }),

  clearChatHistory: () => set({ chatHistory: [] }),
}))
