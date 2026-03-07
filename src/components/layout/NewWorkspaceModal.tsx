import { useState, useEffect, useRef } from 'react'
import { FolderOpen, FolderPlus, X, Loader2 } from 'lucide-react'
import { ipc } from '../../lib/ipc'
import { useProjectStore } from '../../store/projectStore'
import { useEditorStore } from '../../store/editorStore'
import { useRecentProjectsStore } from '../../store/recentProjectsStore'
import { useLangStore } from '../../store/langStore'
import * as pathBrowser from 'path-browserify'

interface Props {
  isOpen: boolean
  onClose: () => void
}

const MAIN_JAVA = `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, JavaMind!");
    }
}
`

/** Shorten a path for display: keep last 40 chars with leading "…" */
function shortenPath(p: string, maxLen = 42): string {
  if (!p) return ''
  if (p.length <= maxLen) return p
  return '…' + p.slice(-(maxLen - 1))
}

export function NewWorkspaceModal({ isOpen, onClose }: Props) {
  const [projectName, setProjectName] = useState('')
  const [parentPath, setParentPath]   = useState('')
  const [creating, setCreating]       = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { setProjectPath, setFileTree }      = useProjectStore()
  const { closeAllTabs, openFile }           = useEditorStore()
  const { addRecentProject }                 = useRecentProjectsStore()
  const { t }                                = useLangStore()

  // Reset form on open
  useEffect(() => {
    if (isOpen) {
      setProjectName('')
      setParentPath('')
      setError(null)
      setCreating(false)
      setTimeout(() => inputRef.current?.focus(), 80)
    }
  }, [isOpen])

  const handleBrowse = async () => {
    const p = await ipc.fs.openProject()
    if (p) setParentPath(p)
  }

  const handleCreate = async () => {
    const name = projectName.trim()
    if (!name || !parentPath) return

    // Validate: must start with a letter, then letters/digits/hyphens/underscores
    if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(name)) {
      setError(t('workspaceNameError'))
      return
    }

    setCreating(true)
    setError(null)

    try {
      // Build the new project root path (forward slashes — works on all platforms)
      const projectPath = pathBrowser.join(parentPath, name).replace(/\\/g, '/')

      // Create directory structure (recursive mkdir handles intermediate dirs)
      await ipc.fs.createDir(projectPath + '/src')
      await ipc.fs.createDir(projectPath + '/out')

      // Seed Main.java
      const mainPath = projectPath + '/src/Main.java'
      await ipc.fs.writeFile(mainPath, MAIN_JAVA)

      // Open the newly created project
      closeAllTabs()
      setProjectPath(projectPath)
      const tree = await ipc.fs.readDir(projectPath)
      setFileTree(tree)
      addRecentProject(projectPath, name)

      // Open Main.java in editor
      openFile(mainPath, MAIN_JAVA)

      onClose()
    } catch (err: any) {
      setError(err?.message ?? 'Failed to create workspace')
    } finally {
      setCreating(false)
    }
  }

  if (!isOpen) return null

  const isValid = projectName.trim().length > 0 && parentPath.length > 0
  const previewPath = projectName.trim() && parentPath
    ? pathBrowser.join(parentPath, projectName.trim())
    : null

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '440px',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '14px',
          padding: '26px',
          position: 'relative',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '14px', right: '14px',
            background: 'transparent', border: 'none',
            color: 'var(--color-text-dim)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '4px', borderRadius: '4px',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-dim)' }}
        >
          <X size={14} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '9px',
            background: 'var(--color-accent)20',
            border: '1px solid var(--color-accent)40',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <FolderPlus size={18} style={{ color: 'var(--color-accent)' }} />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)' }}>
              {t('newWorkspaceTitle')}
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--color-text-dim)', marginTop: '2px' }}>
              {t('newWorkspaceDesc')}
            </div>
          </div>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Project name */}
          <div>
            <label style={{
              fontSize: '10.5px', fontWeight: 700, color: 'var(--color-text-dim)',
              letterSpacing: '0.7px', textTransform: 'uppercase',
              display: 'block', marginBottom: '6px',
            }}>
              {t('projectName')}
            </label>
            <input
              ref={inputRef}
              value={projectName}
              onChange={(e) => { setProjectName(e.target.value); setError(null) }}
              onKeyDown={(e) => { if (e.key === 'Enter' && isValid && !creating) handleCreate() }}
              placeholder="MonProjetJava"
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'var(--color-surface-2)',
                border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-border)'}`,
                borderRadius: '8px',
                color: 'var(--color-text)',
                fontSize: '13px',
                padding: '9px 12px',
                outline: 'none',
                fontFamily: 'var(--font-mono, monospace)',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => { if (!error) e.target.style.borderColor = 'var(--color-accent)' }}
              onBlur={(e)  => { if (!error) e.target.style.borderColor = 'var(--color-border)' }}
            />
          </div>

          {/* Parent folder */}
          <div>
            <label style={{
              fontSize: '10.5px', fontWeight: 700, color: 'var(--color-text-dim)',
              letterSpacing: '0.7px', textTransform: 'uppercase',
              display: 'block', marginBottom: '6px',
            }}>
              {t('parentFolder')}
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{
                flex: 1, minWidth: 0,
                background: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                padding: '9px 12px',
                display: 'flex', alignItems: 'center',
                color: parentPath ? 'var(--color-text-muted)' : 'var(--color-text-dim)',
                fontSize: '12px',
                fontFamily: 'var(--font-mono, monospace)',
                overflow: 'hidden', whiteSpace: 'nowrap',
                userSelect: 'none',
              }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', width: '100%' }}>
                  {parentPath ? shortenPath(parentPath) : t('noFolderSelected')}
                </span>
              </div>
              <button
                onClick={handleBrowse}
                style={{
                  padding: '0 14px', flexShrink: 0,
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  color: 'var(--color-text-muted)',
                  fontSize: '12px', fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '5px',
                  whiteSpace: 'nowrap', transition: 'all 0.1s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.color = 'var(--color-text)' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-muted)' }}
              >
                <FolderOpen size={13} /> {t('browse')}
              </button>
            </div>
          </div>

          {/* Path preview */}
          {previewPath && (
            <div style={{
              padding: '8px 12px',
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              borderRadius: '7px',
              fontSize: '11px',
              color: 'var(--color-text-dim)',
              fontFamily: 'var(--font-mono, monospace)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              📁 {shortenPath(previewPath, 54)}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div style={{
              fontSize: '12px', color: 'var(--color-error)',
              padding: '8px 12px',
              background: 'rgba(192,57,43,0.08)',
              border: '1px solid rgba(192,57,43,0.25)',
              borderRadius: '7px',
              lineHeight: 1.5,
            }}>
              {error}
            </div>
          )}

          {/* Create button */}
          <button
            onClick={handleCreate}
            disabled={!isValid || creating}
            style={{
              height: '40px', marginTop: '2px',
              background: isValid && !creating ? 'var(--color-accent)' : 'var(--color-surface-2)',
              border: 'none',
              borderRadius: '9px',
              color: isValid && !creating ? '#0d0d0d' : 'var(--color-text-dim)',
              fontSize: '13px', fontWeight: 600,
              cursor: isValid && !creating ? 'pointer' : 'not-allowed',
              opacity: !isValid ? 0.5 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
              transition: 'all 0.15s',
            }}
          >
            {creating
              ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> {t('creating')}</>
              : <><FolderPlus size={14} /> {t('create')}</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}
