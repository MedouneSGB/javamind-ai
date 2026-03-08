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
        // Web : flow implicite → tokens dans le hash (#access_token=…), pas de PKCE
        // Évite la boucle provoquée par l'échange de code PKCE + rechargement de page
        // Electron : PKCE géré manuellement via handleDeepLink (exchangeCodeForSession)
        flowType: isElectron ? 'pkce' : 'implicit',
      },
    })
  : null

export type { Session, User } from '@supabase/supabase-js'
