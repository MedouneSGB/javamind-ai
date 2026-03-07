import { supabase } from './supabase'
import { useAuthStore } from '../store/authStore'
import { useLearningStore } from '../store/learningStore'
import { useRecentProjectsStore } from '../store/recentProjectsStore'
import { useThemeStore } from '../store/themeStore'
import { useLangStore } from '../store/langStore'
import { useAiStore } from '../store/aiStore'

// Maximum number of chat messages to sync per session
const MAX_SYNCED_MESSAGES = 100

// Pull all user data from Supabase and hydrate local stores
export async function pullFromSupabase(): Promise<void> {
  if (!supabase) return
  const { user } = useAuthStore.getState()
  if (!user) return

  const userId = user.id

  // Pull learning progress
  const { data: lp } = await supabase
    .from('learning_progress')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (lp) {
    const ls = useLearningStore.getState()
    if (lp.mastered_concepts) ls.setMasteredConcepts(lp.mastered_concepts)
    if (lp.challenge_history) ls.setChallengeHistory(lp.challenge_history)
    if (lp.user_level) ls.setUserLevel(lp.user_level)
    if (lp.current_topic !== undefined) ls.setCurrentTopic(lp.current_topic)
  }

  // Pull preferences
  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (prefs) {
    if (prefs.theme) useThemeStore.getState().setTheme(prefs.theme)
    if (prefs.lang) useLangStore.getState().setLang(prefs.lang)
    if (prefs.ai_provider) useAiStore.getState().setAiProvider(prefs.ai_provider)
    if (prefs.ai_model) useAiStore.getState().setAiModel(prefs.ai_model)
  }

  // Pull AI chat session
  const { data: aiSession } = await supabase
    .from('ai_sessions')
    .select('chat_history, active_mode')
    .eq('user_id', userId)
    .single()

  if (aiSession) {
    const ai = useAiStore.getState()
    if (Array.isArray(aiSession.chat_history) && aiSession.chat_history.length > 0) {
      ai.setChatHistory(aiSession.chat_history)
    }
    if (aiSession.active_mode) {
      ai.setActiveMode(aiSession.active_mode)
    }
  }

  // Pull recent projects
  const { data: recents } = await supabase
    .from('recent_projects')
    .select('path, name, last_opened_at')
    .eq('user_id', userId)
    .order('last_opened_at', { ascending: false })
    .limit(5)

  if (recents) {
    useRecentProjectsStore.getState().setProjects(
      recents.map((r: any) => ({
        path: r.path,
        name: r.name,
        lastOpenedAt: new Date(r.last_opened_at).getTime(),
      }))
    )
  }
}

// Push all user data from local stores to Supabase
export async function pushToSupabase(): Promise<void> {
  if (!supabase) return
  const { user, setSyncing } = useAuthStore.getState()
  if (!user) return

  setSyncing(true)
  const userId = user.id

  try {
    const ls = useLearningStore.getState()
    const theme = useThemeStore.getState().theme
    const lang = useLangStore.getState().lang
    const ai = useAiStore.getState()
    const recents = useRecentProjectsStore.getState().projects

    // Upsert AI chat session (keep last MAX_SYNCED_MESSAGES messages)
    const chatHistoryToSync = ai.chatHistory.slice(-MAX_SYNCED_MESSAGES)
    await supabase.from('ai_sessions').upsert({
      user_id: userId,
      chat_history: chatHistoryToSync,
      active_mode: ai.activeMode,
      updated_at: new Date().toISOString(),
    })

    // Upsert learning progress
    await supabase.from('learning_progress').upsert({
      user_id: userId,
      user_level: ls.userLevel,
      mastered_concepts: ls.masteredConcepts,
      current_topic: ls.currentTopic,
      challenge_history: ls.challengeHistory,
      daily_streak: ls.dailyStreak,
      last_active_date: ls.lastActiveDate,
      kata_completed_today: ls.kataCompletedToday,
      updated_at: new Date().toISOString(),
    })

    // Upsert preferences
    await supabase.from('user_preferences').upsert({
      user_id: userId,
      theme,
      lang,
      ai_provider: ai.aiProvider,
      ai_model: ai.aiModel,
      updated_at: new Date().toISOString(),
    })

    // Upsert recent projects
    for (const project of recents) {
      await supabase.from('recent_projects').upsert(
        {
          user_id: userId,
          path: project.path,
          name: project.name,
          last_opened_at: new Date(project.lastOpenedAt).toISOString(),
        },
        { onConflict: 'user_id,path' }
      )
    }
  } catch (err) {
    console.error('[sync] pushToSupabase error:', err)
  } finally {
    setSyncing(false)
  }
}
