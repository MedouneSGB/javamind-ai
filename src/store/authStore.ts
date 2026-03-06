import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import { ipc } from '../lib/ipc'

export interface UserProfile {
  id: string
  username: string | null
  avatar_url: string | null
}

interface AuthStore {
  session: any | null   // Supabase Session
  user: any | null      // Supabase User
  profile: UserProfile | null
  isSyncing: boolean
  authModalOpen: boolean

  setSession: (session: any | null) => void
  setProfile: (profile: UserProfile | null) => void
  setSyncing: (val: boolean) => void
  setAuthModalOpen: (open: boolean) => void
  signInWithGitHub: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  handleDeepLink: (url: string) => Promise<void>
  fetchProfile: () => Promise<void>
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      session: null,
      user: null,
      profile: null,
      isSyncing: false,
      authModalOpen: false,

      setSession: (session) => set({ session, user: session?.user ?? null }),
      setProfile: (profile) => set({ profile }),
      setSyncing: (val) => set({ isSyncing: val }),
      setAuthModalOpen: (open) => set({ authModalOpen: open }),

      signInWithGitHub: async () => {
        if (!supabase) return
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'github',
          options: {
            redirectTo: 'javamind://auth/callback',
            skipBrowserRedirect: true,
          },
        })
        if (error) { console.error('[auth] GitHub error:', error.message); return }
        if (data.url) await ipc.shell.openExternal(data.url)
      },

      signInWithGoogle: async () => {
        if (!supabase) return
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: 'javamind://auth/callback',
            skipBrowserRedirect: true,
          },
        })
        if (error) { console.error('[auth] Google error:', error.message); return }
        if (data.url) await ipc.shell.openExternal(data.url)
      },

      handleDeepLink: async (url: string) => {
        if (!supabase) return
        try {
          // Extract the code from the deep link URL
          // e.g. javamind://auth/callback?code=xxxx&state=yyyy
          const parsed = new URL(url)
          const code = parsed.searchParams.get('code')
          if (!code) return
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) { console.error('[auth] exchange error:', error.message); return }
          set({ session: data.session, user: data.session?.user ?? null })
          await get().fetchProfile()
          set({ authModalOpen: false })
        } catch (err) {
          console.error('[auth] deep link handling error:', err)
        }
      },

      signOut: async () => {
        if (!supabase) return
        await supabase.auth.signOut()
        set({ session: null, user: null, profile: null })
      },

      fetchProfile: async () => {
        if (!supabase) return
        const { user } = get()
        if (!user) return
        const { data } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .eq('id', user.id)
          .single()
        if (data) set({ profile: data as UserProfile })
      },
    }),
    {
      name: 'javamind:auth',
      // Only persist session (not UI state)
      partialize: (state) => ({ session: state.session, user: state.user, profile: state.profile }),
    }
  )
)
