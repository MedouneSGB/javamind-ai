import { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import { useLangStore } from '../../store/langStore'
import { useAiStore } from '../../store/aiStore'
import { AiPanel } from '../ai/AiPanel'
import { EditorPane } from '../editor/EditorPane'
import { LearningNav } from '../sidebar/LearningNav'
import { AuthModal } from '../auth/AuthModal'
import { Sparkles, Code2, BookOpen, User, Sun, Moon } from 'lucide-react'

type MobileTab = 'ai' | 'code' | 'learn'

export function MobileShell() {
  const [activeTab, setActiveTab] = useState<MobileTab>('ai')
  const { setAuthModalOpen, user, profile, session } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const { lang } = useLangStore()
  const { setPanelOpen } = useAiStore()

  const isLoggedIn = !!session && !!user
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url
  const isDark = theme === 'dark'

  // AiPanel vérifie isPanelOpen → on le force ouvert sur mobile
  useEffect(() => {
    setPanelOpen(true)
  }, [setPanelOpen])

  const tabLabels = {
    ai:    lang === 'fr' ? 'IA' : 'AI',
    code:  'Code',
    learn: lang === 'fr' ? 'Cours' : 'Learn',
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',   // hérite de #root qui fait déjà height:100% (=100vh)
      background: 'var(--color-bg)',
      overflow: 'hidden',
    }}>
      <AuthModal />

      {/* ── Mobile Header ── */}
      <div style={{
        height: '48px',
        background: 'var(--color-bg-2)',
        borderBottom: '1px solid var(--color-border-2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 14px',
        flexShrink: 0,
      }}>
        {/* Logo + titre */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <svg width="22" height="22" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
            <rect width="256" height="256" rx="52" fill="#F0E4CC"/>
            <path d="M90 100 Q96 82 90 65" stroke="#7B4F2E" strokeWidth="10" fill="none" strokeLinecap="round"/>
            <path d="M118 100 Q124 82 118 65" stroke="#7B4F2E" strokeWidth="10" fill="none" strokeLinecap="round"/>
            <path d="M146 100 Q152 82 146 65" stroke="#7B4F2E" strokeWidth="10" fill="none" strokeLinecap="round"/>
            <path d="M68 116 L188 116 L176 196 Q172 210 158 210 L98 210 Q84 210 80 196 Z" fill="#7B4F2E"/>
            <path d="M182 130 Q218 130 218 163 Q218 196 182 196" stroke="#7B4F2E" strokeWidth="16" fill="none" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text)', letterSpacing: '0.2px' }}>
            JavaMind <span style={{ color: 'var(--color-accent)' }}>AI</span>
          </span>
        </div>

        {/* Contrôles droite */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            style={{
              width: '40px', height: '40px',
              background: 'transparent', border: 'none',
              color: 'var(--color-text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', borderRadius: '10px',
              transition: 'background 0.15s',
            }}
            onTouchStart={(e) => { e.currentTarget.style.background = 'var(--color-surface)' }}
            onTouchEnd={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            {isDark ? <Sun size={18}/> : <Moon size={18}/>}
          </button>

          {/* Compte utilisateur */}
          <button
            onClick={() => setAuthModalOpen(true)}
            title={isLoggedIn ? 'Mon compte' : 'Se connecter'}
            style={{
              width: '36px', height: '36px',
              background: isLoggedIn ? 'var(--color-accent)22' : 'transparent',
              border: isLoggedIn ? '1px solid var(--color-accent)55' : '1px solid var(--color-border)',
              borderRadius: '50%',
              color: isLoggedIn ? 'var(--color-accent)' : 'var(--color-text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', overflow: 'hidden',
            }}
          >
            {isLoggedIn && avatarUrl
              ? <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <User size={16}/>
            }
          </button>
        </div>
      </div>

      {/* ── Contenu principal ── */}
      {/* Les 3 panneaux restent montés (display:none au lieu d'unmount)
          → préserve le state de l'éditeur Monaco, de l'AI chat, etc. */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', position: 'relative' }}>

        {/* IA — panneau plein écran */}
        <div style={{
          position: 'absolute', inset: 0,
          display: activeTab === 'ai' ? 'flex' : 'none',
          flexDirection: 'column',
        }}>
          <AiPanel />
        </div>

        {/* Code — éditeur Monaco */}
        <div style={{
          position: 'absolute', inset: 0,
          display: activeTab === 'code' ? 'flex' : 'none',
          flexDirection: 'column',
        }}>
          <EditorPane />
        </div>

        {/* Cours — curriculum d'apprentissage */}
        <div style={{
          position: 'absolute', inset: 0,
          display: activeTab === 'learn' ? 'flex' : 'none',
          flexDirection: 'column',
          overflow: 'auto',
          background: 'var(--color-bg-2)',
        }}>
          <LearningNav />
        </div>
      </div>

      {/* ── Bottom Navigation ── */}
      <nav style={{
        minHeight: '56px',
        background: 'var(--color-bg-2)',
        borderTop: '1px solid var(--color-border-2)',
        display: 'flex',
        flexShrink: 0,
        // Safe-area-inset pour le home indicator iPhone
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        <NavTab
          active={activeTab === 'ai'}
          onClick={() => setActiveTab('ai')}
          icon={<Sparkles size={22}/>}
          label={tabLabels.ai}
        />
        <NavTab
          active={activeTab === 'code'}
          onClick={() => setActiveTab('code')}
          icon={<Code2 size={22}/>}
          label={tabLabels.code}
        />
        <NavTab
          active={activeTab === 'learn'}
          onClick={() => setActiveTab('learn')}
          icon={<BookOpen size={22}/>}
          label={tabLabels.learn}
        />
      </nav>
    </div>
  )
}

// ── Onglet de navigation bas ────────────────────────────────────────────────

function NavTab({ active, onClick, icon, label }: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        height: '56px',
        background: 'transparent',
        border: 'none',
        borderTop: `2px solid ${active ? 'var(--color-accent)' : 'transparent'}`,
        color: active ? 'var(--color-accent)' : 'var(--color-text-dim)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '3px',
        transition: 'color 0.15s',
        WebkitTapHighlightColor: 'transparent',
      } as React.CSSProperties}
      // Feedback tactile sur appui
      onTouchStart={(e) => { if (!active) e.currentTarget.style.background = 'var(--color-surface)' }}
      onTouchEnd={(e) => { e.currentTarget.style.background = 'transparent' }}
    >
      {icon}
      <span style={{
        fontSize: '10px',
        fontWeight: active ? 600 : 400,
        letterSpacing: '0.3px',
        textTransform: 'uppercase',
      }}>
        {label}
      </span>
    </button>
  )
}
