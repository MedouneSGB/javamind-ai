import { useCallback, useEffect, useRef } from 'react'
import { ipc } from '../lib/ipc'
import { useEditorStore } from '../store/editorStore'
import { useProjectStore } from '../store/projectStore'

export function useJavaRunner() {
  const { saveAllDirty, getActiveTab } = useEditorStore()
  const {
    projectPath,
    setCompiling,
    setRunning,
    appendOutput,
    clearOutput,
    setErrors,
    clearErrors,
    isCompiling,
    isRunning,
    runningPid,
  } = useProjectStore()

  const unsubStdout = useRef<(() => void) | null>(null)
  const unsubStderr = useRef<(() => void) | null>(null)
  const unsubExit = useRef<(() => void) | null>(null)

  const cleanup = () => {
    unsubStdout.current?.()
    unsubStderr.current?.()
    unsubExit.current?.()
  }

  useEffect(() => () => cleanup(), [])

  const detectMainClass = useCallback((code: string, fileName: string): string => {
    const match = code.match(/public\s+class\s+(\w+)/)
    if (match) return match[1]
    return fileName.replace('.java', '')
  }, [])

  const run = useCallback(async () => {
    if (!projectPath) {
      appendOutput({ content: 'No project open. Open a folder first.', type: 'error' })
      return
    }

    cleanup()
    clearOutput()
    clearErrors()

    // Save all dirty files first
    await saveAllDirty()

    // Compile
    setCompiling(true)
    appendOutput({ content: '⚡ Compiling...', type: 'info' })

    const compileResult = await ipc.java.compile({ projectPath })
    setCompiling(false)

    if (!compileResult.success) {
      setErrors(compileResult.errors)
      appendOutput({ content: `✗ Compilation failed (${compileResult.errors.length} error(s))`, type: 'error' })
      compileResult.errors.forEach(err => {
        appendOutput({
          content: err.filePath
            ? `  ${err.filePath}:${err.line}: ${err.message}`
            : `  ${err.message}`,
          type: 'error',
        })
      })
      return
    }

    appendOutput({ content: '✓ Compilation successful', type: 'success' })

    // Detect main class
    const tab = getActiveTab()
    const className = tab ? detectMainClass(tab.content, tab.name) : 'Main'

    // Run
    setRunning(true)
    appendOutput({ content: `▶ Running ${className}...\n`, type: 'info' })

    unsubStdout.current = ipc.java.onStdout((data) => {
      appendOutput({ content: data, type: 'stdout' })
    })
    unsubStderr.current = ipc.java.onStderr((data) => {
      appendOutput({ content: data, type: 'stderr' })
    })
    unsubExit.current = ipc.java.onExit((code) => {
      setRunning(false)
      cleanup()
      appendOutput({
        content: `\nProcess exited with code ${code}`,
        type: code === 0 ? 'success' : 'error',
      })
    })

    const pid = await ipc.java.run({ projectPath, className })
    setRunning(true, pid)
  }, [projectPath, saveAllDirty, getActiveTab, detectMainClass, setCompiling, setRunning, appendOutput, clearOutput, setErrors, clearErrors])

  const stop = useCallback(async () => {
    if (runningPid) {
      await ipc.java.stop(runningPid)
      setRunning(false)
      appendOutput({ content: '\nProcess terminated by user.', type: 'error' })
    }
  }, [runningPid, setRunning, appendOutput])

  return { run, stop, isCompiling, isRunning }
}
