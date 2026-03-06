import { useState } from 'react'
import { useAiStream } from '../../hooks/useAiStream'
import { useAiStore } from '../../store/aiStore'
import { useLangStore } from '../../store/langStore'
import { MessageCircle, Send, CheckCircle2 } from 'lucide-react'
import { SYSTEM_PROMPTS } from '../../lib/prompt-templates'
import { StreamingText } from './StreamingText'
import type { AiMessage } from '../../types/ai.types'

export function RubberDuck() {
  const { stream, getContext } = useAiStream()
  const { isStreaming, currentStreamContent } = useAiStore()
  const { t } = useLangStore()
  const [messages, setMessages] = useState<AiMessage[]>([])
  const [input, setInput] = useState('')
  const [isActive, setIsActive] = useState(false)

  const startSession = async (description: string) => {
    const ctx = getContext()
    setIsActive(true)

    const userMsg: AiMessage = {
      id: crypto.randomUUID(), role: 'user', content: description,
      timestamp: Date.now(), mode: 'duck',
    }
    setMessages([userMsg])

    const systemPrompt = SYSTEM_PROMPTS.RUBBER_DUCK(ctx.code, description)
    const response = await stream({
      systemPrompt,
      messages: [{ role: 'user', content: description }],
    })

    const aiMsg: AiMessage = {
      id: crypto.randomUUID(), role: 'assistant', content: response,
      timestamp: Date.now(), mode: 'duck',
    }
    setMessages(prev => [...prev, aiMsg])
    setInput('')
  }

  const handleReply = async () => {
    const text = input.trim()
    if (!text || isStreaming) return
    setInput('')

    const ctx = getContext()
    const userMsg: AiMessage = {
      id: crypto.randomUUID(), role: 'user', content: text,
      timestamp: Date.now(), mode: 'duck',
    }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)

    const systemPrompt = SYSTEM_PROMPTS.RUBBER_DUCK(ctx.code, messages[0]?.content || text)
    const response = await stream({
      systemPrompt,
      messages: newMessages.map(m => ({ role: m.role, content: m.content })),
    })

    const aiMsg: AiMessage = {
      id: crypto.randomUUID(), role: 'assistant', content: response,
      timestamp: Date.now(), mode: 'duck',
    }
    setMessages(prev => [...prev, aiMsg])
  }

  if (!isActive) {
    return (
      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <div style={{ marginBottom: '8px', color: 'var(--color-accent)' }}><MessageCircle size={48}/></div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-accent)' }}>{t('duckTitle')}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.7, marginTop: '6px' }}>
            {t('duckDesc1')}<br />
            {t('duckDesc2')}
            <br />
            <span style={{ color: 'var(--color-text-dim)', fontSize: '11px' }}>
              {t('duckNote')}
            </span>
          </div>
        </div>
        <StartForm onStart={startSession} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflow: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {messages.map(msg => (
          <div key={msg.id} style={{
            padding: '8px 10px',
            background: msg.role === 'user' ? 'var(--color-accent)11' : 'var(--color-surface)',
            border: `1px solid ${msg.role === 'user' ? 'var(--color-accent)33' : 'var(--color-border)'}`,
            borderRadius: '8px',
            fontSize: '12.5px',
          }}>
            <div style={{
              fontSize: '10px', fontWeight: 700,
              color: msg.role === 'user' ? 'var(--color-accent)' : 'var(--color-text-dim)',
              marginBottom: '4px',
            }}>
              {msg.role === 'user' ? t('duckYou') : t('duckLabel')}
            </div>
            {msg.role === 'user' ? (
              <div style={{ color: 'var(--color-text)', whiteSpace: 'pre-wrap' }}>{msg.content}</div>
            ) : (
              <StreamingText content={msg.content} />
            )}
          </div>
        ))}

        {isStreaming && currentStreamContent && (
          <div style={{
            padding: '8px 10px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
          }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-dim)', marginBottom: '4px' }}>
              <MessageCircle size={10}/> DUCK
            </div>
            <StreamingText content={currentStreamContent} isStreaming />
          </div>
        )}
      </div>

      <div style={{ padding: '8px 12px', borderTop: '1px solid var(--color-border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleReply()}
            placeholder={t('duckAnswerPlaceholder')}
            disabled={isStreaming}
            style={{
              flex: 1,
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '6px',
              padding: '7px 10px',
              color: 'var(--color-text)',
              fontSize: '12.5px',
              outline: 'none',
            }}
          />
          <button
            onClick={handleReply}
            disabled={!input.trim() || isStreaming}
            style={{
              padding: '7px 12px',
              background: 'var(--color-accent)22',
              border: '1px solid var(--color-accent)44',
              borderRadius: '6px',
              color: 'var(--color-accent)',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            <Send size={12}/>
          </button>
        </div>
        <button
          onClick={() => { setIsActive(false); setMessages([]) }}
          style={{
            marginTop: '6px', background: 'transparent', border: 'none',
            color: 'var(--color-text-dim)', fontSize: '11px', cursor: 'pointer',
          }}
        >
          <CheckCircle2 size={12}/> {t('duckFoundBug')}
        </button>
      </div>
    </div>
  )
}

function StartForm({ onStart }: { onStart: (desc: string) => void }) {
  const [desc, setDesc] = useState('')
  const { t } = useLangStore()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <textarea
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder={t('duckDescPlaceholder')}
        rows={4}
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '6px',
          padding: '8px 10px',
          color: 'var(--color-text)',
          fontSize: '12.5px',
          outline: 'none',
          resize: 'vertical',
          fontFamily: 'inherit',
        }}
      />
      <button
        onClick={() => desc.trim() && onStart(desc.trim())}
        disabled={!desc.trim()}
        style={{
          padding: '9px',
          background: 'var(--color-accent)22',
          border: '1px solid var(--color-accent)44',
          borderRadius: '7px',
          color: 'var(--color-accent)',
          fontSize: '13px',
          fontWeight: 600,
          cursor: desc.trim() ? 'pointer' : 'not-allowed',
          opacity: desc.trim() ? 1 : 0.5,
        }}
      >
        <MessageCircle size={13}/> {t('duckTalkBtn')}
      </button>
    </div>
  )
}
