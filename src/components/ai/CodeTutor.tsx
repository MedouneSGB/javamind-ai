import { useState } from 'react'
import { useAiStream } from '../../hooks/useAiStream'
import { useAiStore } from '../../store/aiStore'
import { BookOpen, Sparkles, Loader2 } from 'lucide-react'
import { SYSTEM_PROMPTS } from '../../lib/prompt-templates'
import { StreamingText } from './StreamingText'

export function CodeTutor() {
  const { stream, getContext } = useAiStream()
  const { isStreaming, currentStreamContent } = useAiStore()
  const [result, setResult] = useState('')
  const [hasRun, setHasRun] = useState(false)

  const handleExplain = async () => {
    const ctx = getContext()
    setResult('')
    setHasRun(true)

    const systemPrompt = SYSTEM_PROMPTS.TUTOR(ctx.level, ctx.code, ctx.code)
    const response = await stream({
      systemPrompt,
      messages: [{ role: 'user', content: 'Please explain this code step by step.' }],
    })
    setResult(response)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '12px' }}>
      <div style={{ marginBottom: '10px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-accent)', marginBottom: '6px' }}>
          <BookOpen size={13}/> Code Tutor
        </div>
        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '10px' }}>
          Get a step-by-step explanation of your current code with analogies and clear reasoning.
        </div>
        <button
          onClick={handleExplain}
          disabled={isStreaming}
          style={{
            width: '100%',
            padding: '8px',
            background: isStreaming ? 'var(--color-surface)' : 'var(--color-accent)22',
            border: '1px solid var(--color-accent)44',
            borderRadius: '6px',
            color: 'var(--color-accent)',
            fontSize: '13px',
            fontWeight: 500,
            cursor: isStreaming ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {isStreaming ? '✦ Explaining...' : '✦ Explain This Code'}
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {isStreaming && currentStreamContent && (
          <StreamingText content={currentStreamContent} isStreaming />
        )}
        {!isStreaming && result && <StreamingText content={result} />}
        {!isStreaming && !result && hasRun && (
          <div style={{ color: 'var(--color-text-dim)', fontSize: '12px' }}>No content to explain.</div>
        )}
      </div>
    </div>
  )
}
