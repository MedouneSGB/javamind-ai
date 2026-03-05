import { useState } from 'react'
import { FileExplorer } from './FileExplorer'
import { LearningNav } from './LearningNav'

type SidebarTab = 'files' | 'learning'

export function Sidebar() {
  const [activeTab, setActiveTab] = useState<SidebarTab>('files')

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--color-bg-2)',
      borderRight: '1px solid var(--color-border-2)',
      overflow: 'hidden',
    }}>
      {/* Tab bar */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--color-border)',
        flexShrink: 0,
      }}>
        <SideTab
          active={activeTab === 'files'}
          onClick={() => setActiveTab('files')}
          icon="📁"
          label="Explorer"
        />
        <SideTab
          active={activeTab === 'learning'}
          onClick={() => setActiveTab('learning')}
          icon="🎓"
          label="Learning"
        />
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'files' ? <FileExplorer /> : <LearningNav />}
      </div>
    </div>
  )
}

function SideTab({ active, onClick, icon, label }: {
  active: boolean
  onClick: () => void
  icon: string
  label: string
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        height: '34px',
        background: active ? 'var(--color-surface-2)' : 'transparent',
        border: 'none',
        borderBottom: active ? '2px solid var(--color-accent)' : '2px solid transparent',
        color: active ? 'var(--color-accent)' : 'var(--color-text-dim)',
        fontSize: '11px',
        fontWeight: active ? 600 : 400,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        transition: 'all 0.1s',
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.color = 'var(--color-text-muted)'
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.color = 'var(--color-text-dim)'
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  )
}
