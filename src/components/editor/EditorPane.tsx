import { useEditorStore } from '../../store/editorStore'
import { useLangStore } from '../../store/langStore'
import { Coffee, FolderOpen, FileText, Sparkles } from 'lucide-react'
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
  const { t } = useLangStore()
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
        border: '1px solid var(--color-border)',
      }}>
        <Coffee size={32}/>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '8px' }}>
          JavaMind AI
        </div>
        <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FolderOpen size={13}/> <span>{t('openProjectWith')}</span> <Key>Ctrl+Shift+O</Key>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileText size={13}/> <span>{t('orOpenFileWith')}</span> <Key>Ctrl+O</Key>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={13}/> <span>{t('askMentor')}</span> <Key>Ctrl+Shift+A</Key>
          </div>
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
