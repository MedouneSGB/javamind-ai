export type AiMode = 'chat' | 'tutor' | 'review' | 'challenge' | 'duck' | 'interview' | 'story'

export interface AiMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  mode: AiMode
}

export interface Challenge {
  title: string
  description: string
  requirements: string[]
  examples: string[]
  hints: string[]
  topic: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export interface ChallengeResult {
  id: string
  challenge: Challenge
  userCode: string
  score: number
  feedback: string
  timestamp: number
}

export interface InterviewSession {
  id: string
  level: 'junior' | 'mid' | 'senior'
  topics: string[]
  messages: AiMessage[]
  score: number
  isActive: boolean
}

export interface AiStreamPayload {
  systemPrompt: string
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
  model?: string
  provider?: 'anthropic' | 'gemini' | 'openai'
}
