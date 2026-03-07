import { useState } from 'react'
import { useJavaRunner } from '../../hooks/useJavaRunner'
import { useProjectStore } from '../../store/projectStore'
import { useAiStore } from '../../store/aiStore'
import { useLangStore, type Lang } from '../../store/langStore'
import { ipc } from '../../lib/ipc'
import { useEditorStore } from '../../store/editorStore'
import { useRecentProjectsStore } from '../../store/recentProjectsStore'
import { FolderOpen, FolderPlus, FileText, Play, Square, Loader2, Search, Target, MessageCircle, PanelRightClose, PanelRightOpen, Languages, ChevronDown, Clock } from 'lucide-react'
import * as pathBrowser from 'path-browserify'
import { NewWorkspaceModal } from './NewWorkspaceModal'

export function Toolbar() {
  const { run, stop, isCompiling, isRunning } = useJavaRunner()
  const { projectPath, setProjectPath, setFileTree } = useProjectStore()
  const { togglePanel, isPanelOpen, setMode } = useAiStore()
  const { openFile, closeAllTabs } = useEditorStore()
  const { lang, setLang, t } = useLangStore()
  const { projects, addRecentProject } = useRecentProjectsStore()
  const [showRecents, setShowRecents] = useState(false)
  const [showNewWorkspace, setShowNewWorkspace] = useState(false)

  const handleOpenProject = async () => {
    const p = await ipc.fs.openProject()
    if (!p) return
    closeAllTabs()
    setProjectPath(p)
    const tree = await ipc.fs.readDir(p)
    setFileTree(tree)
    addRecentProject(p, pathBrowser.basename(p))
  }

  const handleOpenRecentProject = async (p: string) => {
    setShowRecents(false)
    const exists = await ipc.fs.exists(p)
    if (!exists) return
    closeAllTabs()
    setProjectPath(p)
    const tree = await ipc.fs.readDir(p)
    setFileTree(tree)
    addRecentProject(p, pathBrowser.basename(p))
  }

  const handleOpenFile = async () => {
    const filePath = await ipc.fs.openFile()
    if (!filePath) return
    const content = await ipc.fs.readFile(filePath)
    openFile(filePath, content)
  }

  return (
    <>
    <NewWorkspaceModal isOpen={showNewWorkspace} onClose={() => setShowNewWorkspace(false)} />
    <div style={{
      height: '42px',
      background: 'var(--color-surface-2)',
      borderBottom: '1px solid var(--color-border)',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      padding: '0 8px',
      flexShrink: 0,
    }}>
      {/* File actions */}
      <ToolbarGroup>
        {/* New Workspace button */}
        <ToolBtn onClick={() => setShowNewWorkspace(true)} title="New Java Workspace (Ctrl+Shift+N)">
          <FolderPlus size={13}/> {t('newWorkspace')}
        </ToolBtn>

        {/* Open Project — split button with recent dropdown */}
        <div style={{ position: 'relative', display: 'flex' }}>
          <ToolBtn onClick={handleOpenProject} title="Open Project (Ctrl+Shift+O)" noBorderRight={projects.length > 0}>
            <FolderOpen size={13}/> {t('open')}
          </ToolBtn>
          {projects.length > 0 && (
            <button
              onClick={() => setShowRecents(v => !v)}
              title="Recent projects"
              style={{
                height: '28px', padding: '0 5px',
                background: 'transparent',
                border: '1px solid transparent',
                borderLeft: '1px solid var(--color-border)',
                borderRadius: '0 5px 5px 0',
                color: 'var(--color-text-dim)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center',
                transition: 'all 0.1s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-surface)'; e.currentTarget.style.color = 'var(--color-text)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-dim)' }}
            >
              <ChevronDown size={11} />
            </button>
          )}
          {showRecents && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 99 }}
                onClick={() => setShowRecents(false)}
              />
              <div style={{
                position: 'absolute', top: '32px', left: 0, zIndex: 100,
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                minWidth: '240px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                overflow: 'hidden',
              }}>
                <div style={{ padding: '6px 10px 4px', fontSize: '10px', color: 'var(--color-text-dim)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Clock size={10}/> {t('recentProjects')}
                </div>
                {projects.map((p) => (
                  <button
                    key={p.path}
                    onClick={() => handleOpenRecentProject(p.path)}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '7px 12px',
                      background: 'transparent', border: 'none',
                      color: 'var(--color-text-muted)',
                      cursor: 'pointer', fontSize: '12px',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-surface-2)'; e.currentTarget.style.color = 'var(--color-text)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)' }}
                  >
                    <div style={{ fontWeight: 500 }}>{p.name}</div>
                    <div style={{ fontSize: '10px', color: 'var(--color-text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.path}</div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <ToolBtn onClick={handleOpenFile} title="Open File">
          <FileText size={13}/> {t('file')}
        </ToolBtn>
      </ToolbarGroup>

      <Divider />

      {/* Run/Stop */}
      <ToolbarGroup>
        {isRunning ? (
          <ToolBtn onClick={stop} title="Stop (Ctrl+F5)" accent="error">
            <Square size={11} fill='currentColor'/> {t('stop')}
          </ToolBtn>
        ) : (
          <ToolBtn
            onClick={run}
            title="Run (Ctrl+Enter)"
            accent="success"
            disabled={isCompiling || !projectPath}
          >
            {isCompiling
              ? <><Loader2 size={11}/> {t('building')}</>
              : <><Play size={11} fill='currentColor'/> {t('run')}</>
            }
          </ToolBtn>
        )}
      </ToolbarGroup>

      <Divider />

      {/* AI features */}
      <ToolbarGroup>
        <ToolBtn
          onClick={() => { setMode('chat'); if (!isPanelOpen) togglePanel() }}
          title="AI Mentor Chat (Ctrl+Shift+A)"
          accent={isPanelOpen ? 'accent' : undefined}
        >
          ✦ {t('mentor')}
        </ToolBtn>
        <ToolBtn
          onClick={() => { setMode('review'); if (!isPanelOpen) togglePanel() }}
          title="Code Review"
        >
          <Search size={11}/> {t('review')}
        </ToolBtn>
        <ToolBtn
          onClick={() => { setMode('challenge'); if (!isPanelOpen) togglePanel() }}
          title="Challenge Mode (Ctrl+Shift+C)"
        >
          <Target size={11}/> {t('challenge')}
        </ToolBtn>
        <ToolBtn
          onClick={() => { setMode('duck'); if (!isPanelOpen) togglePanel() }}
          title="Rubber Duck Debug"
        >
          <MessageCircle size={11}/> {t('duck')}
        </ToolBtn>
      </ToolbarGroup>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Language selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginRight: '4px' }}>
        <Languages size={12} style={{ color: 'var(--color-text-dim)', flexShrink: 0 }} />
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as Lang)}
          title="Langue / Language"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '4px',
            color: 'var(--color-text-muted)',
            fontSize: '11px',
            padding: '2px 4px',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option value="fr">FR</option>
          <option value="en">EN</option>
        </select>
      </div>

      {/* Toggle AI panel */}
      <ToolBtn
        onClick={togglePanel}
        title="Toggle AI Panel (Ctrl+Shift+A)"
        accent={isPanelOpen ? 'accent' : undefined}
      >
        {isPanelOpen
          ? <><PanelRightClose size={11}/> {t('hideAi')}</>
          : <><PanelRightOpen size={11}/> {t('showAi')}</>
        }
      </ToolBtn>
    </div>
    </>
  )
}

