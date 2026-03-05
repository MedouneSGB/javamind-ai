import { useState, useRef, useEffect } from 'react'
import { useAiStream } from '../../hooks/useAiStream'
import { useAiStore } from '../../store/aiStore'
import { SYSTEM_PROMPTS } from '../../lib/prompt-templates'
import { StreamingText } from './StreamingText'
import type { AiMessage } from '../../types/ai.types'

export function AiChat() {
  const [input, setInput] = useState('')
  const { stream, getContext } = useAiStream()
  const { chatHistory, addMessage, isStreaming, currentStreamContent, clearChatHistory } = useAiStore()
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, currentStreamContent])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || isStreaming) return
    setInput('')

    const ctx = getContext()

    // Add user message
    addMessage({ role: 'user', content: text, mode: 'chat' })

    // Build messages for API
    const messages = [
      ...chatHistory.map(m => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content: text },
    ]

    const systemPrompt = SYSTEM_PROMPTS.MENTOR(ctx.level, ctx.fileName, ctx.code)

    const response = await stream({ systemPrompt, messages })
    addMessage({ role: 'assistant', content: response, mode: 'chat' })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Messages */}
      <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
        {chatHistory.length === 0 && !isStreaming && (
          <WelcomeMessage />
        )}

        {chatHistory.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* Streaming response */}
        {isStreaming && currentStreamContent && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <AiAvatar />
            <div style={{
              flex: 1,
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              padding: '10px 12px',
            }}>
              <StreamingText content={currentStreamContent} isStreaming />
            </div>
          </div>
        )}

        {isStreaming && !currentStreamContent && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px', paddingLeft: '4px' }}>
            <AiAvatar />
            <ThinkingDots />
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Controls */}
      {chatHistory.length > 0 && (
        <div style={{
          padding: '0 12px 4px',
          display: 'flex',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={clearChatHistory}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text-dim)',
              fontSize: '11px',
              cursor: 'pointer',
              padding: '2px 6px',
            }}
          >
            Clear chat
          </button>
        </div>
      )}

      {/* Input */}
      <div style={{
        padding: '8px 12px',
        borderTop: '1px solid var(--color-border)',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex',
          gap: '6px',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          padding: '6px 8px',
          transition: 'border-color 0.15s',
        }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent)' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)' }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your Java mentor... (Enter to send, Shift+Enter for new line)"
            disabled={isStreaming}
            rows={1}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--color-text)',
              fontSize: '13px',
              resize: 'none',
              lineHeight: '1.5',
              maxHeight: '100px',
              overflowY: 'auto',
              fontFamily: 'inherit',
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            style={{
              width: '28px',
              height: '28px',
              background: input.trim() && !isStreaming ? 'var(--color-accent)' : 'var(--color-surface-2)',
              border: 'none',
              borderRadius: '6px',
              color: input.trim() && !isStreaming ? '#0d0d0d' : 'var(--color-text-dim)',
              cursor: input.trim() && !isStreaming ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              alignSelf: 'flex-end',
              transition: 'all 0.15s',
            }}
          >
            ↑
          </button>
        </div>
        <div style={{ fontSize: '10px', color: 'var(--color-text-dim)', marginTop: '4px', textAlign: 'center' }}>
          Context-aware: AI sees your current file
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: AiMessage }) {
  const isUser = message.role === 'user'
  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      marginBottom: '12px',
      flexDirection: isUser ? 'row-reverse' : 'row',
    }}>
      {isUser ? (
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: 'var(--color-accent)',
          color: '#0d0d0d',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '13px',
          fontWeight: 700,
          flexShrink: 0,
        }}>U</div>
      ) : <AiAvatar />}
      <div style={{
        maxWidth: '85%',
        background: isUser ? 'var(--color-accent)22' : 'var(--color-surface)',
        border: `1px solid ${isUser ? 'var(--color-accent)44' : 'var(--color-border)'}`,
        borderRadius: '8px',
        padding: '10px 12px',
      }}>
        {isUser ? (
          <div style={{ fontSize: '13px', color: 'var(--color-text)', whiteSpace: 'pre-wrap' }}>
            {message.content}
          </div>
        ) : (
          <StreamingText content={message.content} />
        )}
      </div>
    </div>
  )
}

function AiAvatar() {
  return (
    <div style={{
      width: '28px',
      height: '28px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-2))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      color: '#0d0d0d',
      fontWeight: 700,
      flexShrink: 0,
    }}>✦</div>
  )
}

function ThinkingDots() {
  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '4px 0' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: '6px', height: '6px',
          borderRadius: '50%',
          background: 'var(--color-accent)',
          animation: `pulse 1s infinite ${i * 0.2}s`,
        }} />
      ))}
    </div>
  )
}

function WelcomeMessage() {
  return (
    <div style={{
      textAlign: 'center',
      padding: '24px 12px',
      color: 'var(--color-text-muted)',
    }}>
      <div style={{ fontSize: '32px', marginBottom: '12px' }}>✦</div>
      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-accent)', marginBottom: '8px' }}>
        Java AI Mentor
      </div>
      <div style={{ fontSize: '12px', lineHeight: 1.7, color: 'var(--color-text-dim)' }}>
        Ask me anything about Java.<br />
        I can see your current code and<br />
        adapt explanations to your level.
      </div>
    </div>
  )
}
