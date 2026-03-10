/**
 * AdminPage — Tableau de bord d'administration JavaMind AI
 * Accès : naviguer vers /admin (web uniquement, utilisateurs admin uniquement)
 * Configurer VITE_ADMIN_EMAILS=email@exemple.com dans .env
 */
import { useState, useEffect } from 'react'
import {
  LayoutDashboard, Users, BarChart2, Layers, BookOpen,
  Sparkles, Target, MessageCircle, Briefcase, Search, AlertCircle,
  LogOut, TrendingUp, Shield,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { supabase } from '../../lib/supabase'
import { isAdminUser } from '../../lib/admin'

export { isAdminUser }

// ── Types ──────────────────────────────────────────────────────────────────────

type AdminTab = 'overview' | 'users' | 'consumption' | 'services' | 'docs'

interface Profile {
  id: string
  username?: string | null
  avatar_url?: string | null
  email?: string | null
  created_at: string
  updated_at?: string | null
  provider?: string | null
  is_admin_flag?: boolean | null
}

interface DailyReg { day: string; count: number }

// ── Nav tabs ───────────────────────────────────────────────────────────────────

const TABS: { id: AdminTab; label: string; Icon: React.FC<{ size?: number }> }[] = [
  { id: 'overview',    label: "Vue d'ensemble", Icon: LayoutDashboard },
  { id: 'users',       label: 'Utilisateurs',   Icon: Users           },
  { id: 'consumption', label: 'Consommation IA', Icon: BarChart2      },
  { id: 'services',    label: 'Services',        Icon: Layers         },
  { id: 'docs',        label: 'Documentation',   Icon: BookOpen       },
]

// ── Root component ─────────────────────────────────────────────────────────────

interface AdminPageProps { onBack: () => void }

export function AdminPage({ onBack }: AdminPageProps) {
  const [tab, setTab] = useState<AdminTab>('overview')
  const { user, signOut } = useAuthStore()

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/'
  }

  return (
    <div style={{ height: '100%', display: 'flex', background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: 'inherit' }}>

      {/* ── Sidebar ── */}
      <aside style={{ width: 220, flexShrink: 0, borderRight: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <img src="/logo.png" alt="" style={{ width: 22, height: 22 }} />
            <span style={{ fontSize: '13px', fontWeight: 700 }}>
              JavaMind <span style={{ color: 'var(--color-accent)' }}>Admin</span>
            </span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.email}
          </div>
        </div>

        <nav style={{ flex: 1, padding: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {TABS.map(({ id, label, Icon }) => {
            const active = tab === id
            return (
              <button key={id} onClick={() => setTab(id)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 10px', borderRadius: '7px', border: 'none',
                background: active ? 'rgba(212,165,116,0.1)' : 'transparent',
                color: active ? 'var(--color-accent)' : 'var(--color-text-muted)',
                cursor: 'pointer', fontSize: '13px', fontWeight: active ? 600 : 400,
                textAlign: 'left', transition: 'all 0.12s',
              }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--color-surface)' }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}
              >
                <Icon size={14} />
                {label}
              </button>
            )
          })}
        </nav>

        <div style={{ padding: '10px', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <button onClick={onBack} style={{
            width: '100%', padding: '8px 10px', background: 'transparent',
            border: '1px solid var(--color-border)', borderRadius: '7px',
            color: 'var(--color-text-muted)', fontSize: '12px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px', transition: 'border-color 0.12s',
          }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-accent)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
          >
            ← Retour à l'app
          </button>
          <button onClick={handleSignOut} style={{
            width: '100%', padding: '8px 10px', background: 'transparent',
            border: '1px solid var(--color-border)', borderRadius: '7px',
            color: 'var(--color-text-muted)', fontSize: '12px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.12s',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-error, #ef4444)'; e.currentTarget.style.color = 'var(--color-error, #ef4444)' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-muted)' }}
          >
            <LogOut size={12} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
        {tab === 'overview'    && <OverviewTab />}
        {tab === 'users'       && <UsersTab />}
        {tab === 'consumption' && <ConsumptionTab />}
        {tab === 'services'    && <ServicesTab />}
        {tab === 'docs'        && <DocsTab />}
      </main>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Vue d'ensemble
// ─────────────────────────────────────────────────────────────────────────────

function OverviewTab() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [totalCount, setTotalCount]   = useState<number | null>(null)
  const [newLast7,  setNewLast7]      = useState<number | null>(null)
  const [newLast30, setNewLast30]     = useState<number | null>(null)
  const [dailyRegs, setDailyRegs]     = useState<DailyReg[]>([])
  const [loading, setLoading]         = useState(true)
  const [error,   setError]           = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    Promise.all([
      supabase.rpc('admin_get_profiles',      { p_limit: 8, p_offset: 0 }),
      supabase.rpc('admin_count_profiles'),
      supabase.rpc('admin_count_new_profiles', { p_days: 7 }),
      supabase.rpc('admin_count_new_profiles', { p_days: 30 }),
      supabase.rpc('admin_get_daily_registrations', { p_days: 14 }),
    ]).then(([
      { data, error: err },
      { data: total },
      { data: n7 },
      { data: n30 },
      { data: regs },
    ]) => {
      if (err) setError(err.message)
      else setProfiles((data as Profile[]) ?? [])
      if (typeof total === 'number') setTotalCount(total)
      if (typeof n7   === 'number') setNewLast7(n7)
      if (typeof n30  === 'number') setNewLast30(n30)
      if (Array.isArray(regs)) setDailyRegs(regs.map((r: any) => ({
        day: new Date(r.day).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
        count: Number(r.count),
      })))
      setLoading(false)
    })
  }, [])

  const fmt = (v: number | null) => loading ? '…' : (v != null ? String(v) : '—')

  return (
    <div>
      <PageTitle>Vue d'ensemble</PageTitle>

      {/* ── Stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '14px', marginBottom: '28px' }}>
        <StatCard label="Utilisateurs total"  value={fmt(totalCount)} />
        <StatCard label="Nouveaux (7 jours)"  value={fmt(newLast7)}  accent />
        <StatCard label="Nouveaux (30 jours)" value={fmt(newLast30)} />
        <StatCard label="Services IA actifs"  value="6" accent />
        <StatCard label="Modèles IA"          value="3" />
      </div>

      {/* ── Registration chart ── */}
      {dailyRegs.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <SectionTitle>Inscriptions — 14 derniers jours</SectionTitle>
          <MiniBarChart data={dailyRegs} />
        </div>
      )}

      {/* ── Recent users ── */}
      <SectionTitle>Inscriptions récentes</SectionTitle>
      {error && <RlsNotice table="profiles" />}
      <ProfileTable profiles={profiles} loading={loading} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Utilisateurs
// ─────────────────────────────────────────────────────────────────────────────

function UsersTab() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    // Fetch all profiles via admin RPC (joins auth.users for email, bypasses RLS)
    supabase.rpc('admin_get_profiles', { p_limit: 500, p_offset: 0 })
      .then(({ data, error: err }) => {
        if (err) setError(err.message)
        else setProfiles((data as Profile[]) ?? [])
        setLoading(false)
      })
  }, [])

  const filtered = profiles.filter(p =>
    !search ||
    p.email?.toLowerCase().includes(search.toLowerCase()) ||
    p.username?.toLowerCase().includes(search.toLowerCase()) ||
    p.provider?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <PageTitle>Utilisateurs</PageTitle>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: '8px',
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: '8px', padding: '8px 12px',
        }}>
          <Search size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
          <input
            type="text" placeholder="Rechercher par email ou nom…" value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--color-text)', fontSize: '13px' }}
          />
        </div>
        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
          {filtered.length} utilisateur{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {error && <RlsNotice table="profiles" />}
      <ProfileTable profiles={filtered} loading={loading} full />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Consommation IA
// ─────────────────────────────────────────────────────────────────────────────

const MODELS = [
  { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6', provider: 'Anthropic', color: '#c0764a' },
  { id: 'gemini-2.5-flash',  label: 'Gemini 2.5 Flash',  provider: 'Google',    color: '#4285F4' },
  { id: 'gpt-4.1',           label: 'GPT-4.1',           provider: 'OpenAI',    color: '#10a37f' },
]

const SERVICE_ROWS = [
  'Mentor IA', 'Tuteur de code', 'Revue de code',
  'Mode Défi', 'Rubber Duck', 'Entretien Technique',
]

function ConsumptionTab() {
  return (
    <div>
      <PageTitle>Consommation IA</PageTitle>

      <InfoBanner>
        Les métriques en temps réel (tokens, coûts, appels) nécessitent la table{' '}
        <code style={{ fontFamily: 'monospace', background: 'var(--color-surface)', padding: '1px 5px', borderRadius: '4px' }}>ai_calls</code>{' '}
        dans Supabase. Voir l'onglet <strong>Documentation</strong> pour le schéma complet.
      </InfoBanner>

      <SectionTitle>Modèles configurés</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px', marginBottom: '32px' }}>
        {MODELS.map(m => (
          <div key={m.id} style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: '10px', padding: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: m.color, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700 }}>{m.label}</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{m.provider}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {['Appels', 'Tokens', 'Coût est.'].map(lbl => (
                <div key={lbl} style={{ textAlign: 'center', padding: '8px 4px', background: 'var(--color-bg)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text-muted)' }}>—</div>
                  <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{lbl}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <SectionTitle>Répartition par service</SectionTitle>
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '10px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              <th style={TH}>Service</th>
              <th style={TH}>Modèles supportés</th>
              <th style={TH}>Appels</th>
              <th style={TH}>Tokens in</th>
              <th style={TH}>Tokens out</th>
            </tr>
          </thead>
          <tbody>
            {SERVICE_ROWS.map(svc => (
              <tr key={svc} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ ...TD, fontWeight: 500 }}>{svc}</td>
                <td style={TD}>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {MODELS.map(m => (
                      <span key={m.id} style={{
                        fontSize: '10px', padding: '2px 6px', borderRadius: '4px',
                        background: m.color + '20', color: m.color, fontWeight: 600,
                      }}>{m.provider}</span>
                    ))}
                  </div>
                </td>
                <td style={{ ...TD, color: 'var(--color-text-muted)' }}>—</td>
                <td style={{ ...TD, color: 'var(--color-text-muted)' }}>—</td>
                <td style={{ ...TD, color: 'var(--color-text-muted)' }}>—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Services
// ─────────────────────────────────────────────────────────────────────────────

const SERVICES = [
  {
    id: 'mentor', label: 'Mentor IA', Icon: Sparkles, frequency: 'Très élevée',
    description: 'Assistant IA principal. Répond aux questions Java avec contexte complet : fichier actif, niveau de l\'utilisateur, concepts maîtrisés, parcours d\'apprentissage.',
    prompt: 'SYSTEM_PROMPTS.MENTOR(level, fileName, code)',
    note: 'Voit le code de l\'éditeur actif en temps réel.',
  },
  {
    id: 'tutor', label: 'Tuteur de code', Icon: BookOpen, frequency: 'Élevée',
    description: 'Explique du code Java sélectionné ligne par ligne. Adapte le niveau de détail selon le profil de l\'apprenant. Mode pédagogique avec analogies.',
    prompt: 'SYSTEM_PROMPTS.TUTOR(level)',
    note: 'Déclenché sur sélection de code ou question ciblée.',
  },
  {
    id: 'review', label: 'Revue de code', Icon: Search, frequency: 'Moyenne',
    description: 'Analyse le code pour détecter bugs, code smells, anti-patterns Java. Retour structuré avec niveaux de priorité (critique / mineur).',
    prompt: 'SYSTEM_PROMPTS.REVIEW(fileName, code)',
    note: 'Analyse le fichier actif complet.',
  },
  {
    id: 'challenge', label: 'Mode Défi', Icon: Target, frequency: 'Moyenne',
    description: 'Génère et valide des défis de code Java basés sur le curriculum. Challenge adaptatif selon le niveau courant de l\'utilisateur.',
    prompt: 'SYSTEM_PROMPTS.CHALLENGE(conceptId, level)',
    note: 'Intégré à l\'éditeur Monaco — paste désactivé.',
  },
  {
    id: 'duck', label: 'Rubber Duck', Icon: MessageCircle, frequency: 'Faible',
    description: 'Mode débogage Socratique. L\'IA pose des questions guidées plutôt que de donner la réponse directement, encourageant la réflexion autonome.',
    prompt: 'SYSTEM_PROMPTS.DUCK',
    note: 'État persisté dans Zustand (pas de perte sur changement de mode).',
  },
  {
    id: 'interview', label: 'Entretien Technique', Icon: Briefcase, frequency: 'Faible',
    description: 'Simulation d\'entretien Java. Questions de type Junior / Mid / Senior. Feedback structuré sur les réponses avec points forts et axes d\'amélioration.',
    prompt: 'SYSTEM_PROMPTS.INTERVIEW(level)',
    note: 'Session continue avec suivi de la progression.',
  },
]

const FREQ_COLOR: Record<string, string> = {
  'Très élevée': '#10b981',
  'Élevée':      '#3b82f6',
  'Moyenne':     '#f59e0b',
  'Faible':      'var(--color-text-muted)',
}

function ServicesTab() {
  return (
    <div>
      <PageTitle>Services IA</PageTitle>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginBottom: '24px', lineHeight: 1.75 }}>
        JavaMind AI propose <strong style={{ color: 'var(--color-text)' }}>6 services IA</strong> distincts,
        tous construits sur le même pipeline de streaming (<code style={{ fontFamily: 'monospace' }}>useAiStream</code>).
        Chaque service utilise un system prompt spécialisé et le modèle sélectionné par l'utilisateur.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {SERVICES.map(s => (
          <div key={s.id} style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: '12px', padding: '18px 20px',
            display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'start',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '8px' }}>
                <span style={{ color: 'var(--color-accent)', display: 'flex' }}><s.Icon size={16} /></span>
                <span style={{ fontSize: '15px', fontWeight: 700 }}>{s.label}</span>
              </div>
              <p style={{ margin: '0 0 10px', fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.65 }}>
                {s.description}
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <code style={{
                  fontSize: '11px', background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)', padding: '2px 8px',
                  borderRadius: '5px', color: 'var(--color-accent)', fontFamily: 'monospace',
                }}>{s.prompt}</code>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>· {s.note}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Fréquence</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: FREQ_COLOR[s.frequency] }}>{s.frequency}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Documentation
// ─────────────────────────────────────────────────────────────────────────────

function DocsTab() {
  return (
    <div style={{ maxWidth: '740px' }}>
      <PageTitle>Documentation technique</PageTitle>

      <DocSection title="Architecture">
        <p>JavaMind AI est une application <strong>Electron + React + Vite + TypeScript</strong>. Le même codebase sert les deux plateformes :</p>
        <ul>
          <li><strong>Electron</strong> : clés API dans <code>.env</code>, appels IA via IPC (<code>ai:stream</code> → main process → SDK Node.js)</li>
          <li><strong>Web</strong> : clés API dans <code>localStorage</code> ou injectées par Vite (<code>VITE_*</code>), appels IA via SDK browser-side (<code>dangerouslyAllowBrowser</code>)</li>
        </ul>
        <p>Détection de plateforme : <code>isElectron = 'electronAPI' in window</code> (injecté par le preload Electron).</p>
      </DocSection>

      <DocSection title="Pipeline IA (useAiStream)">
        <p>Tous les services partagent le même hook :</p>
        <pre style={PRE}>{`stream({ systemPrompt, messages, provider?, model? })

→ Electron : ipc.ai.stream() → IPC → main.ts → SDK Node.js
→ Web      : ai-web.ts → SDK browser (Anthropic/Gemini/OpenAI)

Arrêt : abort() → AbortController.abort() + ipc.ai.abort()
        → bouton ■ rouge affiché pendant le streaming`}</pre>
      </DocSection>

      <DocSection title="État global (Zustand)">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {[
            ['authStore',     'Session, profil, auth modal'],
            ['aiStore',       'Chat, streaming, provider/model, duck'],
            ['editorStore',   'Tabs, fichier actif, leçon/défi'],
            ['projectStore',  'Chemin projet, arbre de fichiers, output'],
            ['learningStore', 'Niveau, concepts maîtrisés, streak'],
            ['langStore',     'Traductions FR/EN'],
            ['themeStore',    'dark / light (persisté)'],
          ].map(([name, desc]) => (
            <div key={name} style={{ padding: '8px 12px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '7px' }}>
              <code style={{ fontSize: '12px', color: 'var(--color-accent)', fontFamily: 'monospace', display: 'block', marginBottom: '2px' }}>{name}</code>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{desc}</span>
            </div>
          ))}
        </div>
      </DocSection>

      <DocSection title="Tables Supabase actuelles">
        <TableSchema name="profiles" columns={[
          { name: 'id',         type: 'uuid',        note: 'FK → auth.users' },
          { name: 'username',   type: 'text',        note: 'Nom d\'affichage' },
          { name: 'avatar_url', type: 'text',        note: 'Avatar OAuth' },
          { name: 'created_at', type: 'timestamptz', note: 'Auto' },
          { name: 'updated_at', type: 'timestamptz', note: 'Auto-updated' },
        ]} />
      </DocSection>

      <DocSection title="Table recommandée : ai_calls">
        <p>Pour activer les métriques de consommation dans l'onglet Consommation IA :</p>
        <pre style={PRE}>{`CREATE TABLE ai_calls (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  service     text NOT NULL,   -- 'mentor'|'tutor'|'review'|'challenge'|'duck'|'interview'
  model       text NOT NULL,   -- 'claude-sonnet-4-6'|'gemini-2.5-flash'|'gpt-4.1'
  provider    text NOT NULL,   -- 'anthropic'|'gemini'|'openai'
  tokens_in   int,
  tokens_out  int,
  duration_ms int,
  created_at  timestamptz DEFAULT now()
);
CREATE INDEX ON ai_calls (created_at DESC);
CREATE INDEX ON ai_calls (user_id);
CREATE INDEX ON ai_calls (model);

-- RLS : admin peut tout lire
CREATE POLICY "admin_read" ON ai_calls FOR SELECT
  USING (auth.jwt()->>'email' = ANY(
    string_to_array(current_setting('app.admin_emails', true), ',')
  ));`}</pre>
      </DocSection>

      <DocSection title="Accès admin — migration complète">
        <p>
          Exécuter dans <strong>Supabase Dashboard → SQL Editor</strong>.
          Le fichier source est aussi disponible dans <code>supabase/migrations/20260309_admin_rls.sql</code>.
        </p>
        <CopyBlock sql={ADMIN_MIGRATION_SQL} />
        <p style={{ marginTop: '16px' }}>
          Ensuite, activer un admin (<strong>une seule fois, via SQL Editor</strong>) :
        </p>
        <CopyBlock sql={`UPDATE auth.users\n  SET raw_app_meta_data = raw_app_meta_data || '{"is_admin": true}'::jsonb\n  WHERE email = 'votre-email@exemple.com';`} />
      </DocSection>

      <DocSection title="Variables d'environnement">
        <pre style={PRE}>{`# Clés IA — main process Electron + Vite inject pour le web
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AIza...
OPENAI_API_KEY=sk-...

# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Admin (emails séparés par virgule)
VITE_ADMIN_EMAILS=admin@example.com,dev@example.com`}</pre>
      </DocSection>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared UI components
// ─────────────────────────────────────────────────────────────────────────────

function PageTitle({ children }: { children: React.ReactNode }) {
  return <h1 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 24px', color: 'var(--color-text)' }}>{children}</h1>
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: '11px', fontWeight: 700, margin: '0 0 12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{children}</h2>
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{
      background: 'var(--color-surface)',
      border: `1px solid ${accent ? 'rgba(212,165,116,0.3)' : 'var(--color-border)'}`,
      borderRadius: '10px', padding: '16px 18px',
    }}>
      <div style={{ fontSize: '30px', fontWeight: 800, color: accent ? 'var(--color-accent)' : 'var(--color-text)', marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{label}</div>
    </div>
  )
}

function ProfileTable({ profiles, loading, full }: { profiles: Profile[]; loading: boolean; full?: boolean }) {
  if (loading) return <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>Chargement…</div>
  if (profiles.length === 0) return <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>Aucun utilisateur trouvé</div>
  return (
    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '10px', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
            <th style={TH}>Utilisateur</th>
            {full && <th style={TH}>Email</th>}
            {full && <th style={TH}>Connexion</th>}
            <th style={TH}>Inscrit le</th>
            {full && <th style={TH}>Dernière modif.</th>}
          </tr>
        </thead>
        <tbody>
          {profiles.map(p => (
            <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
              <td style={TD}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {p.avatar_url
                    ? <img src={p.avatar_url} alt="" style={{ width: 26, height: 26, borderRadius: '50%' }} />
                    : <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(212,165,116,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'var(--color-accent)', fontWeight: 700, flexShrink: 0 }}>
                        {(p.username ?? p.email ?? '?').charAt(0).toUpperCase()}
                      </div>
                  }
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 500 }}>{p.username ?? '—'}</span>
                    {p.is_admin_flag && (
                      <span title="Admin" style={{ display: 'inline-flex', alignItems: 'center' }}>
                        <Shield size={11} style={{ color: 'var(--color-accent)' }} />
                      </span>
                    )}
                  </div>
                </div>
              </td>
              {full && <td style={{ ...TD, color: 'var(--color-text-muted)' }}>{p.email ?? '—'}</td>}
              {full && <td style={TD}><ProviderBadge provider={p.provider} /></td>}
              <td style={{ ...TD, color: 'var(--color-text-muted)' }}>{formatDate(p.created_at)}</td>
              {full && <td style={{ ...TD, color: 'var(--color-text-muted)' }}>{p.updated_at ? formatDate(p.updated_at) : '—'}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RlsNotice({ table }: { table: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '8px',
      padding: '10px 14px', marginBottom: '16px',
      background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)',
      borderRadius: '8px', fontSize: '12px', color: 'var(--color-text-muted)',
    }}>
      <AlertCircle size={14} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '1px' }} />
      <span>Accès refusé à <code>{table}</code>. Configurez une politique RLS admin — voir l'onglet <strong>Documentation</strong>.</span>
    </div>
  )
}

function InfoBanner({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '8px',
      padding: '12px 14px', marginBottom: '24px',
      background: 'rgba(212,165,116,0.08)', border: '1px solid rgba(212,165,116,0.25)',
      borderRadius: '8px', fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.65,
    }}>
      <AlertCircle size={14} style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: '1px' }} />
      <span>{children}</span>
    </div>
  )
}

function DocSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 12px', color: 'var(--color-text)', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>{title}</h2>
      <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.8 }}>{children}</div>
    </div>
  )
}

