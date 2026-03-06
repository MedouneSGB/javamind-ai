import type { ReactNode } from 'react'
import { useLearningStore } from '../../store/learningStore'
import { Lock, Circle, CircleDot, CheckCircle2 } from 'lucide-react'
import { useAiStore } from '../../store/aiStore'
import { useLangStore } from '../../store/langStore'
import { CURRICULUM, getAvailableConcepts } from '../../lib/learning-curriculum'
import type { ConceptStatus } from '../../types/learning.types'

export function LearningNav() {
  const { masteredConcepts, currentTopic, setCurrentTopic } = useLearningStore()
  const { setMode, setPanelOpen } = useAiStore()
  const { t } = useLangStore()

  const available = getAvailableConcepts(masteredConcepts)

  const getStatus = (conceptId: string): ConceptStatus => {
    if (masteredConcepts.includes(conceptId)) return 'mastered'
    if (conceptId === currentTopic) return 'in-progress'
    if (available.includes(conceptId)) return 'available'
    return 'locked'
  }

  const handleSelectConcept = (conceptId: string) => {
    const status = getStatus(conceptId)
    if (status === 'locked') return
    setCurrentTopic(conceptId)
    setMode('challenge')
    setPanelOpen(true)
  }

  const total = CURRICULUM.tracks.reduce((sum, t) => sum + t.concepts.length, 0)
  const progress = Math.round((masteredConcepts.length / total) * 100)

  return (
    <div style={{ overflow: 'auto', flex: 1, padding: '8px 0' }}>
      {/* Progress bar */}
      <div style={{ padding: '6px 10px 10px' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: '10px', color: 'var(--color-text-muted)',
          marginBottom: '5px',
        }}>
          <span>{t('overallProgress')}</span>
          <span style={{ color: 'var(--color-accent)' }}>{progress}%</span>
        </div>
        <div style={{
          height: '4px', background: 'var(--color-surface)',
          borderRadius: '2px', overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, var(--color-accent), var(--color-success))',
            borderRadius: '2px',
            transition: 'width 0.5s ease',
          }} />
        </div>
        <div style={{ fontSize: '10px', color: 'var(--color-text-dim)', marginTop: '4px' }}>
          {masteredConcepts.length} / {total} {t('concepts')}
        </div>
      </div>

      {/* Tracks */}
      {CURRICULUM.tracks.map(track => {
        const trackMastered = track.concepts.filter(c => masteredConcepts.includes(c.id)).length
        return (
          <div key={track.id} style={{ marginBottom: '4px' }}>
            {/* Track header */}
            <div style={{
              padding: '5px 10px',
              fontSize: '10px',
              fontWeight: 700,
              color: 'var(--color-accent)',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span>{track.title}</span>
              <span style={{ color: 'var(--color-text-dim)', fontWeight: 400 }}>
                {trackMastered}/{track.concepts.length}
              </span>
            </div>

            {/* Concepts */}
            {track.concepts.map(concept => {
              const status = getStatus(concept.id)
              return (
                <ConceptNode
                  key={concept.id}
                  title={concept.title}
                  status={status}
                  isCurrent={concept.id === currentTopic}
                  onClick={() => handleSelectConcept(concept.id)}
                />
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

function ConceptNode({ title, status, isCurrent, onClick }: {
  title: string
  status: ConceptStatus
  isCurrent: boolean
  onClick: () => void
}) {
  const icons: Record<ConceptStatus, ReactNode> = {
    locked: <Lock size={11}/>,
    available: <Circle size={11}/>,
    'in-progress': <CircleDot size={11}/>,
    mastered: <CheckCircle2 size={11}/>,
  }
  const colors: Record<ConceptStatus, string> = {
    locked: 'var(--color-text-dim)',
    available: 'var(--color-text-muted)',
    'in-progress': 'var(--color-accent)',
    mastered: 'var(--color-success)',
  }

  return (
    <div
      onClick={onClick}
      style={{
        height: '28px',
        padding: '0 10px 0 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '7px',
        cursor: status === 'locked' ? 'not-allowed' : 'pointer',
        opacity: status === 'locked' ? 0.4 : 1,
        background: isCurrent ? 'var(--color-surface)' : 'transparent',
        borderLeft: isCurrent ? '2px solid var(--color-accent)' : '2px solid transparent',
        transition: 'all 0.1s',
      }}
      onMouseEnter={(e) => {
        if (status !== 'locked') e.currentTarget.style.background = 'var(--color-surface-3)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = isCurrent ? 'var(--color-surface)' : 'transparent'
      }}
    >
      <span style={{ display:'flex', alignItems:'center', color: colors[status], width: '12px' }}>
        {icons[status]}
      </span>
      <span style={{
        fontSize: '12px',
        color: isCurrent ? 'var(--color-text)' : colors[status],
        fontWeight: isCurrent ? 500 : 400,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {title}
      </span>
    </div>
  )
}
