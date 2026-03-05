import { useEffect, useRef } from 'react'
import { useProjectStore } from '../../store/projectStore'
import type { OutputLine } from '../../types/editor.types'

export function OutputConsole() {
  const { output, clearOutput } = useProjectStore()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [output])

  const getColor = (type: OutputLine['type']) => {
    switch (type) {
      case 'stdout': return 'var(--color-text)'
      case 'stderr': return '#ff8080'
      case 'info': return 'var(--color-info)'
      case 'success': return 'var(--color-success)'
      case 'error': return 'var(--color-error)'
    }
  }

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--color-bg)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '4px 10px',
        borderBottom: '1px solid var(--color-border-2)',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: '11px', color: 'var(--color-text-dim)', fontWeight: 600 }}>
          OUTPUT
        </span>
        {output.length > 0 && (
          <button
            onClick={clearOutput}
            style={{
              background: 'transparent', border: 'none',
              color: 'var(--color-text-dim)', cursor: 'pointer',
              fontSize: '11px', padding: '2px 6px',
              borderRadius: '3px',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-dim)' }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Output lines */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '6px 12px',
        fontFamily: "'Cascadia Code', 'JetBrains Mono', Consolas, monospace",
        fontSize: '12.5px',
        lineHeight: '1.6',
      }}>
        {output.length === 0 ? (
          <div style={{ color: 'var(--color-text-dim)', fontStyle: 'italic', fontSize: '12px' }}>
            Run your code to see output here...
          </div>
        ) : (
          output.map((line, i) => (
            <div key={i} style={{ color: getColor(line.type), whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {line.content}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
