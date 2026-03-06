import { useState } from 'react'
import { useAiStream } from '../../hooks/useAiStream'
import { useAiStore } from '../../store/aiStore'
import { Search, Loader2 } from 'lucide-react'
import { SYSTEM_PROMPTS } from '../../lib/prompt-templates'
import { StreamingText } from './StreamingText'

export function CodeReviewer() {
  const { stream, getContext } = useAiStream()
  const { isStreaming, currentStreamContent } = useAiStore()
  const [result, setResult] = useState('')

  const handleReview = async () => {
    const ctx = getContext()
    if (!ctx.code.trim()) return
    setResult('')

    const systemPrompt = SYSTEM_PROMPTS.CODE_REVIEWER(ctx.level, ctx.code)
    const response = await stream({
      systemPrompt,
      messages: [{ role: 'user', content: 'Please review this Java code.' }],
    })
    setResult(response)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '12px' }}>
      <div style={{ marginBottom: '10px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-accent)', marginBottom: '6px' }}>
          <Search size={13}/> Code Review
        </div>
        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '10px' }}>
          Senior Java engineer reviews your code for correctness, best practices, and Java idioms.
        </div>
        <button
          onClick={handleReview}
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
          }}
        >
          {isStreaming ? '✦ Reviewing...' : '🔍 Review My Code'}
        </button>
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {isStreaming && currentStreamContent && <StreamingText content={currentStreamContent} isStreaming />}
        {!isStreaming && result && <StreamingText content={result} />}
      </div>
    </div>
  )
}