interface SchemaColumn { name: string; type: string; note: string }
function TableSchema({ name, columns }: { name: string; columns: SchemaColumn[] }) {
  return (
    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden', marginBottom: '12px' }}>
      <div style={{ padding: '8px 14px', background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)', fontSize: '12px', fontWeight: 700, color: 'var(--color-accent)', fontFamily: 'monospace' }}>{name}</div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <tbody>
          {columns.map(c => (
            <tr key={c.name} style={{ borderBottom: '1px solid var(--color-border)' }}>
              <td style={{ padding: '7px 14px', fontFamily: 'monospace', color: 'var(--color-text)', fontWeight: 600 }}>{c.name}</td>
              <td style={{ padding: '7px 14px', color: 'var(--color-accent)', fontFamily: 'monospace' }}>{c.type}</td>
              <td style={{ padding: '7px 14px', color: 'var(--color-text-muted)' }}>{c.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Migration SQL (also in supabase/migrations/20260309_admin_rls.sql)
// ─────────────────────────────────────────────────────────────────────────────

const ADMIN_MIGRATION_SQL = `-- 1. Fonction helper is_admin()
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT COALESCE((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean, false)
$$;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

-- 2. Politique RLS : admin lit tous les profils
DROP POLICY IF EXISTS "admin_read_all_profiles" ON public.profiles;
CREATE POLICY "admin_read_all_profiles" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

-- 3. RPC admin_get_profiles (email + provider + is_admin via join auth.users)
CREATE OR REPLACE FUNCTION public.admin_get_profiles(
  p_limit int DEFAULT 100, p_offset int DEFAULT 0, p_search text DEFAULT NULL
) RETURNS TABLE (id uuid, username text, avatar_url text, email text,
  provider text, is_admin_flag boolean, created_at timestamptz, updated_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Accès refusé'; END IF;
  RETURN QUERY SELECT p.id, p.username, p.avatar_url, u.email::text,
    (u.raw_app_meta_data->>'provider')::text,
    COALESCE((u.raw_app_meta_data->>'is_admin')::boolean, false),
    p.created_at, p.updated_at
  FROM public.profiles p JOIN auth.users u ON u.id = p.id
  WHERE (p_search IS NULL OR u.email ILIKE '%'||p_search||'%'
         OR p.username ILIKE '%'||p_search||'%')
  ORDER BY p.created_at DESC
  LIMIT GREATEST(p_limit,1) OFFSET GREATEST(p_offset,0);
END; $$;
GRANT EXECUTE ON FUNCTION public.admin_get_profiles(int,int,text) TO authenticated;

-- 4. RPC admin_count_profiles
CREATE OR REPLACE FUNCTION public.admin_count_profiles()
RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Accès refusé'; END IF;
  RETURN (SELECT COUNT(*) FROM public.profiles);
END; $$;
GRANT EXECUTE ON FUNCTION public.admin_count_profiles() TO authenticated;

-- 5. RPC admin_count_new_profiles(p_days)
CREATE OR REPLACE FUNCTION public.admin_count_new_profiles(p_days int DEFAULT 7)
RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Accès refusé'; END IF;
  RETURN (SELECT COUNT(*) FROM public.profiles
          WHERE created_at >= NOW() - (p_days||' days')::interval);
END; $$;
GRANT EXECUTE ON FUNCTION public.admin_count_new_profiles(int) TO authenticated;

-- 6. RPC admin_get_daily_registrations(p_days) — pour le graphique
CREATE OR REPLACE FUNCTION public.admin_get_daily_registrations(p_days int DEFAULT 14)
RETURNS TABLE (day date, count bigint)
LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Accès refusé'; END IF;
  RETURN QUERY
    SELECT d::date, COUNT(p.id)::bigint
    FROM generate_series(NOW()-(p_days||' days')::interval, NOW(), '1 day'::interval) AS d
    LEFT JOIN public.profiles p ON p.created_at::date = d::date
    GROUP BY d::date ORDER BY d::date;
END; $$;
GRANT EXECUTE ON FUNCTION public.admin_get_daily_registrations(int) TO authenticated;`

// ── Shared styles & utils ──────────────────────────────────────────────────────

const TH: React.CSSProperties = {
  padding: '10px 14px', textAlign: 'left', fontSize: '11px',
  fontWeight: 700, color: 'var(--color-text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.05em',
}

const TD: React.CSSProperties = { padding: '10px 14px', fontSize: '13px', color: 'var(--color-text)' }

const PRE: React.CSSProperties = {
  background: 'var(--color-bg)', border: '1px solid var(--color-border)',
  borderRadius: '8px', padding: '14px 16px', fontFamily: 'monospace',
  fontSize: '12px', lineHeight: 1.7, overflowX: 'auto', margin: '8px 0 16px',
  color: 'var(--color-text)', whiteSpace: 'pre',
}

// ── MiniBarChart : graphique en barres SVG ─────────────────────────────────

function MiniBarChart({ data }: { data: DailyReg[] }) {
  if (!data.length) return null
  const max = Math.max(...data.map(d => d.count), 1)
  const W = 600, H = 80, BAR_W = Math.floor(W / data.length) - 2, Y_BASE = H - 18

  return (
    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
        <TrendingUp size={13} style={{ color: 'var(--color-accent)' }} />
        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
          Inscriptions par jour
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        {data.map((d, i) => {
          const barH = Math.max((d.count / max) * (Y_BASE - 4), d.count > 0 ? 4 : 2)
          const x = i * (BAR_W + 2)
          const y = Y_BASE - barH
          return (
            <g key={i}>
              <rect
                x={x} y={y} width={BAR_W} height={barH}
                rx="2"
                fill={d.count > 0 ? 'rgba(212,165,116,0.85)' : 'var(--color-border)'}
              >
                <title>{d.day} : {d.count} inscription{d.count !== 1 ? 's' : ''}</title>
              </rect>
              {(i === 0 || i === Math.floor(data.length / 2) || i === data.length - 1) && (
                <text
                  x={x + BAR_W / 2} y={H - 2}
                  textAnchor="middle"
                  fontSize="8" fill="var(--color-text-muted)"
                >{d.day}</text>
              )}
              {d.count > 0 && (
                <text
                  x={x + BAR_W / 2} y={y - 3}
                  textAnchor="middle"
                  fontSize="8" fill="var(--color-accent)"
                >{d.count}</text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ── ProviderBadge ──────────────────────────────────────────────────────────────

const PROVIDERS: Record<string, { label: string; color: string }> = {
  github: { label: 'GitHub', color: '#6e7681' },
  google: { label: 'Google', color: '#4285F4' },
  email:  { label: 'Email',  color: '#10b981' },
}

function ProviderBadge({ provider }: { provider?: string | null }) {
  if (!provider) return <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>—</span>
  const { label, color } = PROVIDERS[provider.toLowerCase()] ?? { label: provider, color: 'var(--color-text-muted)' }
  return (
    <span style={{
      fontSize: '10px', padding: '2px 7px', borderRadius: '4px',
      background: color + '18', color, fontWeight: 700,
      border: `1px solid ${color}30`,
    }}>{label}</span>
  )
}

function CopyBlock({ sql }: { sql: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(sql).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <div style={{ position: 'relative' }}>
      <pre style={PRE}>{sql}</pre>
      <button onClick={copy} style={{
        position: 'absolute', top: '8px', right: '8px',
        padding: '4px 10px', fontSize: '11px', fontWeight: 600,
        border: '1px solid var(--color-border)', borderRadius: '5px',
        background: copied ? 'rgba(16,185,129,0.15)' : 'var(--color-surface)',
        color: copied ? '#10b981' : 'var(--color-text-muted)',
        cursor: 'pointer', transition: 'all 0.15s',
      }}>
        {copied ? '✓ Copié' : 'Copier'}
      </button>
    </div>
  )
}

function formatDate(iso: string): string {
  try { return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) }
  catch { return '—' }
}
