import { useEditorStore } from '../../store/editorStore'
import { MonacoEditor } from './MonacoEditor'
import { EditorTabs } from './EditorTabs'

export function EditorPane() {
  const { tabs, activeTabId, updateContent } = useEditorStore()
  const activeTab = tabs.find(t => t.id === activeTabId)

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--color-bg)',
      overflow: 'hidden',
    }}>
      <EditorTabs />

      {activeTab ? (
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <MonacoEditor
            key={activeTab.id}
            tabId={activeTab.id}
            content={activeTab.content}
            language={activeTab.language}
            onChange={(value) => updateContent(activeTab.id, value)}
          />
        </div>
      ) : (
        <WelcomeScreen />
      )}
    </div>
  )
}

function WelcomeScreen() {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      color: 'var(--color-text-dim)',
      userSelect: 'none',
    }}>
      <div style={{
        width: '64px', height: '64px',
        background: 'var(--color-surface)',
        borderRadius: '16px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '32px',
        border: '1px solid var(--color-border)',
      }}>
        ☕
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '8px' }}>
          JavaMind AI
        </div>
        <div style={{ fontSize: '13px', lineHeight: 1.8 }}>
          📂 Open a project with <Key>Ctrl+Shift+O</Key><br />
          📄 Or open a file with <Key>Ctrl+O</Key><br />
          ✦ Ask the AI mentor anything with <Key>Ctrl+Shift+A</Key>
        </div>
      </div>
    </div>
  )
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: '4px',
      padding: '1px 6px',
      fontSize: '11px',
      fontFamily: 'monospace',
      color: 'var(--color-accent)',
    }}>
      {children}
    </span>
  )
}
