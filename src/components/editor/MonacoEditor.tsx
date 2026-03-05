import { useRef, useEffect } from 'react'
import Editor, { loader, type Monaco } from '@monaco-editor/react'
import type * as monaco from 'monaco-editor'
import { useThemeStore } from '../../store/themeStore'

// Load Monaco from node_modules
loader.config({
  paths: {
    vs: './node_modules/monaco-editor/min/vs',
  },
})

const CLAUDE_DARK_THEME: monaco.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '6b6456', fontStyle: 'italic' },
    { token: 'keyword', foreground: 'd4a574' },
    { token: 'keyword.control', foreground: 'c8b89a' },
    { token: 'string', foreground: '8fb87a' },
    { token: 'number', foreground: 'a8c0a0' },
    { token: 'type', foreground: 'e0c98a' },
    { token: 'class', foreground: 'e0c98a', fontStyle: 'bold' },
    { token: 'function', foreground: 'b8d4e8' },
    { token: 'variable', foreground: 'f5f0e8' },
    { token: 'operator', foreground: 'a09880' },
    { token: 'delimiter', foreground: '6b6456' },
    { token: 'annotation', foreground: 'd4943a' },
  ],
  colors: {
    'editor.background': '#0d0d0d',
    'editor.foreground': '#f5f0e8',
    'editor.lineHighlightBackground': '#1e1d1c',
    'editor.selectionBackground': '#d4a57433',
    'editor.inactiveSelectionBackground': '#d4a57422',
    'editorLineNumber.foreground': '#3a3630',
    'editorLineNumber.activeForeground': '#a09880',
    'editorCursor.foreground': '#d4a574',
    'editorWhitespace.foreground': '#2a2928',
    'editorIndentGuide.background': '#2a2928',
    'editorIndentGuide.activeBackground': '#3a3630',
    'editorGutter.background': '#0d0d0d',
    'scrollbar.shadow': '#00000000',
    'scrollbarSlider.background': '#3a363066',
    'scrollbarSlider.hoverBackground': '#3a3630aa',
    'scrollbarSlider.activeBackground': '#a09880aa',
    'editorWidget.background': '#1e1d1c',
    'editorSuggestWidget.background': '#1e1d1c',
    'editorSuggestWidget.border': '#3a3630',
    'editorSuggestWidget.selectedBackground': '#2a2928',
    'editorHoverWidget.background': '#1e1d1c',
    'editorHoverWidget.border': '#3a3630',
    'input.background': '#2a2928',
    'input.foreground': '#f5f0e8',
    'input.border': '#3a3630',
    'focusBorder': '#d4a574',
    'contrastBorder': '#3a3630',
    'badge.background': '#d4a57433',
    'badge.foreground': '#d4a574',
    'list.activeSelectionBackground': '#2a2928',
    'list.hoverBackground': '#1e1d1c',
  },
}

const CLAUDE_LIGHT_THEME: monaco.editor.IStandaloneThemeData = {
  base: 'vs',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '8a7a6a', fontStyle: 'italic' },
    { token: 'keyword', foreground: 'b5763a' },
    { token: 'keyword.control', foreground: '9c6a30' },
    { token: 'string', foreground: '4a7c4e' },
    { token: 'number', foreground: '5a7a5a' },
    { token: 'type', foreground: '7a5c1e' },
    { token: 'class', foreground: '7a5c1e', fontStyle: 'bold' },
    { token: 'function', foreground: '3a5f8a' },
    { token: 'variable', foreground: '1a1714' },
    { token: 'operator', foreground: '6b5c4e' },
    { token: 'delimiter', foreground: '8a7a6a' },
    { token: 'annotation', foreground: 'b5763a' },
  ],
  colors: {
    'editor.background': '#faf8f5',
    'editor.foreground': '#1a1714',
    'editor.lineHighlightBackground': '#f2ede6',
    'editor.selectionBackground': '#b5763a33',
    'editor.inactiveSelectionBackground': '#b5763a22',
    'editorLineNumber.foreground': '#c4b8a8',
    'editorLineNumber.activeForeground': '#6b5c4e',
    'editorCursor.foreground': '#b5763a',
    'editorWhitespace.foreground': '#ddd4c5',
    'editorIndentGuide.background': '#ddd4c5',
    'editorIndentGuide.activeBackground': '#c4b8a8',
    'editorGutter.background': '#faf8f5',
    'scrollbar.shadow': '#00000000',
    'scrollbarSlider.background': '#c4b8a866',
    'scrollbarSlider.hoverBackground': '#c4b8a8aa',
    'scrollbarSlider.activeBackground': '#6b5c4eaa',
    'editorWidget.background': '#ffffff',
    'editorSuggestWidget.background': '#ffffff',
    'editorSuggestWidget.border': '#d4c8b8',
    'editorSuggestWidget.selectedBackground': '#f2ede6',
    'editorHoverWidget.background': '#ffffff',
    'editorHoverWidget.border': '#d4c8b8',
    'input.background': '#f2ede6',
    'input.foreground': '#1a1714',
    'input.border': '#d4c8b8',
    'focusBorder': '#b5763a',
    'contrastBorder': '#d4c8b8',
    'badge.background': '#b5763a33',
    'badge.foreground': '#b5763a',
    'list.activeSelectionBackground': '#f2ede6',
    'list.hoverBackground': '#faf8f5',
  },
}

