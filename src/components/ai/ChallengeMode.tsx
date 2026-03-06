import { useState, useEffect } from 'react'
import { useAiStream } from '../../hooks/useAiStream'
import { useAiStore } from '../../store/aiStore'
import { useLearningStore } from '../../store/learningStore'
import { useLangStore } from '../../store/langStore'
import { SYSTEM_PROMPTS } from '../../lib/prompt-templates'
import { CURRICULUM } from '../../lib/learning-curriculum'
import { StreamingText } from './StreamingText'
import type { Challenge, ChallengeResult } from '../../types/ai.types'

export function ChallengeMode() {
  const { stream, getContext } = useAiStream()
  const { isStreaming, currentStreamContent, currentChallenge, startChallenge, challengeStartTime } = useAiStore()
  const { userLevel, currentTopic, masteredConcepts, recordChallengeResult, markConceptMastered } = useLearningStore()
  const { t } = useLangStore()
  const [hintsRevealed, setHintsRevealed] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [phase, setPhase] = useState<'idle' | 'generating' | 'active' | 'evaluating' | 'result'>('idle')
  const [evalResult, setEvalResult] = useState('')

  // Timer
  useEffect(() => {
    if (!challengeStartTime || phase !== 'active') return
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - challengeStartTime) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [challengeStartTime, phase])

  const getTopicName = () => {
    if (!currentTopic) return userLevel
    for (const track of CURRICULUM.tracks) {
      const c = track.concepts.find(c => c.id === currentTopic)
      if (c) return c.title
    }
    return currentTopic
  }

  const handleGenerate = async () => {
    setPhase('generating')
    setHintsRevealed(0)
    setEvalResult('')

    const systemPrompt = SYSTEM_PROMPTS.CHALLENGE_GENERATOR(
      userLevel,
      getTopicName(),
      masteredConcepts
    )

    const response = await stream({
      systemPrompt,
      messages: [{ role: 'user', content: 'Generate a challenge.' }],
    })

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const challenge: Challenge = JSON.parse(jsonMatch[0])
        startChallenge(challenge)
        setPhase('active')
      }
    } catch {
      setPhase('idle')
    }
  }

  const handleRevealHint = () => {
    if (currentChallenge && hintsRevealed < currentChallenge.hints.length) {
      setHintsRevealed(h => h + 1)
    }
  }

  const handleSubmit = async () => {
    if (!currentChallenge) return
    const ctx = getContext()
    setPhase('evaluating')

    const systemPrompt = SYSTEM_PROMPTS.CHALLENGE_EVALUATOR(
      userLevel,
      `${currentChallenge.title}\n${currentChallenge.description}\nRequirements: ${currentChallenge.requirements.join(', ')}`,
      ctx.code
    )

    const response = await stream({
      systemPrompt,
      messages: [{ role: 'user', content: 'Evaluate my solution.' }],
    })

    // Extract score
    const scoreMatch = response.match(/Score:\s*(\d+)\/100/)
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 50

    const result: ChallengeResult = {
      id: crypto.randomUUID(),
      challenge: currentChallenge,
      userCode: ctx.code,
      score,
      feedback: response,
      timestamp: Date.now(),
    }

    recordChallengeResult(result)
    if (score >= 70 && currentTopic) markConceptMastered(currentTopic)
    setEvalResult(response)
    setPhase('result')
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  if (phase === 'idle') {
    return (
      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-accent)' }}>
          {t('challengeTitle')}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
          {t('challengeDesc')}
        </div>
        {currentTopic && (
          <div style={{
            padding: '6px 10px',
            background: 'var(--color-accent)11',
            border: '1px solid var(--color-accent)33',
            borderRadius: '6px',
            fontSize: '12px',
            color: 'var(--color-accent)',
          }}>
            {t('topicLabel')} {getTopicName()}
          </div>
        )}
        <button
          onClick={handleGenerate}
          style={{
            padding: '10px',
            background: 'var(--color-accent)22',
            border: '1px solid var(--color-accent)44',
            borderRadius: '8px',
            color: 'var(--color-accent)',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {t('generateChallenge')}
        </button>
      </div>
    )
  }

  if (phase === 'generating') {
    return (
      <div style={{ padding: '12px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        <div style={{ fontSize: '24px', marginBottom: '8px', animation: 'pulse 1s infinite' }}>🎯</div>
        <div style={{ fontSize: '13px' }}>{t('generatingChallenge')}</div>
        {isStreaming && currentStreamContent && (
          <div style={{ marginTop: '12px', textAlign: 'left' }}>
            <StreamingText content={currentStreamContent} isStreaming />
          </div>
        )}
      </div>
    )
  }

  if (phase === 'active' && currentChallenge) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'auto', padding: '12px' }}>
        {/* Timer + title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>
            {currentChallenge.title}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-warning)', fontFamily: 'monospace' }}>
            ⏱ {formatTime(elapsed)}
          </div>
        </div>

        {/* Description */}
        <div style={{
          padding: '8px 10px',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '6px',
          fontSize: '12.5px',
          color: 'var(--color-text)',
          lineHeight: 1.6,
          marginBottom: '10px',
        }}>
          {currentChallenge.description}
        </div>

        {/* Requirements */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-accent)', marginBottom: '4px' }}>
            {t('requirements')}
          </div>
          {currentChallenge.requirements.map((req, i) => (
            <div key={i} style={{ fontSize: '12px', color: 'var(--color-text-muted)', padding: '2px 0 2px 10px' }}>
              {i + 1}. {req}
            </div>
          ))}
        </div>

        {/* Examples */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-accent)', marginBottom: '4px' }}>
            {t('examples')}
          </div>
          {currentChallenge.examples.map((ex, i) => (
            <div key={i} style={{
              fontSize: '12px',
              color: 'var(--color-text-muted)',
              fontFamily: 'monospace',
              background: 'var(--color-surface-2)',
              padding: '3px 8px',
              borderRadius: '4px',
              marginBottom: '3px',
            }}>
              {ex}
            </div>
          ))}
        </div>

        {/* Hints */}
        <div style={{ marginBottom: '12px' }}>
          {currentChallenge.hints.slice(0, hintsRevealed).map((hint, i) => (
            <div key={i} style={{
              fontSize: '12px',
              color: 'var(--color-info)',
              padding: '4px 10px',
              borderLeft: '2px solid var(--color-info)',
              marginBottom: '4px',
            }}>
              💡 Hint {i + 1}: {hint}
            </div>
          ))}
          {hintsRevealed < (currentChallenge.hints?.length || 0) && (
            <button
              onClick={handleRevealHint}
              style={{
                background: 'transparent',
                border: '1px dashed var(--color-border)',
                borderRadius: '4px',
                color: 'var(--color-text-dim)',
                fontSize: '11px',
                cursor: 'pointer',
                padding: '4px 10px',
                width: '100%',
              }}
            >
              {t('revealHint')} ({hintsRevealed}/{currentChallenge.hints.length})
            </button>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          style={{
            padding: '9px',
            background: 'var(--color-success)22',
            border: '1px solid var(--color-success)44',
            borderRadius: '7px',
            color: 'var(--color-success)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            marginTop: 'auto',
          }}
        >
          {t('submitSolution')}
        </button>
      </div>
    )
  }

  if (phase === 'evaluating') {
    return (
      <div style={{ padding: '12px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        <div style={{ fontSize: '24px', marginBottom: '8px', animation: 'pulse 1s infinite' }}>🔍</div>
        <div style={{ fontSize: '13px' }}>{t('evaluating')}</div>
        {isStreaming && currentStreamContent && (
          <div style={{ marginTop: '12px', textAlign: 'left' }}>
            <StreamingText content={currentStreamContent} isStreaming />
          </div>
        )}
      </div>
    )
  }

  if (phase === 'result') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '12px', overflow: 'auto' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-accent)', marginBottom: '10px' }}>
          {t('evalResults')}
        </div>
        <div style={{ flex: 1, overflow: 'auto', marginBottom: '10px' }}>
          <StreamingText content={evalResult} />
        </div>
        <button
          onClick={() => { setPhase('idle'); setElapsed(0) }}
          style={{
            padding: '8px',
            background: 'var(--color-accent)22',
            border: '1px solid var(--color-accent)44',
            borderRadius: '6px',
            color: 'var(--color-accent)',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          {t('newChallenge')}
        </button>
      </div>
    )
  }

  return null
}
