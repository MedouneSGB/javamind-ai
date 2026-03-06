import { useState, useCallback, useEffect } from 'react'
import { TitleBar } from './TitleBar'
import { Toolbar } from './Toolbar'
import { StatusBar } from './StatusBar'
import { Sidebar } from '../sidebar/Sidebar'
import { EditorPane } from '../editor/EditorPane'
import { TerminalPane } from '../terminal/TerminalPane'
import { AiPanel } from '../ai/AiPanel'
import { useAiStore } from '../../store/aiStore'
import { useAuthStore } from '../../store/authStore'
import { useRecentProjectsStore } from '../../store/recentProjectsStore'
import { useProjectStore } from '../../store/projectStore'
import { useEditorStore } from '../../store/editorStore'
import { useSyncOnChange } from '../../hooks/useSyncOnChange'
import { pullFromSupabase } from '../../lib/sync'
import { supabase } from '../../lib/supabase'
import { ipc } from '../../lib/ipc'
import * as pathBrowser from 'path-browserify'

export function AppShell() {
  const { isPanelOpen } = useAiStore()
  const [sidebarWidth, setSidebarWidth] = useState(220)
  const [aiWidth, setAiWidth] = useState(320)
  const [terminalHeight, setTerminalHeight] = useState(200)

  const { handleDeepLink, session, fetchProfile } = useAuthStore()
  const { projects, addRecentProject } = useRecentProjectsStore()
  const { setProjectPath, setFileTree } = useProjectStore()
  const { closeAllTabs } = useEditorStore()

  // Sync on store changes
  useSyncOnChange()

  // Listen for OAuth deep links from the main process (Electron protocol handler)
  useEffect(() => {
    return ipc.auth.onDeepLink((url) => {
      handleDeepLink(url)
    })
  }, [handleDeepLink])

  // Supabase auth state change listener — always active, not inside AuthModal
  useEffect(() => {
    if (!supabase) return
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      useAuthStore.getState().setSession(newSession)
      if (newSession?.user) {
        fetchProfile().then(() => pullFromSupabase())
      }
    })
    return () => subscription.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // When session becomes available (e.g. restored from localStorage), pull data
  useEffect(() => {
    if (session) {
      fetchProfile().then(() => pullFromSupabase())
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.access_token])

  // Auto-reopen last project on startup
  useEffect(() => {
    const last = projects[0]
    if (!last) return
    ipc.fs.exists(last.path).then((exists) => {
      if (!exists) return
      closeAllTabs()
      setProjectPath(last.path)
      ipc.fs.readDir(last.path).then((tree) => {
        setFileTree(tree)
        addRecentProject(last.path, pathBrowser.basename(last.path))
      })
    })
  // Run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100vw',
      height: '100vh',
      background: 'var(--color-bg)',
      overflow: 'hidden',
    }}>
      <TitleBar />
      <Toolbar />

      {/* Main content area */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', minHeight: 0 }}>
        {/* Left sidebar */}
        <div style={{
          width: `${sidebarWidth}px`,
          flexShrink: 0,
          height: '100%',
          overflow: 'hidden',
          position: 'relative',
        }}>
          <Sidebar />
          <ResizeHandle
            direction="horizontal"
            onResize={(delta) => setSidebarWidth(w => Math.max(150, Math.min(400, w + delta)))}
          />
        </div>

        {/* Center: editor + terminal stacked vertically */}
        <div style={{ flex: 1, minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', position: 'relative' }}>
            <EditorPane />
          </div>
          <ResizeHandle
            direction="vertical"
            onResize={(delta) => setTerminalHeight(h => Math.max(80, Math.min(500, h - delta)))}
          />
          <div style={{ height: `${terminalHeight}px`, flexShrink: 0, overflow: 'hidden' }}>
            <TerminalPane />
          </div>
        </div>

        {/* Right: AI panel */}
        {isPanelOpen && (
          <div style={{
            width: `${aiWidth}px`,
            flexShrink: 0,
            height: '100%',
            overflow: 'hidden',
            position: 'relative',
          }}>
            <ResizeHandle
              direction="horizontal-left"
              onResize={(delta) => setAiWidth(w => Math.max(200, Math.min(500, w - delta)))}
            />
            <AiPanel />
          </div>
        )}
      </div>

      <StatusBar />
    </div>
  )
}

function ResizeHandle({ direction, onResize }: {
  direction: 'horizontal' | 'horizontal-left' | 'vertical'
  onResize: (delta: number) => void
}) {
  const isVertical = direction === 'vertical'
  const isLeft = direction === 'horizontal-left'

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const startX = e.clientX
    const startY = e.clientY

    const onMouseMove = (e: MouseEvent) => {
      const delta = isVertical ? e.clientY - startY : e.clientX - startX
      onResize(delta)
    }

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.body.style.cursor = isVertical ? 'row-resize' : 'col-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [isVertical, onResize])

  return (
    <div
      onMouseDown={handleMouseDown}
      style={{
        position: 'absolute',
        ...(isVertical ? {
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          cursor: 'row-resize',
        } : isLeft ? {
          top: 0,
          bottom: 0,
          left: 0,
          width: '3px',
          cursor: 'col-resize',
        } : {
          top: 0,
          bottom: 0,
          right: 0,
          width: '3px',
          cursor: 'col-resize',
        }),
        background: 'var(--color-border-2)',
        zIndex: 10,
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-accent)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-border-2)' }}
    />
  )
}
