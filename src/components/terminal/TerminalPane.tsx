import { useState } from 'react'
import { OutputConsole } from './OutputConsole'
import { useProjectStore } from '../../store/projectStore'

type PaneTab = 'output' | 'problems'

export function TerminalPane() {
  const [activeTab, setActiveTab] = useState<PaneTab>('output')
  const { errors } = useProjectStore()

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--color-bg)',
      borderTop: '1px solid var(--color-border)',
    }}>
      {/* Tab bar */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-surface-2)',
        flexShrink: 0,
        height: '30px',
        alignItems: 'flex-end',
      }}>
        <PaneTabBtn
          active={activeTab === 'output'}
          onClick={() => setActiveTab('output')}
          label="Output"
        />
        <PaneTabBtn
          active={activeTab === 'problems'}
          onClick={() => setActiveTab('problems')}
          label={`Problems${errors.length > 0 ? ` (${errors.length})` : ''}`}
          hasErrors={errors.length > 0}
        />
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {activeTab === 'output' && <OutputConsole />}
        {activeTab === 'problems' && <ProblemsView />}
      </div>
    </div>
  )
}

function PaneTabBtn({ active, onClick, label, hasErrors }: {
  active: boolean
  onClick: () => void
  label: string
  hasErrors?: boolean
}) {
  return (
    <button
      onClick={onClick}
      style={{
        height: '29px',
        padding: '0 12px',
        background: active ? 'var(--color-bg)' : 'transparent',
        border: 'none',
        borderTop: active ? '1px solid var(--color-accent)' : '1px solid transparent',
        color: hasErrors ? 'var(--color-error)' : (active ? 'var(--color-text)' : 'var(--color-text-muted)'),
        fontSize: '12px',
        fontWeight: active ? 500 : 400,
        cursor: 'pointer',
        transition: 'all 0.1s',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  )
}

function ProblemsView() {
  const { errors } = useProjectStore()

  if (errors.length === 0) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-success)',
        fontSize: '12px',
        gap: '6px',
      }}>
        <span>✓</span> No problems detected
      </div>
    )
  }

  return (
    <div style={{ overflow: 'auto', height: '100%' }}>
      {errors.map((err, i) => (
        <div key={i} style={{
          padding: '5px 12px',
          borderBottom: '1px solid var(--color-border-2)',
          display: 'flex',
          gap: '8px',
          alignItems: 'flex-start',
          fontSize: '12px',
        }}>
          <span style={{ color: err.severity === 'error' ? 'var(--color-error)' : 'var(--color-warning)', flexShrink: 0 }}>
            {err.severity === 'error' ? '✗' : '⚠'}
          </span>
          <span style={{ color: 'var(--color-text)', flex: 1 }}>{err.message}</span>
          {err.filePath && (
            <span style={{ color: 'var(--color-text-dim)', whiteSpace: 'nowrap', fontSize: '11px' }}>
              {err.filePath.split(/[\\/]/).pop()}:{err.line}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
