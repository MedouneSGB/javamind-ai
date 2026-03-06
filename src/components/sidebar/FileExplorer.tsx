import { useState, useRef, useEffect } from 'react'
import {
  FolderOpen, Folder, Coffee, Settings2, FileJson, FileCode2,
  FileText, File, RefreshCw, ChevronDown, ChevronRight,
  FilePlus, FolderPlus,
} from 'lucide-react'
import { useProjectStore } from '../../store/projectStore'
import { useEditorStore } from '../../store/editorStore'
import { ipc } from '../../lib/ipc'
import type { FileTreeNode } from '../../types/editor.types'

// Generate Java boilerplate from filename
function javaBoilerplate(filename: string): string {
  const className = filename.replace(/\.java$/, '')
  return `public class ${className} {\n    public static void main(String[] args) {\n        // TODO\n    }\n}\n`
}

type CreatingState = { parentPath: string; type: 'file' | 'folder' } | null

export function FileExplorer() {
  const { fileTree, projectPath, setFileTree } = useProjectStore()
  const { openFile } = useEditorStore()
  const [creating, setCreating] = useState<CreatingState>(null)

  const refreshTree = async () => {
    if (!projectPath) return
    const tree = await ipc.fs.readDir(projectPath)
    setFileTree(tree)
  }

  const handleCreate = async (name: string) => {
    if (!name.trim() || !creating) { setCreating(null); return }
    const trimmed = name.trim()
    const targetPath = creating.parentPath + '/' + trimmed
    if (creating.type === 'file') {
      // Auto-add .java if no extension
      const finalName = trimmed.includes('.') ? trimmed : trimmed + '.java'
      const finalPath = creating.parentPath + '/' + finalName
      const content = finalName.endsWith('.java') ? javaBoilerplate(finalName) : ''
      await ipc.fs.createFile(finalPath)
      if (content) await ipc.fs.writeFile(finalPath, content)
      await refreshTree()
      const fileContent = await ipc.fs.readFile(finalPath)
      openFile(finalPath, fileContent)
    } else {
      await ipc.fs.createDir(targetPath)
      await refreshTree()
    }
    setCreating(null)
  }

  if (!fileTree) {
    return (
      <div style={{
        padding: '12px 8px',
        color: 'var(--color-text-dim)',
        fontSize: '12px',
        textAlign: 'center',
        lineHeight: 1.8,
      }}>
        <div style={{ marginBottom: '8px', color: 'var(--color-accent)' }}><FolderOpen size={24}/></div>
        Open a project to<br />browse files
      </div>
    )
  }

  return (
    <div style={{ overflow: 'auto', flex: 1 }}>
      {/* Header */}
      <div style={{
        padding: '6px 8px 4px',
        fontSize: '10px',
        fontWeight: 700,
        color: 'var(--color-text-dim)',
        letterSpacing: '0.8px',
        textTransform: 'uppercase',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        background: 'var(--color-surface-2)',
        zIndex: 1,
      }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {fileTree.name}
        </span>
        <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
          <IconBtn
            title="New Java File"
            onClick={() => setCreating({ parentPath: fileTree.path, type: 'file' })}
          ><FilePlus size={12}/></IconBtn>
          <IconBtn
            title="New Folder"
            onClick={() => setCreating({ parentPath: fileTree.path, type: 'folder' })}
          ><FolderPlus size={12}/></IconBtn>
          <IconBtn title="Refresh" onClick={refreshTree}><RefreshCw size={12}/></IconBtn>
        </div>
      </div>

      {/* Inline creator at root level */}
      {creating && creating.parentPath === fileTree.path && (
        <InlineCreator
          type={creating.type}
          depth={0}
          onConfirm={handleCreate}
          onCancel={() => setCreating(null)}
        />
      )}

      {fileTree.children.map(node => (
        <FileNode
          key={node.path}
          node={node}
          depth={0}
          creating={creating}
          onOpenFile={async (p) => {
            const content = await ipc.fs.readFile(p)
            openFile(p, content)
          }}
          onStartCreate={(parentPath, type) => setCreating({ parentPath, type })}
          onConfirmCreate={handleCreate}
          onCancelCreate={() => setCreating(null)}
        />
      ))}
    </div>
  )
}

// ── Small icon button ─────────────────────────────────────────────
function IconBtn({ children, onClick, title }: {
  children: React.ReactNode
  onClick: () => void
  title: string
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: 'transparent', border: 'none',
        color: 'var(--color-text-dim)', cursor: 'pointer',
        padding: '2px 3px', borderRadius: '3px',
        display: 'flex', alignItems: 'center',
        transition: 'color 0.1s, background 0.1s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--color-accent)'
        e.currentTarget.style.background = 'var(--color-surface-3)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--color-text-dim)'
        e.currentTarget.style.background = 'transparent'
      }}
    >{children}</button>
  )
}