function ToolbarGroup({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', gap: '2px' }}>{children}</div>
}

function Divider() {
  return (
    <div style={{
      width: '1px',
      height: '20px',
      background: 'var(--color-border)',
      margin: '0 4px',
    }} />
  )
}

function ToolBtn({
  children, onClick, title, accent, disabled, noBorderRight,
}: {
  children: React.ReactNode
  onClick: () => void
  title?: string
  accent?: 'accent' | 'success' | 'error'
  disabled?: boolean
  noBorderRight?: boolean
}) {
  const colors = {
    accent: 'var(--color-accent)',
    success: 'var(--color-success)',
    error: 'var(--color-error)',
  }

  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      style={{
        height: '28px',
        padding: '0 10px',
        background: accent ? `${colors[accent]}22` : 'transparent',
        border: `1px solid ${accent ? colors[accent] + '44' : 'transparent'}`,
        borderRadius: noBorderRight ? '5px 0 0 5px' : '5px',
        color: accent ? colors[accent] : 'var(--color-text-muted)',
        fontSize: '12px',
        fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'all 0.1s',
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = accent ? `${colors[accent]}33` : 'var(--color-surface)'
          e.currentTarget.style.color = accent ? colors[accent] : 'var(--color-text)'
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = accent ? `${colors[accent]}22` : 'transparent'
          e.currentTarget.style.color = accent ? colors[accent] : 'var(--color-text-muted)'
        }
      }}
    >
      {children}
    </button>
  )
}
