import { useEditorStore } from '../../store/editorStore'
import type { EditorTab } from '../../types/editor.types'

export function EditorTabs() {
  const { tabs, activeTabId, setActiveTab, closeTab, saveFile } = useEditorStore()

  if (tabs.length === 0) return null

  return (
    <div style={{
      height: '36px',
      background: 'var(--color-bg-2)',
      borderBottom: '1px solid var(--color-border)',
      display: 'flex',
      alignItems: 'flex-end',
      overflowX: 'auto',
      overflowY: 'hidden',
      flexShrink: 0,
    }}>
      {tabs.map((tab) => (
        <Tab
          key={tab.id}
          tab={tab}
          isActive={tab.id === activeTabId}
          onSelect={() => setActiveTab(tab.id)}
          onClose={(e) => {
            e.stopPropagation()
            closeTab(tab.id)
          }}
          onSave={() => saveFile(tab.id)}
        />
      ))}
    </div>
  )
}

function Tab({ tab, isActive, onSelect, onClose, onSave }: {
  tab: EditorTab
  isActive: boolean
  onSelect: () => void
  onClose: (e: React.MouseEvent) => void
  onSave: () => void
}) {
  const getFileIcon = (name: string) => {
    if (name.endsWith('.java')) return '☕'
    if (name.endsWith('.json')) return '{}'
    if (name.endsWith('.xml')) return '<>'
    if (name.endsWith('.md')) return '📝'
    return '📄'
  }

  return (
    <div
      onClick={onSelect}
      onDoubleClick={onSave}
      title={tab.path}
      style={{
        height: '35px',
        padding: '0 12px 0 8px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        cursor: 'pointer',
        background: isActive ? 'var(--color-surface-2)' : 'transparent',
        borderRight: '1px solid var(--color-border-2)',
        borderTop: isActive ? '1px solid var(--color-accent)' : '1px solid transparent',
        color: isActive ? 'var(--color-text)' : 'var(--color-text-muted)',
        fontSize: '12.5px',
        fontWeight: isActive ? 500 : 400,
        whiteSpace: 'nowrap',
        userSelect: 'none',
        transition: 'background 0.1s, color 0.1s',
        minWidth: '80px',
        maxWidth: '180px',
        flexShrink: 0,
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'var(--color-surface-3)'
          e.currentTarget.style.color = 'var(--color-text)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'var(--color-text-muted)'
        }
      }}
    >
      <span style={{ fontSize: '11px' }}>{getFileIcon(tab.name)}</span>
      <span style={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: '110px',
      }}>
        {tab.name}
      </span>

      {/* Dirty indicator */}
      {tab.isDirty && (
        <span style={{
          width: '6px', height: '6px',
          borderRadius: '50%',
          background: 'var(--color-accent)',
          flexShrink: 0,
          marginLeft: '-2px',
        }} title="Unsaved changes" />
      )}

      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          width: '16px', height: '16px',
          background: 'transparent',
          border: 'none',
          color: 'var(--color-text-dim)',
          fontSize: '10px',
          cursor: 'pointer',
          borderRadius: '3px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: '2px',
          flexShrink: 0,
          padding: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--color-error)'
          e.currentTarget.style.color = 'white'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'var(--color-text-dim)'
        }}
      >
        ✕
      </button>
    </div>
  )
}