// ── Inline input to type new name ────────────────────────────────
function InlineCreator({ type, depth, onConfirm, onCancel }: {
  type: 'file' | 'folder'
  depth: number
  onConfirm: (name: string) => void
  onCancel: () => void
}) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const placeholder = type === 'file' ? 'FileName.java' : 'folderName'

  return (
    <div style={{
      height: '24px',
      padding: `0 8px 0 ${8 + depth * 14 + (type === 'folder' ? 0 : 15)}px`,
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      background: 'var(--color-surface-3)',
    }}>
      <span style={{ display: 'flex', alignItems: 'center', color: 'var(--color-accent)', flexShrink: 0 }}>
        {type === 'file' ? <Coffee size={12}/> : <Folder size={12}/>}
      </span>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onConfirm(value)
          if (e.key === 'Escape') onCancel()
        }}
        onBlur={() => onCancel()}
        placeholder={placeholder}
        style={{
          flex: 1,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-accent)',
          borderRadius: '3px',
          color: 'var(--color-text)',
          fontSize: '12px',
          padding: '1px 5px',
          outline: 'none',
          minWidth: 0,
        }}
      />
    </div>
  )
}

// ── File / Folder node ───────────────────────────────────────────
function FileNode({ node, depth, creating, onOpenFile, onStartCreate, onConfirmCreate, onCancelCreate }: {
  node: FileTreeNode
  depth: number
  creating: CreatingState
  onOpenFile: (path: string) => void
  onStartCreate: (parentPath: string, type: 'file' | 'folder') => void
  onConfirmCreate: (name: string) => void
  onCancelCreate: () => void
}) {
  const [expanded, setExpanded] = useState(depth === 0)
  const [hovered, setHovered] = useState(false)

  const getIcon = () => {
    if (node.isDirectory) return expanded ? <FolderOpen size={13}/> : <Folder size={13}/>
    if (node.name.endsWith('.java')) return <Coffee size={12}/>
    if (node.name.endsWith('.class')) return <Settings2 size={12}/>
    if (node.name.endsWith('.json')) return <FileJson size={12}/>
    if (node.name.endsWith('.xml')) return <FileCode2 size={12}/>
    if (node.name.endsWith('.md')) return <FileText size={12}/>
    return <File size={12}/>
  }

  const handleClick = () => {
    if (node.isDirectory) setExpanded(!expanded)
    else onOpenFile(node.path)
  }

  return (
    <div>
      <div
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          height: '24px',
          padding: `0 4px 0 ${8 + depth * 14}px`,
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          cursor: 'pointer',
          color: node.isDirectory ? 'var(--color-text-muted)' : 'var(--color-text)',
          fontSize: '12.5px',
          userSelect: 'none',
          transition: 'background 0.1s',
          background: hovered ? 'var(--color-surface-3)' : 'transparent',
        }}
      >
        {node.isDirectory && (
          <span style={{ display:'flex', alignItems:'center', color: 'var(--color-text-dim)', width: '10px', flexShrink: 0 }}>
            {expanded ? <ChevronDown size={9}/> : <ChevronRight size={9}/>}
          </span>
        )}
        <span style={{ display:'flex', alignItems:'center', flexShrink: 0 }}>{getIcon()}</span>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
          {node.name}
        </span>

        {/* New file / folder buttons — visible on hover for directories */}
        {node.isDirectory && hovered && (
          <div
            style={{ display: 'flex', gap: '1px', flexShrink: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <IconBtn
              title="New Java File here"
              onClick={() => { setExpanded(true); onStartCreate(node.path, 'file') }}
            ><FilePlus size={11}/></IconBtn>
            <IconBtn
              title="New Folder here"
              onClick={() => { setExpanded(true); onStartCreate(node.path, 'folder') }}
            ><FolderPlus size={11}/></IconBtn>
          </div>
        )}
      </div>

      {/* Children + inline creator */}
      {node.isDirectory && expanded && (
        <>
          {creating && creating.parentPath === node.path && (
            <InlineCreator
              type={creating.type}
              depth={depth + 1}
              onConfirm={onConfirmCreate}
              onCancel={onCancelCreate}
            />
          )}
          {node.children.map(child => (
            <FileNode
              key={child.path}
              node={child}
              depth={depth + 1}
              creating={creating}
              onOpenFile={onOpenFile}
              onStartCreate={onStartCreate}
              onConfirmCreate={onConfirmCreate}
              onCancelCreate={onCancelCreate}
            />
          ))}
        </>
      )}
    </div>
  )
}
