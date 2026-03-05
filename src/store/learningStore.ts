import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserLevel } from '../types/learning.types'
import type { ChallengeResult } from '../types/ai.types'

interface LearningStore {
  userLevel: UserLevel
  masteredConcepts: string[]
  currentTopic: string | null
  challengeHistory: ChallengeResult[]
  dailyStreak: number
  lastActiveDate: string
  kataCompletedToday: boolean

  setUserLevel: (level: UserLevel) => void
  markConceptMastered: (conceptId: string) => void
  setCurrentTopic: (conceptId: string | null) => void
  recordChallengeResult: (result: ChallengeResult) => void
  updateStreak: () => void
  markKataCompleted: () => void
  getTotalScore: () => number
}

export const useLearningStore = create<LearningStore>()(
  persist(
    (set, get) => ({
      userLevel: 'beginner',
      masteredConcepts: [],
      currentTopic: null,
      challengeHistory: [],
      dailyStreak: 0,
      lastActiveDate: '',
      kataCompletedToday: false,

      setUserLevel: (level) => set({ userLevel: level }),

      markConceptMastered: (conceptId) =>
        set(state => ({
          masteredConcepts: state.masteredConcepts.includes(conceptId)
            ? state.masteredConcepts
            : [...state.masteredConcepts, conceptId],
        })),

      setCurrentTopic: (conceptId) => set({ currentTopic: conceptId }),

      recordChallengeResult: (result) =>
        set(state => ({
          challengeHistory: [...state.challengeHistory, result],
        })),

      updateStreak: () => {
        const today = new Date().toISOString().split('T')[0]
        const { lastActiveDate, dailyStreak } = get()
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

        if (lastActiveDate === today) return
        if (lastActiveDate === yesterday) {
          set({ dailyStreak: dailyStreak + 1, lastActiveDate: today, kataCompletedToday: false })
        } else {
          set({ dailyStreak: 1, lastActiveDate: today, kataCompletedToday: false })
        }
      },

      markKataCompleted: () => set({ kataCompletedToday: true }),

      getTotalScore: () => {
        const { challengeHistory } = get()
        return challengeHistory.reduce((sum, r) => sum + r.score, 0)
      },
    }),
    { name: 'learning-store' }
  )
)
