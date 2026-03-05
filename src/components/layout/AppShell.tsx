import { useState, useCallback } from 'react'
import { TitleBar } from './TitleBar'
import { Toolbar } from './Toolbar'
import { StatusBar } from './StatusBar'
import { Sidebar } from '../sidebar/Sidebar'
import { EditorPane } from '../editor/EditorPane'
import { TerminalPane } from '../terminal/TerminalPane'
import { AiPanel } from '../ai/AiPanel'
import { useAiStore } from '../../store/aiStore'

export function AppShell() {
  const { isPanelOpen } = useAiStore()
  const [sidebarWidth, setSidebarWidth] = useState(220)
  const [aiWidth, setAiWidth] = useState(320)
  const [terminalHeight, setTerminalHeight] = useState(200)

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
