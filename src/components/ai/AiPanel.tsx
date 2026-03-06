import { useAiStore } from '../../store/aiStore'
import { AiChat } from './AiChat'
import { CodeTutor } from './CodeTutor'
import { CodeReviewer } from './CodeReviewer'
import { ChallengeMode } from './ChallengeMode'
import { RubberDuck } from './RubberDuck'
import { InterviewPrep } from './InterviewPrep'
import type { AiMode } from '../../types/ai.types'

const MODES: { id: AiMode; icon: string; label: string }[] = [
  { id: 'chat', icon: '✦', label: 'Mentor' },
  { id: 'tutor', icon: '📚', label: 'Tutor' },
  { id: 'review', icon: '🔍', label: 'Review' },
  { id: 'challenge', icon: '🎯', label: 'Challenge' },
  { id: 'duck', icon: '🦆', label: 'Duck' },
  { id: 'interview', icon: '💼', label: 'Interview' },
]


export function AiPanel() {
  const { activeMode, setMode, isPanelOpen } = useAiStore()

  if (!isPanelOpen) return null

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--color-surface-2)',
      borderLeft: '1px solid var(--color-border)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '8px 10px 0',
        borderBottom: '1px solid var(--color-border)',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '8px',
        }}>
          <div style={{
            width: '20px', height: '20px',
            background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-2))',
            borderRadius: '5px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', color: '#0d0d0d', fontWeight: 700,
          }}>✦</div>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>AI Assistant</span>
        </div>

        {/* Mode tabs */}
        <div style={{
          display: 'flex',
          gap: '1px',
          overflowX: 'auto',
        }}>
          {MODES.map(mode => (
            <button
              key={mode.id}
              onClick={() => setMode(mode.id)}
              title={mode.label}
              style={{
                flex: 1,
                minWidth: '0',
                height: '30px',
                padding: '0 4px',
                background: activeMode === mode.id ? 'var(--color-surface)' : 'transparent',
                border: 'none',
                borderBottom: activeMode === mode.id ? '2px solid var(--color-accent)' : '2px solid transparent',
                color: activeMode === mode.id ? 'var(--color-accent)' : 'var(--color-text-dim)',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1px',
                transition: 'all 0.1s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                if (activeMode !== mode.id) e.currentTarget.style.color = 'var(--color-text-muted)'
              }}
              onMouseLeave={(e) => {
                if (activeMode !== mode.id) e.currentTarget.style.color = 'var(--color-text-dim)'
              }}
            >
              <span style={{ fontSize: '13px' }}>{mode.icon}</span>
              <span style={{ fontSize: '9px', letterSpacing: '0.3px' }}>{mode.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {activeMode === 'chat' && <AiChat />}
        {activeMode === 'tutor' && <CodeTutor />}
        {activeMode === 'review' && <CodeReviewer />}
        {activeMode === 'challenge' && <ChallengeMode />}
        {activeMode === 'duck' && <RubberDuck />}
        {activeMode === 'interview' && <InterviewPrep />}
      </div>
    </div>
  )
}
