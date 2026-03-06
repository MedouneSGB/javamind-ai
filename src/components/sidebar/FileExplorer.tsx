import { useState } from 'react'
import { FolderOpen, Folder, Coffee, Settings2, FileJson, FileCode2, FileText, File, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react'
import { useProjectStore } from '../../store/projectStore'
import { useEditorStore } from '../../store/editorStore'
import { ipc } from '../../lib/ipc'
import type { FileTreeNode } from '../../types/editor.types'

export function FileExplorer() {
  const { fileTree, projectPath, setFileTree } = useProjectStore()
  const { openFile } = useEditorStore()

  const refreshTree = async () => {
    if (!projectPath) return
    const tree = await ipc.fs.readDir(projectPath)
    setFileTree(tree)
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
      }}>
        <span>{fileTree.name}</span>
        <button
          onClick={refreshTree}
          style={{
            background: 'transparent', border: 'none',
            color: 'var(--color-text-dim)', cursor: 'pointer',
            fontSize: '12px', padding: '0 2px',
          }}
          title="Refresh"
        ><RefreshCw size={12}/></button>
      </div>
      {fileTree.children.map(node => (
        <FileNode
          key={node.path}
          node={node}
          depth={0}
          onOpenFile={async (path) => {
            const content = await ipc.fs.readFile(path)
            openFile(path, content)
          }}
        />
      ))}
    </div>
  )
}

function FileNode({ node, depth, onOpenFile }: {
  node: FileTreeNode
  depth: number
  onOpenFile: (path: string) => void
}) {
  const [expanded, setExpanded] = useState(depth === 0)

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
    if (node.isDirectory) {
      setExpanded(!expanded)
    } else {
      onOpenFile(node.path)
    }
  }

  return (
    <div>
      <div
        onClick={handleClick}
        style={{
          height: '24px',
          padding: `0 8px 0 ${8 + depth * 14}px`,
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          cursor: 'pointer',
          color: node.isDirectory ? 'var(--color-text-muted)' : 'var(--color-text)',
          fontSize: '12.5px',
          userSelect: 'none',
          transition: 'background 0.1s',
          borderRadius: '0',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-surface-3)' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
      >
        {node.isDirectory && (
          <span style={{ display:'flex', alignItems:'center', color: 'var(--color-text-dim)', width: '10px' }}>
            {expanded ? <ChevronDown size={9}/> : <ChevronRight size={9}/>}
          </span>
        )}
        <span style={{ display:'flex', alignItems:'center' }}>{getIcon()}</span>
        <span style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {node.name}
        </span>
      </div>

      {node.isDirectory && expanded && node.children.map(child => (
        <FileNode
          key={child.path}
          node={child}
          depth={depth + 1}
          onOpenFile={onOpenFile}
        />
      ))}
    </div>
  )
}
