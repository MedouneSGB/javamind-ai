import { ipc } from '../../lib/ipc'
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
        <div style={{
          width: '18px', height: '18px',
          background: 'var(--color-accent)',
          borderRadius: '4px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '10px', fontWeight: 700, color: isDark ? '#0d0d0d' : '#ffffff',
        }}>J</div>
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

        {/* Window controls */}
        <WinBtn onClick={() => ipc.window.minimize()} title="Minimize"><Minus size={12}/></WinBtn>
        <WinBtn onClick={() => ipc.window.maximize()} title="Maximize"><Square size={11}/></WinBtn>
        <WinBtn onClick={() => ipc.window.close()} title="Close" isClose><X size={12}/></WinBtn>
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
