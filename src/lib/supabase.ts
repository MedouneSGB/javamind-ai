import { createClient } from '@supabase/supabase-js'
import { isElectron } from './platform'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        // Electron: deep links gérés manuellement via ipc.auth.onDeepLink
        // Navigateur: Supabase doit lire les tokens depuis l'URL après redirect OAuth
        detectSessionInUrl: !isElectron,
        autoRefreshToken: true,
      },
    })
  : null

export type { Session, User } from '@supabase/supabase-js'
