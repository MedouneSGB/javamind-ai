import { ipc } from '../../lib/ipc'

export function TitleBar() {
  return (
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
          fontSize: '10px', fontWeight: 700, color: '#0d0d0d',
        }}>J</div>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)', letterSpacing: '0.3px' }}>
          JavaMind AI
        </span>
        <span style={{ fontSize: '11px', color: 'var(--color-text-dim)', marginLeft: '2px' }}>
          v0.1
        </span>
      </div>

      {/* Window controls */}
      <div style={{ display: 'flex', WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <WinBtn onClick={() => ipc.window.minimize()} title="Minimize">─</WinBtn>
        <WinBtn onClick={() => ipc.window.maximize()} title="Maximize">□</WinBtn>
        <WinBtn onClick={() => ipc.window.close()} title="Close" isClose>✕</WinBtn>
      </div>
    </div>
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
