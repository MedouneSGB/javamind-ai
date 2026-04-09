import { useState, useRef, useEffect } from 'react'
import { Send, KeyRound, Square } from 'lucide-react'
import { useAiStream } from '../../hooks/useAiStream'
import { useAiStore, type AiProvider, type ModelEntry } from '../../store/aiStore'
import { useLangStore } from '../../store/langStore'
import { ipc } from '../../lib/ipc'
import { isElectron } from '../../lib/platform'
import { getWebKey, setWebKey, hasWebKey } from '../../lib/web-keys'
import { SYSTEM_PROMPTS } from '../../lib/prompt-templates'
import { StreamingText } from './StreamingText'
import type { AiMessage } from '../../types/ai.types'

const DEFAULT_MODELS: Record<AiProvider, ModelEntry[]> = {
  gemini: [{ id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' }],
}

export function AiChat() {
  const [input, setInput] = useState('')
  const [loadingModels, setLoadingModels] = useState(false)
  const [testingModels, setTestingModels] = useState(false)
  const [webKeyDraft, setWebKeyDraft] = useState('')
  const [showKeyInput, setShowKeyInput] = useState(false)
  const { stream, abort, getContext } = useAiStream()
  const {
    chatHistory, addMessage, isStreaming, currentStreamContent, clearChatHistory,
    aiProvider, aiModel, setAiModel,
    getModelCache, setModelCache, updateModelStatus, isCacheValid,
  } = useAiStore()
  const { t } = useLangStore()
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Web : check if API key/URL is present
  const webKeyMissing = !isElectron && !hasWebKey(aiProvider)

  // Derive models + status from store cache
  const cache = getModelCache(aiProvider)
  const models: ModelEntry[] = cache?.models ?? DEFAULT_MODELS[aiProvider]
  const modelStatus: Record<string, boolean | null> = cache?.status ?? {}

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, currentStreamContent])

  useEffect(() => {
    // If cache is still valid, use it immediately — no fetch needed
    if (isCacheValid(aiProvider)) {
      // Ensure selected model is in the list
      const cached = getModelCache(aiProvider)!
      const exists = cached.models.some(m => m.id === aiModel)
      if (!exists) setAiModel(cached.models[0].id)
      return
    }

    // Cache is stale or missing — fetch from API
    setLoadingModels(true)
    ipc.ai.getModels(aiProvider).then((result) => {
      const list = result && result.length > 0 ? result : DEFAULT_MODELS[aiProvider]
      setModelCache(aiProvider, list) // marks all as null (pending)

      // Keep current model if it's in the new list, otherwise reset to first
      const currentInList = list.some(m => m.id === aiModel)
      if (!currentInList) setAiModel(list[0].id)

      setLoadingModels(false)

      // Silently test all models in parallel
      setTestingModels(true)
      ipc.ai.testModels(aiProvider, list.map(m => m.id)).then((results) => {
        updateModelStatus(aiProvider, results)
        setTestingModels(false)
        // Auto-switch if current model is unavailable
        const currentOk = results[aiModel]
        if (currentOk === false) {
          const firstOk = list.find(m => results[m.id] === true)
          if (firstOk) setAiModel(firstOk.id)
        }
      }).catch(() => setTestingModels(false))
    }).catch(() => {
      setModelCache(aiProvider, DEFAULT_MODELS[aiProvider])
      setLoadingModels(false)
    })
  }, [aiProvider])

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
            {t('clearChat')}
          </button>
        </div>
      )}

      {/* Bandeau clé API / URL manquante (web uniquement) */}
      {webKeyMissing && (
        <div style={{
          margin: '0 12px 8px',
          padding: '10px 12px',
          background: 'var(--color-warning)18',
          border: '1px solid var(--color-warning)44',
          borderRadius: '8px',
          fontSize: '12px',
          color: 'var(--color-text-muted)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: showKeyInput ? '8px' : 0 }}>
            <KeyRound size={13} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
            <span>
              {'Clé API'}{' '}
              <strong style={{ color: 'var(--color-text)' }}>{aiProvider}</strong> requise.{' '}
              <button
                onClick={() => { setShowKeyInput(v => !v); setWebKeyDraft(getWebKey(aiProvider)) }}
                style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', fontSize: '12px', fontWeight: 600, padding: 0 }}
              >
                {showKeyInput ? 'Annuler' : 'Configurer →'}
              </button>
            </span>
          </div>
          {showKeyInput && (
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type="password"
                value={webKeyDraft}
                onChange={(e) => setWebKeyDraft(e.target.value)}
                placeholder={`Colle ta clé ${aiProvider} ici…`}
                autoFocus
                style={{
                  flex: 1, padding: '5px 8px',
                  background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                  borderRadius: '6px', color: 'var(--color-text)', fontSize: '12px', outline: 'none',
                }}
              />
              <button
                onClick={() => { setWebKey(aiProvider, webKeyDraft); setShowKeyInput(false); setWebKeyDraft('') }}
                disabled={!webKeyDraft.trim()}
                style={{
                  padding: '5px 10px', background: 'var(--color-accent)', border: 'none',
                  borderRadius: '6px', color: '#0d0d0d', fontSize: '12px', fontWeight: 600,
                  cursor: webKeyDraft.trim() ? 'pointer' : 'not-allowed', opacity: webKeyDraft.trim() ? 1 : 0.5,
                }}
              >
                Sauver
              </button>
            </div>
          )}
        </div>
      )}

      {/* Input */}
      <div style={{
        padding: '8px 12px',
        borderTop: '1px solid var(--color-border)',
        flexShrink: 0,
      }}>
        {/* Provider + Model row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
          {/* Provider label */}
          <div style={{
            padding: '2px 9px',
            background: 'var(--color-accent)',
            borderRadius: '6px',
            fontSize: '10px',
            fontWeight: 600,
            color: '#0d0d0d',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}>
            ✦ Gemini Flash
          </div>
          {/* Model select */}
          <select
            value={aiModel}
            onChange={(e) => setAiModel(e.target.value)}
            disabled={loadingModels || isStreaming}
            title={testingModels ? t('checkingModels') : t('chooseModel')}
            style={{
              flex: 1,
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '6px',
              color: 'var(--color-text)',
              fontSize: '11px',
              padding: '3px 6px',
              cursor: loadingModels ? 'wait' : 'pointer',
              outline: 'none',
              opacity: loadingModels ? 0.7 : 1,
              minWidth: 0,
            }}
          >
            {models.map(m => {
              const status = modelStatus[m.id]
              const icon = status === null ? '○' : status === true ? '✓' : '✗'
              const label = `${icon} ${m.label}`
              return (
                <option key={m.id} value={m.id} disabled={status === false}>
                  {label}
                </option>
              )
            })}
          </select>
          {/* Status indicator dot */}
          {testingModels && (
            <div title={t('testingModels')} style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: 'var(--color-accent)', flexShrink: 0,
              animation: 'pulse 1s infinite',
            }} />
          )}
        </div>

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
            onChange={(e) => {
              setInput(e.target.value)
              // Auto-grow
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
            }}
            onKeyDown={handleKeyDown}
            placeholder={t('chatPlaceholder')}
            disabled={isStreaming}
            rows={3}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--color-text)',
              fontSize: '13px',
              resize: 'none',
              lineHeight: '1.6',
              minHeight: '60px',
              maxHeight: '160px',
              overflowY: 'auto',
              fontFamily: 'inherit',
            }}
          />
          {isStreaming ? (
            <button
              onClick={abort}
              title="Arrêter la génération"
              style={{
                width: '28px',
                height: '28px',
                background: 'var(--color-error)',
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                alignSelf: 'flex-end',
                transition: 'all 0.15s',
              }}
            >
              <Square size={11} fill="currentColor" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              style={{
                width: '28px',
                height: '28px',
                background: input.trim() ? 'var(--color-accent)' : 'var(--color-surface-2)',
                border: 'none',
                borderRadius: '6px',
                color: input.trim() ? '#0d0d0d' : 'var(--color-text-dim)',
                cursor: input.trim() ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                alignSelf: 'flex-end',
                transition: 'all 0.15s',
              }}
            >
              <Send size={13}/>
            </button>
          )}
        </div>
        <div style={{ fontSize: '10px', color: 'var(--color-text-dim)', marginTop: '4px', textAlign: 'center' }}>
          {t('contextAware')}
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
  const { t } = useLangStore()
  return (
    <div style={{
      textAlign: 'center',
      padding: '24px 12px',
      color: 'var(--color-text-muted)',
    }}>
      <div style={{ fontSize: '32px', marginBottom: '12px' }}>✦</div>
      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-accent)', marginBottom: '8px' }}>
        {t('mentorTitle')}
      </div>
      <div style={{ fontSize: '12px', lineHeight: 1.7, color: 'var(--color-text-dim)' }}>
        {t('mentorDesc1')}<br />
        {t('mentorDesc2')}<br />
        {t('mentorDesc3')}
      </div>
    </div>
  )
}
