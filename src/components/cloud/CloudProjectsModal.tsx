import { useEffect, useState } from 'react'
import { Cloud, CloudUpload, Trash2, X, Loader2, RefreshCw, FolderUp, ChevronDown, ChevronRight, FileText } from 'lucide-react'
import { useCloudProjectStore } from '../../store/cloudProjectStore'
import { useProjectStore } from '../../store/projectStore'
import { useAuthStore } from '../../store/authStore'
import { useLangStore } from '../../store/langStore'
import type { CloudProject } from '../../types/editor.types'

interface Props {
  onClose: () => void
}

export function CloudProjectsModal({ onClose }: Props) {
  const { t } = useLangStore()
  const { user } = useAuthStore()
  const { projectPath } = useProjectStore()
  const { projects, isLoading, isSaving, error, fetchProjects, uploadCurrentProject, pushToCloud, deleteProject, clearError } =
    useCloudProjectStore()

  const [saveName, setSaveName] = useState('')
  const [saveDesc, setSaveDesc] = useState('')
  const [showSaveForm, setShowSaveForm] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [pushingId, setPushingId] = useState<string | null>(null)

  useEffect(() => {
    if (user) fetchProjects()
  }, [user])

  const handleSave = async () => {
    if (!saveName.trim()) return
    try {
      await uploadCurrentProject(saveName.trim(), saveDesc.trim() || undefined)
      setSaveName('')
      setSaveDesc('')
      setShowSaveForm(false)
    } catch { /* error shown via store */ }
  }

  const handlePush = async (id: string) => {
    setPushingId(id)
    try {
      await pushToCloud(id)
    } finally {
      setPushingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    await deleteProject(id)
    setConfirmDeleteId(null)
  }

  if (!user) {
    return (
      <Modal onClose={onClose} title={t('cloudProjects')}>
        <p style={{ color: 'var(--color-text-dim)', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>
          {t('authSignIn')}
        </p>
      </Modal>
    )
  }

  return (
    <Modal onClose={onClose} title={t('cloudProjects')}>
      {/* Error banner */}
      {error && (
        <div style={{
          background: 'var(--color-error)22',
          border: '1px solid var(--color-error)44',
          borderRadius: '6px',
          padding: '8px 12px',
          fontSize: '12px',
          color: 'var(--color-error)',
          marginBottom: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          {error}
          <button onClick={clearError} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
            <X size={12} />
          </button>
        </div>
      )}

      {/* Save current project */}
      {projectPath && (
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          padding: '10px 12px',
          marginBottom: '14px',
        }}>
          {!showSaveForm ? (
            <button
              onClick={() => setShowSaveForm(true)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--color-accent)', fontSize: '13px', fontWeight: 500, padding: 0,
              }}
            >
              <CloudUpload size={14} />
              {t('cloudSaveCurrent')}
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input
                autoFocus
                value={saveName}
                onChange={e => setSaveName(e.target.value)}
                placeholder={t('cloudProjectName')}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                style={inputStyle}
              />
              <input
                value={saveDesc}
                onChange={e => setSaveDesc(e.target.value)}
                placeholder={t('cloudProjectDesc')}
                style={inputStyle}
              />
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                <Btn onClick={() => { setShowSaveForm(false); setSaveName(''); setSaveDesc('') }}>
                  {t('cancel')}
                </Btn>
                <Btn accent onClick={handleSave} disabled={isSaving || !saveName.trim()}>
                  {isSaving ? <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> : <CloudUpload size={11} />}
                  {t('cloudSave')}
                </Btn>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '11px', color: 'var(--color-text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {projects.length} {t('cloudProjectsSaved')}
        </span>
        <button
          onClick={fetchProjects}
          disabled={isLoading}
          title={t('refresh')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-dim)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '2px 4px' }}
        >
          <RefreshCw size={11} style={isLoading ? { animation: 'spin 1s linear infinite' } : undefined} />
        </button>
      </div>

      {/* Project list */}
      {isLoading && projects.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '24px', color: 'var(--color-text-dim)' }}>
          <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-text-dim)', fontSize: '13px' }}>
          {t('cloudNoProjects')}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '340px', overflowY: 'auto' }}>
          {projects.map(p => (
            <ProjectRow
              key={p.id}
              project={p}
              expanded={expandedId === p.id}
              onToggle={() => setExpandedId(expandedId === p.id ? null : p.id)}
              confirmingDelete={confirmDeleteId === p.id}
              onAskDelete={() => setConfirmDeleteId(p.id)}
              onCancelDelete={() => setConfirmDeleteId(null)}
              onDelete={() => handleDelete(p.id)}
              onPush={() => handlePush(p.id)}
              isPushing={pushingId === p.id}
              hasLocalProject={!!projectPath}
              t={t}
            />
          ))}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </Modal>
  )
}

