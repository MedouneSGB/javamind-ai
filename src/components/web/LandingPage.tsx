import { Sparkles, Target, MessageCircle, Briefcase, Sun, Moon } from 'lucide-react'
import type { ReactNode } from 'react'
import { useThemeStore } from '../../store/themeStore'

interface LandingPageProps {
  onGetStarted: () => void
}

const FEATURES: { icon: ReactNode; label: string; desc: string }[] = [
  { icon: <Sparkles size={20} />,      label: 'Mentor IA',         desc: 'Aide contextuelle en temps réel' },
  { icon: <Target size={20} />,        label: 'Défis adaptatifs',   desc: 'Exercices selon ton niveau'      },
  { icon: <MessageCircle size={20} />, label: 'Rubber Duck',        desc: 'Debug par questions Socratiques' },
  { icon: <Briefcase size={20} />,     label: 'Entretiens',         desc: 'Simulation Junior → Senior'      },
]

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const { theme, toggleTheme } = useThemeStore()
  const isDark = theme === 'dark'

  return (
    <div style={{
      height: '100%',
      background: 'var(--color-bg)',
      color: 'var(--color-text)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'inherit',
      overflowY: 'auto',
    }}>

      {/* Nav */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 32px',
        borderBottom: '1px solid var(--color-border)',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        background: 'var(--color-bg)',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <img src="/logo.png" alt="JavaMind" style={{ width: 26, height: 26 }} />
          <span style={{ fontSize: '15px', fontWeight: 700 }}>
            JavaMind <span style={{ color: 'var(--color-accent)' }}>AI</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={toggleTheme}
            title={isDark ? 'Mode clair' : 'Mode sombre'}
            style={{
              width: '32px', height: '32px',
              background: 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.color = 'var(--color-accent)' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-muted)' }}
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button
            onClick={onGetStarted}
            style={{
              padding: '7px 18px',
              background: 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              color: 'var(--color-text)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-accent)'
              e.currentTarget.style.color = 'var(--color-accent)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)'
              e.currentTarget.style.color = 'var(--color-text)'
            }}
          >
            Se connecter
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px 80px',
        textAlign: 'center',
        gap: '28px',
      }}>

        {/* Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '5px 14px',
          background: 'rgba(212,165,116,0.1)',
          border: '1px solid rgba(212,165,116,0.3)',
          borderRadius: '20px',
          fontSize: '12px',
          color: 'var(--color-accent)',
          fontWeight: 600,
          letterSpacing: '0.02em',
        }}>
          ✦ Propulsé par Claude AI
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 'clamp(30px, 6vw, 56px)',
          fontWeight: 800,
          lineHeight: 1.12,
          margin: 0,
          maxWidth: '660px',
          letterSpacing: '-0.02em',
        }}>
          L'IDE Java avec{' '}
          <span style={{ color: 'var(--color-accent)' }}>IA intégrée</span>
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: 'clamp(14px, 2vw, 16px)',
          color: 'var(--color-text-muted)',
          margin: 0,
          maxWidth: '460px',
          lineHeight: 1.75,
        }}>
          Codez, apprenez et progressez avec un mentor IA contextuel.
          Défis adaptatifs, revue de code, simulation d'entretiens techniques.
        </p>

        {/* CTA */}
        <button
          onClick={onGetStarted}
          style={{
            padding: '14px 36px',
            background: 'var(--color-accent)',
            border: 'none',
            borderRadius: '10px',
            color: '#0d0d0d',
            fontSize: '15px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            letterSpacing: '0.01em',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.88'
            e.currentTarget.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1'
            e.currentTarget.style.transform = 'none'
          }}
        >
          Commencer gratuitement
          <span style={{ fontSize: '17px' }}>→</span>
        </button>

        {/* Divider */}
        <div style={{
          width: '1px',
          height: '32px',
          background: 'var(--color-border)',
          opacity: 0.5,
        }} />

        {/* Feature cards */}
        <div style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: '700px',
        }}>
          {FEATURES.map(f => (
            <div key={f.label} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 18px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              textAlign: 'left',
              minWidth: '170px',
              flex: '1 1 160px',
              maxWidth: '200px',
            }}>
              <span style={{ color: 'var(--color-accent)', flexShrink: 0, display: 'flex' }}>{f.icon}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-text)' }}>
                  {f.label}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  {f.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
