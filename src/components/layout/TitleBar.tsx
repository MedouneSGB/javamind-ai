import { ipc } from '../../lib/ipc'
import { isElectron } from '../../lib/platform'
import { useThemeStore } from '../../store/themeStore'
import { useAuthStore } from '../../store/authStore'
import { RotateCcw, Sun, Moon, Minus, Square, X, User } from 'lucide-react'
import { AuthModal } from '../auth/AuthModal'

export function TitleBar() {
  const { theme, toggleTheme } = useThemeStore()
  const { session, user, profile, setAuthModalOpen } = useAuthStore()
  const isDark = theme === 'dark'
  const isLoggedIn = !!session && !!user
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url
  const displayName = profile?.username || user?.user_metadata?.name || user?.email?.split('@')[0]

  return (
    <>
    <AuthModal />
    <div
      style={{
        height: '36px',
        background: 'var(--color-bg-2)',
        borderBottom: '1px solid var(--color-border-2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: '12px',
        paddingRight: '0',
        WebkitAppRegion: 'drag',
        flexShrink: 0,
      } as React.CSSProperties}
    >
      {/* Logo + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Tasse de café — logo JavaMind */}
        <svg width="20" height="20" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
          <rect width="256" height="256" rx="52" fill="#F0E4CC"/>
          <path d="M90 100 Q96 82 90 65" stroke="#7B4F2E" strokeWidth="10" fill="none" strokeLinecap="round"/>
          <path d="M118 100 Q124 82 118 65" stroke="#7B4F2E" strokeWidth="10" fill="none" strokeLinecap="round"/>
          <path d="M146 100 Q152 82 146 65" stroke="#7B4F2E" strokeWidth="10" fill="none" strokeLinecap="round"/>
          <path d="M68 116 L188 116 L176 196 Q172 210 158 210 L98 210 Q84 210 80 196 Z" fill="#7B4F2E"/>
          <path d="M182 130 Q218 130 218 163 Q218 196 182 196" stroke="#7B4F2E" strokeWidth="16" fill="none" strokeLinecap="round"/>
        </svg>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)', letterSpacing: '0.3px' }}>
          JavaMind AI
        </span>
        <span style={{ fontSize: '11px', color: 'var(--color-text-dim)', marginLeft: '2px' }}>
          v0.1
        </span>
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        {/* User account button */}
        <button
          onClick={() => setAuthModalOpen(true)}
          title={isLoggedIn ? displayName || 'Account' : 'Sign in'}
          style={{
            height: '36px', padding: '0 10px',
            background: 'transparent', border: 'none',
            color: isLoggedIn ? 'var(--color-accent)' : 'var(--color-text-dim)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
            fontSize: '11px', transition: 'background 0.1s, color 0.1s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-surface)'; e.currentTarget.style.color = 'var(--color-accent)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = isLoggedIn ? 'var(--color-accent)' : 'var(--color-text-dim)' }}
        >
          {isLoggedIn && avatarUrl ? (
            <img src={avatarUrl} alt="" style={{ width: '16px', height: '16px', borderRadius: '50%' }} />
          ) : (
            <User size={12} />
          )}
          {isLoggedIn && displayName && (
            <span style={{ maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayName}
            </span>
          )}
        </button>

        {/* Refresh (dev) */}
        <button
          onClick={() => window.location.reload()}
          title="Reload app (Ctrl+R)"
          style={{
            width: '46px', height: '36px',
            background: 'transparent', border: 'none',
            color: 'var(--color-text-muted)', fontSize: '15px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.1s, color 0.1s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-surface)'; e.currentTarget.style.color = 'var(--color-accent)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)' }}
        ><RotateCcw size={13}/></button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light theme' : 'Switch to Dark theme'}
          style={{
            width: '46px',
            height: '36px',
            background: 'transparent',
            border: 'none',
            color: 'var(--color-text-muted)',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.1s, color 0.1s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-surface)'
            e.currentTarget.style.color = 'var(--color-accent)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--color-text-muted)'
          }}
        >
          {isDark ? <Sun size={14}/> : <Moon size={14}/>}
        </button>

        {/* Window controls — Electron only */}
        {isElectron && (
          <>
            <WinBtn onClick={() => ipc.window.minimize()} title="Minimize"><Minus size={12}/></WinBtn>
            <WinBtn onClick={() => ipc.window.maximize()} title="Maximize"><Square size={11}/></WinBtn>
            <WinBtn onClick={() => ipc.window.close()} title="Close" isClose><X size={12}/></WinBtn>
          </>
        )}
      </div>
    </div>
    </>
  )
}

function WinBtn({ children, onClick, title, isClose }: {
  children: React.ReactNode
  onClick: () => void
  title: string
  isClose?: boolean
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: '46px',
        height: '36px',
        background: 'transparent',
        border: 'none',
        color: 'var(--color-text-muted)',
        fontSize: '12px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.1s, color 0.1s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = isClose ? 'var(--color-error)' : 'var(--color-surface)'
        e.currentTarget.style.color = 'var(--color-text)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.color = 'var(--color-text-muted)'
      }}
    >
      {children}
    </button>
  )
}
