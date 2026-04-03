import { useState, useEffect } from 'react'
import { AppShell } from '../layout/AppShell'
import { LandingPage } from './LandingPage'
import { LoginPage } from './LoginPage'
import { AdminPage, isAdminUser } from './AdminPage'
import { useAuthStore } from '../../store/authStore'
import { supabase } from '../../lib/supabase'

type Page = 'landing' | 'login' | 'admin' | 'callback'

function getPageFromPath(path: string): Page {
  if (path === '/admin') return 'admin'
  if (path === '/login') return 'login'
  if (path === '/auth/callback') return 'callback'
  return 'landing'
}

/**
 * Web-only router: Landing → Login → App (or /admin for admins)
 * Electron bypasses this entirely (see App.tsx).
 *
 * OAuth callback flow:
 *   1. User clicks login → sessionStorage saves current path → redirect to provider
 *   2. Provider redirects to /auth/callback (must be in Supabase Allowed Redirect URLs)
 *   3. Supabase SDK (detectSessionInUrl: true) auto-exchanges the code/token
 *   4. onAuthStateChange fires SIGNED_IN → session updated
 *   5. We restore the pre-auth path from sessionStorage
 */
export function WebApp() {
  const { session, user, setSession, fetchProfile } = useAuthStore()
  const [page, setPage] = useState<Page>(() => getPageFromPath(window.location.pathname))
  // true while we verify the persisted session against Supabase
  const [checking, setChecking] = useState(true)

  const navigateTo = (path: string, replace = false) => {
    const method = replace ? 'replaceState' : 'pushState'
    window.history[method]({}, '', path)
    setPage(getPageFromPath(path))
  }

  useEffect(() => {
    const handlePopState = () => setPage(getPageFromPath(window.location.pathname))
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // On mount: validate persisted session (avoids using stale localStorage session)
  useEffect(() => {
    if (!supabase) { setChecking(false); return }
    supabase.auth.getSession().then(({ data: { session: current } }) => {
      if (current) {
        setSession(current)
        if (!session) fetchProfile()
      } else {
        setSession(null)
      }
      setChecking(false)
    }).catch(() => setChecking(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auth state listener — handles OAuth redirect back to the page
  useEffect(() => {
    if (!supabase) return
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setSession(newSession)
        if (event === 'SIGNED_IN') fetchProfile()
      } else if (event === 'SIGNED_OUT') {
        setSession(null)
      }
    })
    return () => subscription.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (checking) return <Splash />

  // ── OAuth callback route (/auth/callback) ──────────────────────────────────
  // Supabase SDK automatically detects and exchanges the token/code in the URL.
  // Once done, session is set via onAuthStateChange → re-render handles routing.
  if (page === 'callback') {
    if (session) {
      // Restore pre-auth path (e.g. '/admin') saved before the OAuth redirect
      const from = sessionStorage.getItem('auth_redirect_from') || '/'
      sessionStorage.removeItem('auth_redirect_from')
      // Update browser URL without reload
      navigateTo(from, true)
      const target = getPageFromPath(from)
      setPage(target)
      // Render immediately based on resolved target
      if (target === 'admin') {
        if (isAdminUser(user?.email)) return <AdminPage onBack={() => navigateTo('/')} />
        return <AppShell />
      }
      return <AppShell />
    }
    // Session not ready yet — show splash while Supabase processes the callback
    return <Splash />
  }

  // ── Admin route (/admin) ───────────────────────────────────────────────────
  if (page === 'admin') {
    if (!session) {
      // Not logged in → login first, will redirect back to admin after auth
      return <LoginPage onBack={() => navigateTo('/')} />
    }
    if (isAdminUser(user?.email)) {
      return <AdminPage onBack={() => navigateTo('/')} />
    }
    // Logged in but not admin → app
    return <AppShell />
  }

  // ── Standard routes ────────────────────────────────────────────────────────
  if (session) return <AppShell />
  if (page === 'login') return <LoginPage onBack={() => navigateTo('/')} />
  return <LandingPage onGetStarted={() => navigateTo('/login')} />
}

function Splash() {
  return (
    <div style={{
      height: '100%',
      background: 'var(--color-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      color: 'var(--color-text-muted)',
      fontSize: '13px',
    }}>
      <img src="/logo.png" alt="" style={{ width: 24, height: 24, opacity: 0.7 }} />
      JavaMind AI
    </div>
  )
}