interface MonacoEditorProps {
  tabId: string
  content: string
  language: string
  onChange: (value: string) => void
}

export function MonacoEditor({ tabId, content, language, onChange }: MonacoEditorProps) {
  const monacoRef = useRef<Monaco | null>(null)
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const { theme } = useThemeStore()

  // Switch Monaco theme when app theme changes
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(theme === 'light' ? 'claude-light' : 'claude-dark')
    }
  }, [theme])

  const handleMount = (editor: monaco.editor.IStandaloneCodeEditor, monacoInstance: Monaco) => {
    monacoRef.current = monacoInstance
    editorRef.current = editor

    // Register themes
    monacoInstance.editor.defineTheme('claude-dark', CLAUDE_DARK_THEME)
    monacoInstance.editor.defineTheme('claude-light', CLAUDE_LIGHT_THEME)
    monacoInstance.editor.setTheme(theme === 'light' ? 'claude-light' : 'claude-dark')

    // Java-specific settings
    if (language === 'java') {
      monacoInstance.languages.setLanguageConfiguration('java', {
        wordPattern: /(-?\d*\.\d\w*)|([^`~!@#%^&*()\-=+[{\]}\\|;:'",.<>/?\s]+)/g,
        comments: {
          lineComment: '//',
          blockComment: ['/*', '*/'],
        },
        brackets: [
          ['{', '}'],
          ['[', ']'],
          ['(', ')'],
        ],
        autoClosingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
          { open: '"', close: '"' },
          { open: "'", close: "'" },
        ],
      })
    }

    // Keyboard shortcuts
    editor.addCommand(
      monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyS,
      () => {
        const store = (window as any).__editorStore
        if (store) store.saveFile(tabId)
      }
    )
  }

  return (
    <Editor
      key={tabId}
      defaultValue={content}
      language={language}
      theme="claude-dark"
      onMount={handleMount}
      onChange={(value) => onChange(value || '')}
      options={{
        fontFamily: "'Cascadia Code', 'JetBrains Mono', 'Fira Code', Consolas, monospace",
        fontSize: 14,
        lineHeight: 22,
        fontLigatures: true,
        minimap: { enabled: true, scale: 1 },
        scrollBeyondLastLine: false,
        renderWhitespace: 'boundary',
        wordWrap: 'off',
        bracketPairColorization: { enabled: true },
        guides: { bracketPairs: true, indentation: true },
        smoothScrolling: true,
        cursorSmoothCaretAnimation: 'on',
        cursorBlinking: 'smooth',
        padding: { top: 12, bottom: 12 },
        renderLineHighlight: 'all',
        suggest: {
          showKeywords: true,
          showSnippets: true,
          showMethods: true,
          showFields: true,
          showClasses: true,
        },
        tabSize: 4,
        insertSpaces: true,
        detectIndentation: true,
        quickSuggestions: { other: true, comments: false, strings: false },
        parameterHints: { enabled: true },
        formatOnType: false,
        autoIndent: 'advanced',
        folding: true,
        foldingHighlight: true,
        showFoldingControls: 'mouseover',
        stickyScroll: { enabled: true },
        overviewRulerBorder: false,
        hideCursorInOverviewRuler: true,
      }}
      className="monaco-editor-container"
    />
  )
}
