import { useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import { supabase } from '../../lib/supabase'

interface LoginPageProps {
  onBack: () => void
}

export function LoginPage({ onBack }: LoginPageProps) {
  const { signInWithGitHub, signInWithGoogle } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const isDark = theme === 'dark'
  const [loading, setLoading] = useState<'github' | 'google' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGitHub = async () => {
    setLoading('github')
    setError(null)
    try { await signInWithGitHub() }
    catch (e: any) { setError(e.message || 'Erreur de connexion'); setLoading(null) }
  }

  const handleGoogle = async () => {
    setLoading('google')
    setError(null)
    try { await signInWithGoogle() }
    catch (e: any) { setError(e.message || 'Erreur de connexion'); setLoading(null) }
  }

  return (
    <div style={{
      height: '100%',
      background: 'var(--color-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
    }}>
      <button
        onClick={toggleTheme}
        title={isDark ? 'Mode clair' : 'Mode sombre'}
        style={{
          position: 'absolute', top: '16px', right: '16px',
          width: '32px', height: '32px',
          background: 'transparent',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          color: 'var(--color-text-muted)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.color = 'var(--color-accent)' }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-muted)' }}
      >
        {isDark ? <Sun size={14} /> : <Moon size={14} />}
      </button>
      <div style={{
        width: '100%',
        maxWidth: '360px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '32px',
      }}>

        {/* Logo + title */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
          <img src="/logo.png" alt="JavaMind" style={{ width: 52, height: 52 }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text)' }}>
              JavaMind <span style={{ color: 'var(--color-accent)' }}>AI</span>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '5px' }}>
              Connectez-vous pour continuer
            </div>
          </div>
        </div>

        {/* OAuth buttons */}
        {!supabase ? (
          <div style={{
            padding: '12px 16px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '10px',
            fontSize: '13px',
            color: 'var(--color-text-muted)',
            textAlign: 'center',
          }}>
            Auth non configurée (Supabase manquant)
          </div>
        ) : (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <OAuthButton
              onClick={handleGitHub}
              loading={loading === 'github'}
              disabled={!!loading}
              icon={<GithubIcon />}
              label="Continuer avec GitHub"
            />
            <OAuthButton
              onClick={handleGoogle}
              loading={loading === 'google'}
              disabled={!!loading}
              icon={<GoogleIcon />}
              label="Continuer avec Google"
            />
          </div>
        )}

        {/* Loading hint */}
        {loading && (
          <p style={{
            margin: 0,
            fontSize: '12px',
            color: 'var(--color-text-muted)',
            textAlign: 'center',
          }}>
            Connectez-vous dans la fenêtre qui s'est ouverte…
          </p>
        )}

        {/* Error */}
        {error && (
          <div style={{
            width: '100%',
            padding: '10px 14px',
            background: 'rgba(192,57,43,0.1)',
            border: '1px solid rgba(192,57,43,0.3)',
            borderRadius: '8px',
            fontSize: '12px',
            color: 'var(--color-error)',
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Back */}
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-muted)',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: 0,
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)' }}
        >
          ← Retour
        </button>
      </div>
    </div>
  )
}

// ── OAuth button ──────────────────────────────────────────────────────────────

interface OAuthButtonProps {
  onClick: () => void
  loading: boolean
  disabled: boolean
  icon: React.ReactNode
  label: string
}

function OAuthButton({ onClick, loading, disabled, icon, label }: OAuthButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '13px 18px',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '10px',
        color: 'var(--color-text)',
        fontSize: '14px',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        transition: 'all 0.15s',
        opacity: disabled && !loading ? 0.5 : 1,
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.borderColor = 'var(--color-accent)' }}
      onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.borderColor = 'var(--color-border)' }}
    >
      <span style={{ width: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {loading
          ? <Spinner />
          : icon
        }
      </span>
      {label}
    </button>
  )
}

function Spinner() {
  return (
    <span style={{
      width: '16px', height: '16px',
      border: '2px solid var(--color-border)',
      borderTopColor: 'var(--color-accent)',
      borderRadius: '50%',
      display: 'inline-block',
      animation: 'spin 0.8s linear infinite',
    }} />
  )
}

function GithubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}
