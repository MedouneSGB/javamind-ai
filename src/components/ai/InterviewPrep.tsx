import { useState } from 'react'
import { useAiStream } from '../../hooks/useAiStream'
import { useAiStore } from '../../store/aiStore'
import { Briefcase, Send } from 'lucide-react'
import { useLearningStore } from '../../store/learningStore'
import { SYSTEM_PROMPTS } from '../../lib/prompt-templates'
import { StreamingText } from './StreamingText'
import type { AiMessage } from '../../types/ai.types'

const TOPIC_OPTIONS = ['Core Java', 'OOP', 'Collections', 'Streams & Lambdas', 'Concurrency', 'Design Patterns', 'Algorithms', 'Spring Framework']

export function InterviewPrep() {
  const { stream } = useAiStream()
  const { isStreaming, currentStreamContent } = useAiStore()
  const { } = useLearningStore()
  const [level, setLevel] = useState<'junior' | 'mid' | 'senior'>('junior')
  const [topics, setTopics] = useState<string[]>(['Core Java', 'OOP'])
  const [messages, setMessages] = useState<AiMessage[]>([])
  const [input, setInput] = useState('')
  const [isActive, setIsActive] = useState(false)

  const startInterview = async () => {
    setIsActive(true)
    const systemPrompt = SYSTEM_PROMPTS.INTERVIEW_PREP(level, topics)
    const response = await stream({
      systemPrompt,
      messages: [{ role: 'user', content: 'Start the interview.' }],
    })
    const aiMsg: AiMessage = {
      id: crypto.randomUUID(), role: 'assistant', content: response,
      timestamp: Date.now(), mode: 'interview',
    }
    setMessages([aiMsg])
  }

  const handleAnswer = async () => {
    const text = input.trim()
    if (!text || isStreaming) return
    setInput('')

    const userMsg: AiMessage = {
      id: crypto.randomUUID(), role: 'user', content: text,
      timestamp: Date.now(), mode: 'interview',
    }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)

    const systemPrompt = SYSTEM_PROMPTS.INTERVIEW_PREP(level, topics)
    const response = await stream({
      systemPrompt,
      messages: newMessages.map(m => ({ role: m.role, content: m.content })),
    })

    const aiMsg: AiMessage = {
      id: crypto.randomUUID(), role: 'assistant', content: response,
      timestamp: Date.now(), mode: 'interview',
    }
    setMessages(prev => [...prev, aiMsg])
  }

  const toggleTopic = (t: string) => {
    setTopics(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  if (!isActive) {
    return (
      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-accent)' }}>
          <Briefcase size={13}/> Interview Prep
        </div>
        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
          Mock Java technical interview. AI provides real feedback and scores your answers.
        </div>

        {/* Level */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-dim)', marginBottom: '5px' }}>
            LEVEL
          </div>
          <div style={{ display: 'flex', gap: '5px' }}>
            {(['junior', 'mid', 'senior'] as const).map(l => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                style={{
                  flex: 1, padding: '6px',
                  background: level === l ? 'var(--color-accent)22' : 'var(--color-surface)',
                  border: `1px solid ${level === l ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  borderRadius: '5px',
                  color: level === l ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  fontSize: '12px', cursor: 'pointer', textTransform: 'capitalize',
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Topics */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-dim)', marginBottom: '5px' }}>
            TOPICS
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {TOPIC_OPTIONS.map(t => (
              <button
                key={t}
                onClick={() => toggleTopic(t)}
                style={{
                  padding: '3px 8px',
                  background: topics.includes(t) ? 'var(--color-accent)22' : 'transparent',
                  border: `1px solid ${topics.includes(t) ? 'var(--color-accent)44' : 'var(--color-border)'}`,
                  borderRadius: '12px',
                  color: topics.includes(t) ? 'var(--color-accent)' : 'var(--color-text-dim)',
                  fontSize: '11px', cursor: 'pointer',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={startInterview}
          disabled={topics.length === 0}
          style={{
            padding: '10px',
            background: 'var(--color-accent)22',
            border: '1px solid var(--color-accent)44',
            borderRadius: '8px',
            color: 'var(--color-accent)',
            fontSize: '14px', fontWeight: 600,
            cursor: topics.length === 0 ? 'not-allowed' : 'pointer',
            opacity: topics.length === 0 ? 0.5 : 1,
          }}
        >
          <Briefcase size={12}/> Start Interview
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        padding: '6px 12px',
        background: 'var(--color-surface-2)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
        fontSize: '11px',
      }}>
        <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>💼 Interview — {level.charAt(0).toUpperCase() + level.slice(1)}</span>
        <button
          onClick={() => { setIsActive(false); setMessages([]) }}
          style={{ background: 'transparent', border: 'none', color: 'var(--color-text-dim)', cursor: 'pointer', fontSize: '11px' }}
        >
          End Session
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {messages.map(msg => (
          <div key={msg.id} style={{
            padding: '8px 10px',
            background: msg.role === 'user' ? 'var(--color-accent)11' : 'var(--color-surface)',
            border: `1px solid ${msg.role === 'user' ? 'var(--color-accent)33' : 'var(--color-border)'}`,
            borderRadius: '8px',
          }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: msg.role === 'user' ? 'var(--color-accent)' : 'var(--color-text-dim)', marginBottom: '4px' }}>
              {msg.role === 'user' ? 'YOUR ANSWER' : '💼 INTERVIEWER'}
            </div>
            {msg.role === 'user'
              ? <div style={{ fontSize: '12.5px', color: 'var(--color-text)', whiteSpace: 'pre-wrap' }}>{msg.content}</div>
              : <StreamingText content={msg.content} />
            }
          </div>
        ))}
        {isStreaming && currentStreamContent && (
          <div style={{ padding: '8px 10px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-dim)', marginBottom: '4px' }}>💼 INTERVIEWER</div>
            <StreamingText content={currentStreamContent} isStreaming />
          </div>
        )}
      </div>

      <div style={{ padding: '8px 12px', borderTop: '1px solid var(--color-border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAnswer() } }}
            placeholder="Your answer... (Enter to submit)"
            disabled={isStreaming}
            rows={2}
            style={{
              flex: 1,
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '6px',
              padding: '7px 10px',
              color: 'var(--color-text)',
              fontSize: '12.5px',
              outline: 'none',
              resize: 'none',
              fontFamily: 'inherit',
            }}
          />
          <button
            onClick={handleAnswer}
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
      </div>
    </div>
  )
}
