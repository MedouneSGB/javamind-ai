import { useProjectStore } from '../../store/projectStore'
import { FolderOpen, Zap, Play, XCircle, CheckCircle2, Circle, Flame, Sparkles } from 'lucide-react'
import { useLearningStore } from '../../store/learningStore'
import { useAiStore } from '../../store/aiStore'

export function StatusBar() {
  const { projectPath, isCompiling, isRunning, errors } = useProjectStore()
  const { userLevel, dailyStreak, masteredConcepts, kataCompletedToday } = useLearningStore()
  const { isStreaming } = useAiStore()

  const projectName = projectPath ? projectPath.split(/[\\/]/).pop() : null

  return (
    <div style={{
      height: '24px',
      background: 'var(--color-bg-2)',
      borderTop: '1px solid var(--color-border-2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingLeft: '8px',
      paddingRight: '12px',
      flexShrink: 0,
      fontSize: '11px',
      color: 'var(--color-text-muted)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Project */}
        {projectName && (
          <StatusItem color="var(--color-accent)">
            <FolderOpen size={11}/> {projectName}
          </StatusItem>
        )}

        {/* Java version indicator */}
        <StatusItem>Java 21 LTS</StatusItem>

        {/* Run status */}
        {isCompiling && <StatusItem color="var(--color-warning)" pulse><Zap size={11}/> Compiling...</StatusItem>}
        {isRunning && <StatusItem color="var(--color-success)" pulse><Play size={11} fill='currentColor'/> Running</StatusItem>}
        {errors.length > 0 && !isCompiling && (
          <StatusItem color="var(--color-error)"><XCircle size={11}/> {errors.length} error(s)</StatusItem>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* AI streaming */}
        {isStreaming && (
          <StatusItem color="var(--color-accent)" pulse><Sparkles size={11}/> AI thinking...</StatusItem>
        )}

        {/* Daily kata */}
        <StatusItem color={kataCompletedToday ? 'var(--color-success)' : 'var(--color-text-dim)'}>
          {kataCompletedToday ? <CheckCircle2 size={11}/> : <Circle size={11}/>} Daily Kata
        </StatusItem>

        {/* Streak */}
        {dailyStreak > 0 && (
          <StatusItem color="var(--color-warning)"><Flame size={11}/> {dailyStreak} day streak</StatusItem>
        )}

        {/* Progress */}
        <StatusItem>
          {masteredConcepts.length} concepts mastered
        </StatusItem>

        {/* Level */}
        <StatusItem color="var(--color-accent)">
          {userLevel.charAt(0).toUpperCase() + userLevel.slice(1)}
        </StatusItem>
      </div>
    </div>
  )
}

function StatusItem({ children, color, pulse }: {
  children: React.ReactNode
  color?: string
  pulse?: boolean
}) {
  return (
    <span style={{
      color: color || 'var(--color-text-muted)',
      animation: pulse ? 'pulse 1.5s infinite' : 'none',
      display: 'flex', alignItems: 'center', gap: '3px',
    }}>
      {children}
    </span>
  )
}
