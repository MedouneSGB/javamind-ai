import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { supabase } from '../../lib/supabase'
import { pushToSupabase } from '../../lib/sync'
import { Github, Chrome, LogOut, Loader2, X, CloudOff, AlertCircle } from 'lucide-react'
import { useLangStore } from '../../store/langStore'
import { ipc } from '../../lib/ipc'

export function AuthModal() {
  const { authModalOpen, setAuthModalOpen, session, user, profile, isSyncing, signOut } = useAuthStore()
  const { t } = useLangStore()

  if (!authModalOpen) return null

  const isLoggedIn = !!session && !!user

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={() => setAuthModalOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '340px',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
          padding: '24px',
          position: 'relative',
        }}
      >
        <button
          onClick={() => setAuthModalOpen(false)}
          style={{
            position: 'absolute', top: '12px', right: '12px',
            background: 'transparent', border: 'none',
            color: 'var(--color-text-dim)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '4px',
          }}
        >
          <X size={14} />
        </button>

        {isLoggedIn
          ? <ProfileView
              user={user}
              profile={profile}
              isSyncing={isSyncing}
              onSignOut={async () => { await signOut(); setAuthModalOpen(false) }}
              onSyncNow={() => pushToSupabase()}
              t={t}
            />
          : <LoginView t={t} />
        }
      </div>
    </div>
  )
}

function LoginView({ t }: { t: (k: string) => string }) {
  const [loading, setLoading] = useState<'github' | 'google' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const hasSupabase = !!supabase

  const handleOAuth = async (provider: 'github' | 'google') => {
    if (!supabase) return
    setError(null)
    setLoading(provider)
    try {
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: 'javamind://auth/callback',
          skipBrowserRedirect: true,
        },
      })
      if (oauthError) {
        setError(oauthError.message)
        return
      }
      if (!data.url) {
        setError('No OAuth URL returned. Check Supabase provider configuration.')
        return
      }
      await ipc.shell.openExternal(data.url)
      // Reset loading — browser is now open, waiting for deep link callback
      setLoading(null)
    } catch (err: any) {
      setError(err?.message ?? 'Unknown error')
      setLoading(null)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '4px' }}>
          {t('authSignIn')}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--color-text-dim)', lineHeight: 1.5 }}>
          {t('authSignInDesc')}
        </div>
      </div>

      {!hasSupabase ? (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px', background: 'var(--color-surface-2)',
          borderRadius: '8px', border: '1px solid var(--color-border)',
        }}>
          <CloudOff size={14} style={{ color: 'var(--color-text-dim)', flexShrink: 0 }} />
          <span style={{ fontSize: '12px', color: 'var(--color-text-dim)' }}>{t('authNoSupabase')}</span>
        </div>
      ) : (
        <>
          <OAuthBtn
            onClick={() => handleOAuth('github')}
            icon={loading === 'github' ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Github size={15} />}
            label="GitHub"
            disabled={!!loading}
          />
          <OAuthBtn
            onClick={() => handleOAuth('google')}
            icon={loading === 'google' ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Chrome size={15} />}
            label="Google"
            disabled={!!loading}
          />
        </>
      )}

      {error && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '8px',
          padding: '10px', background: '#ff444411',
          borderRadius: '8px', border: '1px solid #ff444444',
        }}>
          <AlertCircle size={13} style={{ color: 'var(--color-error)', flexShrink: 0, marginTop: '1px' }} />
          <span style={{ fontSize: '11px', color: 'var(--color-error)', lineHeight: 1.4 }}>{error}</span>
        </div>
      )}

      {loading && (
        <div style={{ fontSize: '11px', color: 'var(--color-text-dim)', textAlign: 'center' }}>
          Navigateur ouvert — connectez-vous puis revenez ici...
        </div>
      )}
    </div>
  )
}

function ProfileView({ user, profile, isSyncing, onSignOut, onSyncNow, t }: {
  user: any; profile: any; isSyncing: boolean
  onSignOut: () => void; onSyncNow: () => void; t: (k: string) => string
}) {
  const displayName = profile?.username || user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {avatarUrl ? (
          <img src={avatarUrl} alt={displayName}
            style={{ width: '42px', height: '42px', borderRadius: '50%', border: '2px solid var(--color-accent)' }} />
        ) : (
          <div style={{
            width: '42px', height: '42px', borderRadius: '50%',
            background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', fontWeight: 700, color: '#0d0d0d',
          }}>
            {displayName[0].toUpperCase()}
          </div>
        )}
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text)' }}>{displayName}</div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-dim)' }}>{user?.email}</div>
        </div>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px', background: 'var(--color-surface-2)',
        borderRadius: '8px', border: '1px solid var(--color-border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isSyncing
            ? <Loader2 size={12} style={{ color: 'var(--color-accent)', animation: 'spin 1s linear infinite' }} />
            : <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success)' }} />
          }
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            {isSyncing ? t('authSyncing') : t('authSynced')}
          </span>
        </div>
        <button onClick={onSyncNow} disabled={isSyncing} style={{
          background: 'transparent', border: 'none',
          fontSize: '11px', color: 'var(--color-accent)',
          cursor: isSyncing ? 'not-allowed' : 'pointer', opacity: isSyncing ? 0.5 : 1,
        }}>
          {t('authSyncNow')}
        </button>
      </div>

      <button onClick={onSignOut} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
        height: '34px', background: 'transparent',
        border: '1px solid var(--color-border)', borderRadius: '7px',
        color: 'var(--color-text-dim)', fontSize: '12px', cursor: 'pointer', transition: 'all 0.1s',
      }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-error)'; e.currentTarget.style.color = 'var(--color-error)' }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-dim)' }}
      >
        <LogOut size={12} /> {t('authSignOut')}
      </button>
    </div>
  )
}

function OAuthBtn({ onClick, icon, label, disabled }: {
  onClick: () => void; icon: React.ReactNode; label: string; disabled?: boolean
}) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
      height: '38px', width: '100%',
      background: 'var(--color-surface-2)',
      border: '1px solid var(--color-border)',
      borderRadius: '8px',
      color: 'var(--color-text-muted)',
      fontSize: '13px', fontWeight: 500,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.6 : 1,
      transition: 'all 0.1s',
    }}
      onMouseEnter={(e) => { if (!disabled) { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.color = 'var(--color-text)' } }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-muted)' }}
    >
      {icon} {label}
    </button>
  )
}