function ProjectRow({
  project, expanded, onToggle,
  confirmingDelete, onAskDelete, onCancelDelete, onDelete,
  onPush, isPushing, hasLocalProject, t,
}: {
  project: CloudProject
  expanded: boolean
  onToggle: () => void
  confirmingDelete: boolean
  onAskDelete: () => void
  onCancelDelete: () => void
  onDelete: () => void
  onPush: () => void
  isPushing: boolean
  hasLocalProject: boolean
  t: (k: string) => string
}) {
  const fileCount = Object.keys(project.files).length
  const updatedAt = new Date(project.updatedAt).toLocaleDateString()

  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: '8px',
      overflow: 'hidden',
    }}>
      {/* Main row */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 10px', gap: '8px' }}>
        <button
          onClick={onToggle}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-dim)', display: 'flex', padding: 0 }}
        >
          {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        </button>
        <Cloud size={13} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {project.name}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-dim)' }}>
            {fileCount} {t('cloudFiles')} · {updatedAt}
          </div>
        </div>

        {/* Actions */}
        {confirmingDelete ? (
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--color-error)' }}>{t('cloudConfirmDelete')}</span>
            <Btn small accent="error" onClick={onDelete}>{t('yes')}</Btn>
            <Btn small onClick={onCancelDelete}>{t('no')}</Btn>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '4px' }}>
            {hasLocalProject && (
              <IconBtn onClick={onPush} title={t('cloudPush')} disabled={isPushing}>
                {isPushing
                  ? <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} />
                  : <FolderUp size={11} />
                }
              </IconBtn>
            )}
            <IconBtn onClick={onAskDelete} title={t('cloudDelete')} danger>
              <Trash2 size={11} />
            </IconBtn>
          </div>
        )}
      </div>

      {/* Expanded file list */}
      {expanded && (
        <div style={{
          borderTop: '1px solid var(--color-border)',
          padding: '6px 10px',
          maxHeight: '160px',
          overflowY: 'auto',
          background: 'var(--color-surface-2)',
        }}>
          {project.description && (
            <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '6px', fontStyle: 'italic' }}>
              {project.description}
            </p>
          )}
          {Object.keys(project.files).sort().map(path => (
            <div key={path} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '2px 0', fontSize: '11px', color: 'var(--color-text-dim)' }}>
              <FileText size={10} />
              {path}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: 'var(--color-surface-2)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        width: '480px',
        maxWidth: '95vw',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--color-text)' }}>
            <Cloud size={15} style={{ color: 'var(--color-accent)' }} />
            {title}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-dim)', display: 'flex', padding: '2px' }}>
            <X size={16} />
          </button>
        </div>
        {/* Body */}
        <div style={{ padding: '14px 16px', overflowY: 'auto', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--color-surface-2)',
  border: '1px solid var(--color-border)',
  borderRadius: '6px',
  color: 'var(--color-text)',
  fontSize: '12px',
  padding: '6px 10px',
  outline: 'none',
  boxSizing: 'border-box',
}

function Btn({ children, onClick, disabled, accent, small }: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  accent?: boolean | 'error'
  small?: boolean
}) {
  const color = accent === 'error' ? 'var(--color-error)' : accent ? 'var(--color-accent)' : 'var(--color-text-muted)'
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex', alignItems: 'center', gap: '4px',
        padding: small ? '3px 8px' : '5px 12px',
        fontSize: small ? '11px' : '12px',
        fontWeight: 500,
        background: accent ? `${color}22` : 'var(--color-surface)',
        border: `1px solid ${accent ? `${color}44` : 'var(--color-border)'}`,
        borderRadius: '5px',
        color,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  )
}

function IconBtn({ children, onClick, title, disabled, danger }: {
  children: React.ReactNode
  onClick: () => void
  title?: string
  disabled?: boolean
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '24px', height: '24px',
        background: 'transparent',
        border: '1px solid transparent',
        borderRadius: '4px',
        color: danger ? 'var(--color-error)' : 'var(--color-text-dim)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.1s',
      }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background = 'var(--color-surface-2)'; e.currentTarget.style.borderColor = 'var(--color-border)' } }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' }}
    >
      {children}
    </button>
  )
}
