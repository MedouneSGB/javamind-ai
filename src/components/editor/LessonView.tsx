import { getLessonContent } from '../../lib/lesson-content'
import { useLangStore } from '../../store/langStore'
import { useEditorStore } from '../../store/editorStore'
import { useAiStore } from '../../store/aiStore'
import { useLearningStore } from '../../store/learningStore'
import { Zap, BookOpen, Lightbulb, CheckCircle2, Code2, Info } from 'lucide-react'
import type { LessonSection } from '../../lib/lesson-content'

export function LessonView({ lessonId }: { lessonId: string }) {
  const lesson = getLessonContent(lessonId)
  const { lang, t } = useLangStore()
  const { openChallenge } = useEditorStore()
  const { setMode, setPanelOpen } = useAiStore()
  const { setCurrentTopic } = useLearningStore()

  if (!lesson) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)' }}>
        Lesson not found: {lessonId}
      </div>
    )
  }

  const sections = lesson.sections[lang]
  const title = lang === 'fr' ? lesson.titleFr : lesson.titleEn
  const desc  = lang === 'fr' ? lesson.descFr  : lesson.descEn
  const boilerplate = lang === 'fr' ? lesson.challengeBoilerplateFr : lesson.challengeBoilerplateEn

  const handleStartChallenge = () => {
    openChallenge(lessonId, boilerplate, title)
    setCurrentTopic(lessonId)
    setMode('challenge')
    setPanelOpen(true)
  }

  return (
    <div style={{
      height: '100%',
      overflowY: 'auto',
      background: 'var(--color-bg)',
    }}>
      <div style={{
        maxWidth: '720px',
        margin: '0 auto',
        padding: '40px 32px 80px',
      }}>

        {/* ── Header ─────────────────────────────────────────── */}
        <div style={{ marginBottom: '36px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            color: 'var(--color-accent)',
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
            fontWeight: 600,
            marginBottom: '12px',
          }}>
            <BookOpen size={12} />
            {lang === 'fr' ? 'Cours' : 'Lesson'}
          </div>
          <h1 style={{
            fontSize: '26px',
            fontWeight: 700,
            color: 'var(--color-text)',
            margin: '0 0 8px',
            lineHeight: 1.3,
          }}>
            {title}
          </h1>
          <p style={{
            fontSize: '14px',
            color: 'var(--color-text-muted)',
            margin: 0,
            lineHeight: 1.6,
          }}>
            {desc}
          </p>
          <div style={{
            marginTop: '16px',
            height: '1px',
            background: 'var(--color-border)',
          }} />
        </div>

        {/* ── Sections ───────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {sections.map((section, i) => (
            <SectionBlock key={i} section={section} />
          ))}
        </div>

        {/* ── Start Challenge button ─────────────────────────── */}
        <div style={{
          marginTop: '48px',
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(212,165,116,0.08), rgba(74,155,111,0.08))',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
            {lang === 'fr'
              ? 'Vous avez assimilé le cours ? Testez vos connaissances !'
              : 'Absorbed the lesson? Time to test your skills!'}
          </div>
          <button
            onClick={handleStartChallenge}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 28px',
              background: 'var(--color-accent)',
              color: '#0d0d0d',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'opacity 0.15s, transform 0.1s',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <Zap size={16} />
            {lang === 'fr' ? 'Commencer le défi' : 'Start Challenge'}
          </button>
        </div>

      </div>
    </div>
  )
}

// ── Individual section renderers ─────────────────────────────

function SectionBlock({ section }: { section: LessonSection }) {
  switch (section.type) {
    case 'intro':      return <IntroBlock section={section} />
    case 'concept':    return <ConceptBlock section={section} />
    case 'code':       return <CodeBlock section={section} />
    case 'tip':        return <TipBlock section={section} />
    case 'keypoints':  return <KeypointsBlock section={section} />
    default:           return null
  }
}

function IntroBlock({ section }: { section: LessonSection }) {
  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      padding: '16px',
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: '8px',
    }}>
      <Info size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0, marginTop: '2px' }} />
      <p style={{
        margin: 0,
        fontSize: '14px',
        color: 'var(--color-text)',
        lineHeight: 1.7,
      }}>
        {section.text}
      </p>
    </div>
  )
}

function ConceptBlock({ section }: { section: LessonSection }) {
  return (
    <div style={{
      borderLeft: '3px solid var(--color-accent)',
      paddingLeft: '16px',
    }}>
      {section.title && (
        <div style={{
          fontSize: '13px',
          fontWeight: 700,
          color: 'var(--color-accent)',
          marginBottom: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          {section.title}
        </div>
      )}
      <p style={{
        margin: 0,
        fontSize: '14px',
        color: 'var(--color-text)',
        lineHeight: 1.8,
        whiteSpace: 'pre-line',
      }}>
        {section.text}
      </p>
    </div>
  )
}

function CodeBlock({ section }: { section: LessonSection }) {
  return (
    <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
      {section.title && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 14px',
          background: 'var(--color-surface-2)',
          borderBottom: '1px solid var(--color-border)',
          fontSize: '12px',
          color: 'var(--color-text-muted)',
          fontWeight: 500,
        }}>
          <Code2 size={12} />
          {section.title}
        </div>
      )}
      <pre style={{
        margin: 0,
        padding: '16px',
        background: '#0a0a0a',
        overflowX: 'auto',
        fontSize: '13px',
        fontFamily: 'Consolas, "Cascadia Code", "Fira Code", monospace',
        color: '#d4d4d4',
        lineHeight: 1.6,
      }}>
        <code>{section.code}</code>
      </pre>
    </div>
  )
}

function TipBlock({ section }: { section: LessonSection }) {
  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      padding: '14px 16px',
      background: 'rgba(212,165,116,0.08)',
      border: '1px solid rgba(212,165,116,0.3)',
      borderRadius: '8px',
    }}>
      <Lightbulb size={16} style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: '2px' }} />
      <p style={{
        margin: 0,
        fontSize: '13px',
        color: 'var(--color-text)',
        lineHeight: 1.7,
      }}>
        {section.text}
      </p>
    </div>
  )
}

function KeypointsBlock({ section }: { section: LessonSection }) {
  return (
    <div style={{
      padding: '16px',
      background: 'rgba(74,155,111,0.06)',
      border: '1px solid rgba(74,155,111,0.25)',
      borderRadius: '8px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '12px',
        fontWeight: 700,
        color: 'var(--color-success)',
        marginBottom: '12px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}>
        <CheckCircle2 size={14} />
        {section.title ?? 'Points clés'}
      </div>
      <ul style={{ margin: 0, padding: '0 0 0 4px', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {section.points?.map((point, i) => (
          <li key={i} style={{ display: 'flex', gap: '10px', fontSize: '13px', color: 'var(--color-text)', lineHeight: 1.6 }}>
            <span style={{ color: 'var(--color-success)', flexShrink: 0, marginTop: '1px' }}>✓</span>
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
