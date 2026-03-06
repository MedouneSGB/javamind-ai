import { useEffect, useRef } from 'react'
import { useAuthStore } from '../store/authStore'
import { useLearningStore } from '../store/learningStore'
import { useRecentProjectsStore } from '../store/recentProjectsStore'
import { useThemeStore } from '../store/themeStore'
import { useLangStore } from '../store/langStore'
import { useAiStore } from '../store/aiStore'
import { pushToSupabase } from '../lib/sync'

const DEBOUNCE_MS = 3000

// Subscribe to store changes and debounce-push to Supabase when user is logged in
export function useSyncOnChange() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const schedulePush = () => {
    const { user } = useAuthStore.getState()
    if (!user) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      pushToSupabase()
    }, DEBOUNCE_MS)
  }

  useEffect(() => {
    const unsubs = [
      useLearningStore.subscribe(schedulePush),
      useRecentProjectsStore.subscribe(schedulePush),
      useThemeStore.subscribe(schedulePush),
      useLangStore.subscribe(schedulePush),
      useAiStore.subscribe(schedulePush),
    ]
    return () => {
      unsubs.forEach(u => u())
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])
}
